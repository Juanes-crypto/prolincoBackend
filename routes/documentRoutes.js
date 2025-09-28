// backend/routes/documentRoutes.js

const express = require('express');
const router = express.Router();
const { protect, roleCheck } = require('../middleware/authMiddleware'); // Middleware de autenticación y roles
const upload = require('../middleware/uploadMiddleware'); // Middleware de Multer
const documentController = require('../controllers/documentController');

// Ruta protegida para subir un documento
// Utilizamos 'upload.single('file')' para indicar que se espera un solo archivo
// en el campo del formulario llamado 'file'.
router.post(
    '/upload', 
    protect, 
    upload.single('file'), // Multer se ejecuta aquí, sube el archivo y adjunta 'req.file'
    documentController.uploadDocument
);

router.get(
    '/', 
    protect, 
    roleCheck(['admin', 'talento', 'servicio']), 
    documentController.getDocuments
); 

router.get(
    '/:id/download', 
    protect,
    documentController.downloadDocument
);

router.delete(
    '/:id', 
    protect,
    roleCheck(['admin', 'talento', 'servicio']), // Asegura que solo roles autorizados borren
    documentController.deleteDocument
);
// Aquí puedes añadir más rutas:
// router.get('/', protect, documentController.getDocuments);
// router.get('/:id', protect, documentController.getDocumentById);

module.exports = router;