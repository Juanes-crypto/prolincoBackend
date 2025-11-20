// backend/routes/toolRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Tu middleware existente
const { 
    createTool, 
    getToolsBySection, 
    updateToolData, 
    deleteTool 
} = require('../controllers/toolController');

// Rutas base: /api/tools

// 1. Crear nueva herramienta (Configuración)
router.post('/', protect, createTool);

// 2. Obtener herramientas de una sección (ej: /api/tools/servicio)
router.get('/:section', protect, getToolsBySection);

// 3. Actualizar datos de la herramienta (URL o Subir Archivo)
// Usamos 'upload.single' para procesar el archivo si viene uno
router.put('/:id/data', protect, upload.single('file'), updateToolData);

// 4. Eliminar herramienta
router.delete('/:id', protect, deleteTool);

module.exports = router;