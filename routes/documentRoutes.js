// backend/routes/documentRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { 
    uploadDocument, 
    getDocuments, 
    deleteDocument 
} = require('../controllers/documentController');

// Ruta base: /api/documents

// Listar documentos
router.get('/', protect, getDocuments);

// Subir documento (usamos el middleware 'upload')
router.post('/', protect, upload.single('file'), uploadDocument);

// Eliminar documento
router.delete('/:id', protect, deleteDocument);

module.exports = router;