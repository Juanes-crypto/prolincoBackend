// backend/controllers/pageContentController.js
const PageContent = require('../models/PageContent');

// @desc    Obtener contenido de texto de una sección (Diagnóstico, Misión, etc.)
// @route   GET /api/page-content/:section
const getPageContent = async (req, res) => {
    try {
        const { section } = req.params;
        
        let content = await PageContent.findOne({ section });
        
        // Si no existe, devolvemos un objeto vacío pero válido
        if (!content) {
            return res.json({ texts: {} });
        }

        res.json(content);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener contenido' });
    }
};

// @desc    Actualizar textos (Diagnóstico, Objetivo, etc.)
// @route   PUT /api/page-content/:section
const updatePageContent = async (req, res) => {
    try {
        const { section } = req.params;
        const { field, value } = req.body; // Esperamos { field: 'diagnostic', value: 'Texto...' }

        let content = await PageContent.findOne({ section });

        if (!content) {
            // Si no existe, lo creamos
            content = new PageContent({
                section,
                texts: {}
            });
        }

        // Actualizamos el campo específico dentro del mapa 'texts'
        // Mongoose Map: content.texts.set(key, value) o objeto directo si definimos esquema fijo
        // En nuestro modelo PageContent definimos texts como objeto con campos:
        content.texts[field] = value;
        content.lastUpdatedBy = req.user._id;

        await content.save();

        res.json(content);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar contenido' });
    }
};

module.exports = {
    getPageContent,
    updatePageContent
};