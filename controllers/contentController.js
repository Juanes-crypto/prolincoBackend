// controllers/contentController.js

const Content = require('../models/Content');
const User = require('../models/User'); // Para el historial

// Función auxiliar para inicializar el contenido si no existe
const initializeContent = async (section, defaultData = {}) => {
    let content = await Content.findOne({ section });
    if (!content) {
        content = await Content.create({ section, ...defaultData });
    }
    return content;
};

// @desc    Obtener contenido de una sección
// @route   GET /api/content/:section
// @access  Público (cualquier usuario logueado puede leer)
const getContent = async (req, res) => {
    const { section } = req.params;
    
    // Lista de secciones válidas
    const validSections = ['admin', 'servicio', 'talento', 'organizacional'];

    if (!validSections.includes(section)) {
        return res.status(404).json({ message: 'Sección no válida.' });
    }

    try {
        const content = await Content.findOne({ section }).select('-history'); // Excluimos el historial para el GET normal
        
        // Si no existe, lo creamos con valores por defecto
        if (!content) {
            return res.json(await initializeContent(section));
        }

        res.json(content);
    } catch (error) {
        console.error('Error al obtener contenido:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener contenido.' });
    }
};

// @desc    Actualizar contenido de una sección
// @route   PUT /api/content/:section
// @access  Privado (Solo admin o roles específicos)
const updateContent = async (req, res) => {
    const { section } = req.params;
    const updates = req.body;
    const userId = req.user._id; // Obtenido del token por el middleware 'protect'
    const userRole = req.user.role;

    // Solo el rol 'admin' puede editar inicialmente
    if (userRole !== 'admin') {
        return res.status(403).json({ message: 'Permiso denegado. Solo administradores pueden editar el contenido estratégico.' });
    }

    try {
        let content = await Content.findOne({ section });

        if (!content) {
             content = await initializeContent(section);
        }

        const historyRecords = [];

        // Lógica de actualización y registro de historial
        for (const [key, newValue] of Object.entries(updates)) {
            if (key in content && JSON.stringify(content[key]) !== JSON.stringify(newValue)) {
                
                // Si es un campo simple o array de strings
                let oldValue = content[key];
                
                // Actualizar el valor
                content[key] = newValue;
                
                // Registrar el cambio
                historyRecords.push({
                    field: key,
                    oldValue: (typeof oldValue === 'object' ? JSON.stringify(oldValue) : String(oldValue)),
                    newValue: (typeof newValue === 'object' ? JSON.stringify(newValue) : String(newValue)),
                    changedBy: userId,
                });
            }
        }
        
        // Guardar los registros de historial en el documento
        if (historyRecords.length > 0) {
            content.history.push(...historyRecords);
        }

        await content.save();
        
        res.json({ 
            message: `Contenido de ${section} actualizado correctamente.`,
            content: content
        });

    } catch (error) {
        console.error('Error al actualizar contenido:', error);
        res.status(500).json({ message: 'Error interno del servidor al actualizar contenido.' });
    }
};

// @desc    Obtener historial de una sección
// @route   GET /api/content/:section/history
// @access  Privado (Solo admin)
const getHistory = async (req, res) => {
    const { section } = req.params;
    const userRole = req.user.role;

    if (userRole !== 'admin') {
        return res.status(403).json({ message: 'Permiso denegado. Solo administradores pueden ver el historial.' });
    }

    try {
        const content = await Content.findOne({ section })
            .populate({
                path: 'history.changedBy',
                model: 'User',
                select: 'documentNumber role' // Solo mostramos estos campos del usuario
            });

        if (!content) {
            return res.status(404).json({ message: 'Contenido no encontrado para esta sección.' });
        }

        // Devolvemos el historial ordenado por fecha descendente
        res.json(content.history.sort((a, b) => b.changeDate - a.changeDate));
        
    } catch (error) {
        console.error('Error al obtener historial:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener historial.' });
    }
};

module.exports = {
    getContent,
    updateContent,
    getHistory
};