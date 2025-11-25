// backend/middleware/uploadMiddleware.js
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        // 1. Extraer la extensión original (ej: pdf, xlsx, docx)
        const ext = file.originalname.split('.').pop();
        // 2. Limpiar el nombre del archivo
        const name = file.originalname.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_');
        
        return {
            folder: 'prolinco_uploads',
            
            // 🌟 SOLUCIÓN FINAL: FORZAR 'raw' PARA TODO
            // Esto evita que Cloudinary intente procesar PDFs como imágenes (causa del error 401)
            resource_type: 'raw', 
            
            // 🔓 INTENTO DE OVERRIDE: Forzar acceso público explícito
            access_mode: 'public',
            
            // 🌟 CRÍTICO: Incluir la extensión manualmente en el nombre
            // Sin esto, el archivo se baja sin extensión y la PC no sabe con qué abrirlo
            public_id: `${Date.now()}-${name}.${ext}`
        };
    },
});

const fileFilter = (req, file, cb) => {
    const allowedMimes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // Word
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // Excel
        'text/csv',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'image/jpeg',
        'image/png',
        'image/webp'
    ];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de archivo no soportado.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

module.exports = upload;