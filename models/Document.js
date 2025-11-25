// backend/models/Document.js
const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    // Nombre original del archivo (ej: "Nomina_Agosto.pdf")
    originalName: { 
        type: String, 
        required: true 
    },
    // Nombre guardado en disco (ej: "12345-1715623.pdf")
    filename: { 
        type: String, 
        required: true 
    },
    // Ruta relativa para acceder
    path: { 
        type: String, 
        required: true 
    },
    // Tipo de archivo (pdf, excel, img)
    mimetype: { 
        type: String, 
        required: true 
    },
    // Tamaño en bytes
    size: { 
        type: Number, 
        required: true 
    },
    // Usuario que lo subió
    uploadedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    // Categoría (opcional, por si quieres filtrar en el gestor de archivos)
    category: {
        type: String,
        default: 'General'
    }
}, { timestamps: true });

// 🚀 OPTIMIZACIÓN: Índices para queries rápidas
documentSchema.index({ uploadedBy: 1 }); // Filtrar por usuario
documentSchema.index({ createdAt: -1 }); // Ordenar por fecha (más reciente primero)
documentSchema.index({ category: 1 }); // Filtrar por categoría
documentSchema.index({ originalName: 'text' }); // Búsqueda de texto

module.exports = mongoose.model('Document', documentSchema);