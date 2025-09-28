// models/Content.js

const mongoose = require('mongoose');

// Sub-Esquema para el Historial de Cambios
const historySchema = new mongoose.Schema({
    field: { type: String, required: true }, // Campo modificado (ej: 'mission', 'diagnostico')
    oldValue: { type: String, required: false }, // Valor anterior (no requerido para enlaces)
    newValue: { type: String, required: true }, // Nuevo valor
    changedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Referencia al modelo User para saber quién cambió
        required: true
    },
    changeDate: {
        type: Date,
        default: Date.now
    }
});

const contentSchema = new mongoose.Schema({
    // Identificador de la sección para facilitar la búsqueda
    section: {
        type: String,
        required: true,
        unique: true,
        enum: ['admin', 'servicio', 'talento', 'organizacional']
    },

    // A. Identidad Organizacional (Sección 'organizacional')
    mission: { type: String, default: '' },
    vision: { type: String, default: '' },
    corporateValues: { type: [String], default: [] }, // Lista de valores corporativos

    // B. Diagnóstico y Objetivo (Secciones 'servicio' y 'admin')
    diagnostic: { type: String, default: '' },
    specificObjective: { type: String, default: '' },

    // C. Herramientas (Enlaces de Drive y WhatsApp)
    tools: [{
        name: { type: String, required: true }, // Nombre de la herramienta (ej: 'Organigrama', 'Volantes digitales')
        type: { type: String, enum: ['drive', 'whatsapp', 'text'], default: 'text' }, // Tipo de enlace
        url: { type: String, default: '' }, // URL del Drive/WhatsApp
    }],

    // D. Historial de Cambios
    history: [historySchema]

}, {
    timestamps: true
});

const Content = mongoose.model('Content', contentSchema);

module.exports = Content;