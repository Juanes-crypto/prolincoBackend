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

module.exports = mongoose.model('Document', documentSchema);