// backend/controllers/toolController.js
const Tool = require('../models/Tool');
const fs = require('fs');
const path = require('path');
const logAction = require('../utils/auditLogger'); // 👈 IMPORTACIÓN DEL LOGGER

// @desc    Crear una nueva herramienta (Definición)
// @route   POST /api/tools
// @access  Privado (Admin o Roles permitidos)
const createTool = async (req, res) => {
    try {
        const { title, description, section, category, config } = req.body;

        // Validación básica
        if (!title || !section || !category) {
            return res.status(400).json({ message: 'Título, sección y categoría son obligatorios.' });
        }

        const newTool = new Tool({
            title,
            description,
            section,
            category, // Ej: 'Preventa', 'Inducción'
            config: {
                allowsUrl: config.allowsUrl || false,
                allowsFile: config.allowsFile || false
            },
            createdBy: req.user._id
        });

        const savedTool = await newTool.save();

        // 🕵️‍♂️ AUDITORÍA: CREACIÓN
        await logAction(
            req.user, 
            'TOOL_CREATE', 
            `Creó herramienta "${title}" en sección ${section} (Cat: ${category})`, 
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
// @access  Privado
const getToolsBySection = async (req, res) => {
    try {
        const { section } = req.params;
        
        // Buscamos todas las herramientas de esa sección
        const tools = await Tool.find({ section }).sort({ category: 1, createdAt: -1 });

        // Agrupamos por Categoría
        const groupedTools = tools.reduce((acc, tool) => {
            const cat = tool.category;
            if (!acc[cat]) {
                acc[cat] = [];
            }
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
// @access  Privado
const updateToolData = async (req, res) => {
    try {
        const { id } = req.params;
        const { urlValue } = req.body;
        const file = req.file; // Viene de Multer si se subió archivo

        let tool = await Tool.findById(id);

        if (!tool) {
            return res.status(404).json({ message: 'Herramienta no encontrada' });
        }

        let auditDescription = `Actualizó herramienta "${tool.title}"`;

        // 1. Actualizar URL si se envió
        if (tool.config.allowsUrl && urlValue !== undefined) {
            tool.urlValue = urlValue;
            auditDescription += ' (Cambió URL)';
        }

        // 2. Actualizar Archivo si se envió
        if (tool.config.allowsFile && file) {
            // Si ya había un archivo anterior, borrarlo
            if (tool.fileUrl) {
                const oldPath = path.join(__dirname, '..', tool.fileUrl);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath); 
                }
            }

            // Guardar nueva ruta
            tool.fileUrl = `/uploads/${file.filename}`; 
            tool.originalFileName = file.originalname;
            auditDescription += ' (Subió nuevo archivo)';
        }

        const updatedTool = await tool.save();

        // 🕵️‍♂️ AUDITORÍA: ACTUALIZACIÓN
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

        // Borrar archivo físico si existe
        if (tool.fileUrl) {
             const filePath = path.join(__dirname, '..', tool.fileUrl);
             if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        // Guardamos datos para el log antes de borrar
        const toolTitle = tool.title;
        const toolId = tool._id;

        await tool.deleteOne();

        // 🕵️‍♂️ AUDITORÍA: ELIMINACIÓN
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