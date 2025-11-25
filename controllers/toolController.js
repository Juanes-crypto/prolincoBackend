// backend/controllers/toolController.js
const Tool = require('../models/Tool');
// const fs = require('fs'); // Ya no necesitamos fs para Cloudinary
// const path = require('path'); // Ya no necesitamos path para Cloudinary
const logAction = require('../utils/auditLogger');

// @desc    Crear una nueva herramienta (Definición)
// @route   POST /api/tools
const createTool = async (req, res) => {
    try {
        const { title, description, section, category, config } = req.body;

        if (!title || !section || !category) {
            return res.status(400).json({ message: 'Título, sección y categoría son obligatorios.' });
        }

        const newTool = new Tool({
            title,
            description,
            section,
            category,
            config: {
                allowsUrl: config.allowsUrl || false,
                allowsFile: config.allowsFile || false
            },
            createdBy: req.user._id
        });

        const savedTool = await newTool.save();

        await logAction(
            req.user, 
            'TOOL_CREATE', 
            `Creó herramienta "${title}" en sección ${section}`, 
            savedTool._id, 
            req
        );

        res.status(201).json(savedTool);

    } catch (error) {
        console.error('Error creando herramienta:', error);
        res.status(500).json({ message: 'Error al crear la herramienta.' });
    }
};

// @desc    Obtener herramientas por sección
// @route   GET /api/tools/:section
const getToolsBySection = async (req, res) => {
    try {
        const { section } = req.params;
        const tools = await Tool.find({ section }).sort({ category: 1, createdAt: -1 });

        const groupedTools = tools.reduce((acc, tool) => {
            const cat = tool.category;
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(tool);
            return acc;
        }, {});

        res.json(groupedTools);

    } catch (error) {
        console.error('Error obteniendo herramientas:', error);
        res.status(500).json({ message: 'Error al obtener herramientas.' });
    }
};

// @desc    Actualizar el CONTENIDO de la herramienta (URL o Archivo)
// @route   PUT /api/tools/:id/data
const updateToolData = async (req, res) => {
    try {
        const { id } = req.params;
        const { urlValue } = req.body;
        const file = req.file; 

        let tool = await Tool.findById(id);

        if (!tool) {
            return res.status(404).json({ message: 'Herramienta no encontrada' });
        }

        let auditDescription = `Actualizó herramienta "${tool.title}"`;

        // 1. Actualizar URL Manual (Si el usuario escribió un link)
        // 🛑 CORRECCIÓN: Antes validabas 'file' aquí por error. Ahora validamos 'urlValue'.
        if (tool.config.allowsUrl && urlValue !== undefined) {
            tool.urlValue = urlValue;
            auditDescription += ' (Cambió URL)';
        }

        // 2. Actualizar Archivo (Si el usuario subió uno)
        if (tool.config.allowsFile && file) {
            // 🌟 CORRECCIÓN FINAL:
            // Guardamos DIRECTAMENTE la ruta de Cloudinary.
            // Eliminamos toda la lógica vieja de '/uploads/' y 'fs.unlink'.
            
            tool.fileUrl = file.path; // URL completa (https://res.cloudinary...)
            tool.originalFileName = file.originalname;
            
            auditDescription += ' (Subió nuevo archivo)';
        }

        const updatedTool = await tool.save();

        await logAction(
            req.user, 
            'TOOL_UPDATE', 
            auditDescription, 
            tool._id, 
            req
        );

        res.json(updatedTool);

    } catch (error) {
        console.error('Error actualizando herramienta:', error);
        res.status(500).json({ message: 'Error al actualizar la herramienta.' });
    }
};

// @desc    Eliminar una herramienta
// @route   DELETE /api/tools/:id
const deleteTool = async (req, res) => {
    try {
        const { id } = req.params;
        const tool = await Tool.findById(id);

        if (!tool) return res.status(404).json({ message: 'No encontrado' });

        // Nota: No borramos de Cloudinary por API para mantenerlo simple,
        // pero ya no intentamos borrar de disco local (fs) para evitar errores.

        const toolTitle = tool.title;
        const toolId = tool._id;

        await tool.deleteOne();

        await logAction(
            req.user, 
            'TOOL_DELETE', 
            `Eliminó herramienta "${toolTitle}"`, 
            toolId, 
            req
        );

        res.json({ message: 'Herramienta eliminada' });

    } catch (error) {
        res.status(500).json({ message: 'Error eliminando herramienta' });
    }
};

module.exports = {
    createTool,
    getToolsBySection,
    updateToolData,
    deleteTool
};