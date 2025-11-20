// backend/models/PageContent.js
const mongoose = require('mongoose');

const pageContentSchema = new mongoose.Schema({
    section: { 
        type: String, 
        required: true, 
        unique: true, // Solo un documento de contenido por sección
        enum: ['servicio', 'talento', 'admin', 'organizacional'] 
    },
    
    // Campos de texto flexibles (Map permite añadir campos dinámicamente si crece)
    texts: {
        diagnostic: { type: String, default: '' },
        specificObjective: { type: String, default: '' },
        mission: { type: String, default: '' },
        vision: { type: String, default: '' },
        values: [String] // Para valores corporativos
    },

    lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('PageContent', pageContentSchema);