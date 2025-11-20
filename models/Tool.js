// backend/models/Tool.js
const mongoose = require('mongoose');

const toolSchema = new mongoose.Schema({
    // Título de la herramienta
    title: { type: String, required: true, trim: true },
    
    // Descripción corta
    description: { type: String, default: '' },
    
    // Sección mayor (ej: 'servicio', 'talento', 'admin')
    section: { 
        type: String, 
        required: true, 
        enum: ['servicio', 'talento', 'admin', 'organizacional'] 
    },

    // Fase o Categoría Dinámica (ej: 'Preventa', 'Venta', 'Inducción')
    // El usuario escribirá esto o lo seleccionará de una lista existente
    category: { type: String, required: true, trim: true },

    // Configuración de qué acepta esta herramienta (Checkbox del formulario)
    config: {
        allowsUrl: { type: Boolean, default: false },
        allowsFile: { type: Boolean, default: false }
    },

    // Los datos reales
    urlValue: { type: String, default: '' },
    fileUrl: { type: String, default: '' }, // Ruta del archivo subido
    originalFileName: { type: String, default: '' },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }

}, { timestamps: true });

module.exports = mongoose.model('Tool', toolSchema);