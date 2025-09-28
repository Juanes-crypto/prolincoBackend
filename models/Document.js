// backend/models/Document.js

const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    // 1. Datos del Archivo
    fileName: { // Nombre original del archivo (ej: Contrato.pdf)
        type: String,
        required: true,
    },
    filePath: { // Ruta donde se guarda el archivo en el servidor (ej: uploads/1000000000-1678888.pdf)
        type: String,
        required: true,
    },
    mimeType: { // Tipo MIME (ej: application/pdf)
        type: String,
        required: true,
    },
    fileSize: { // Tamaño del archivo en bytes
        type: Number,
        required: true,
    },

    // 2. Metadatos del Usuario
    uploadedBy: { // Referencia al usuario que subió el archivo
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    uploaderRole: { // Rol del usuario en el momento de la subida (para historiales)
        type: String,
        required: true,
    },

    // 3. Clasificación/Etiquetas (Opcional, pero útil)
    category: { // Para qué es el archivo (ej: 'Contratos', 'Nómina', 'Soporte')
        type: String,
        default: 'General',
        required: true,
    },
    
    // 4. Fechas
}, {
    timestamps: true // Agrega createdAt y updatedAt
});

const Document = mongoose.model('Document', documentSchema);
module.exports = Document;