// backend/middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');

// 1. Configuración de Almacenamiento
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        // Sanitizar nombre de archivo para evitar caracteres raros
        const cleanName = file.originalname.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.\-_]/g, '');
        const prefix = req.user ? req.user.documentNumber : 'user';
        cb(null, `${prefix}-${Date.now()}-${cleanName}`);
    }
});

// 2. Filtro de Archivos (ACTUALIZADO PARA EXCEL)
const fileFilter = (req, file, cb) => {
    // Lista blanca de tipos MIME permitidos
    const allowedMimes = [
        'application/pdf', // PDF
        'application/msword', // Word .doc
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // Word .docx
        'application/vnd.ms-excel', // Excel .xls
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // Excel .xlsx
        'text/csv', // CSV
        'application/vnd.ms-powerpoint', // PPT
        'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PPTX
        'image/jpeg',
        'image/png',
        'image/webp'
    ];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        // Opción B: Si quieres permitir TODO, simplemente comenta el if/else y pon cb(null, true);
        console.warn(`⚠️ Archivo bloqueado por tipo: ${file.mimetype}`);
        cb(new Error('Tipo de archivo no soportado. Use PDF, Word, Excel, PowerPoint o Imágenes.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 10 } // Aumenté a 10MB por si los Excel son grandes
});

module.exports = upload;