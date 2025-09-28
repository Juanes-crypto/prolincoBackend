// backend/middleware/uploadMiddleware.js

const multer = require('multer');
const path = require('path');

// 1. Configuración de Almacenamiento (Storage)
const storage = multer.diskStorage({
    // Definimos el destino de los archivos
    destination: (req, file, cb) => {
        // La ruta 'uploads' debe ser relativa a donde se ejecuta el script (tu carpeta backend)
        cb(null, 'uploads/'); 
    },
    // Definimos cómo se llamará el archivo
    filename: (req, file, cb) => {
        // Generamos un nombre único para evitar conflictos:
        // documentType-documentNumber-timestamp.extension
        
        // Asumiremos que el usuario ya está autenticado (req.user existe)
        const documentNumber = req.user.documentNumber || 'unknown'; 
        const documentType = file.mimetype.split('/')[1] || 'file'; // Obtener la extensión del MIME type

        cb(null, `${documentNumber}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

// 2. Configuración de Filtro (Filtro para tipos de archivo permitidos)
const fileFilter = (req, file, cb) => {
    // Aceptar solo PDF, Word y archivos de imagen comunes
    if (
        file.mimetype === 'application/pdf' ||
        file.mimetype === 'application/msword' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || // DOCX
        file.mimetype.startsWith('image/')
    ) {
        cb(null, true); // Aceptar el archivo
    } else {
        cb(new Error('Tipo de archivo no permitido. Solo se aceptan documentos (PDF, DOC/X) e imágenes.'), false);
    }
};

// 3. Inicializar la configuración de Multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5 // Límite de 5 Megabytes (MB)
    }
});

// Exportar la configuración para usarla en las rutas
module.exports = upload;