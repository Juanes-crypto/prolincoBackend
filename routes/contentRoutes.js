// routes/contentRoutes.js

const express = require('express');
const router = express.Router();
const { getContent, updateContent, getHistory } = require('../controllers/contentController');
const { protect, roleCheck } = require('../middleware/authMiddleware');

const adminOnly = ['admin'];

// *** 1. Rutas Específicas (con segmentos fijos) ***

// 1.1 Ruta de Historial (Protegido por Admin)
// GET /api/content/organizacional/history
router.get('/:section/history', protect, roleCheck(adminOnly), getHistory);


// *** 2. Rutas Genéricas (con solo el parámetro :section) ***

// 2.1 Ruta de Edición (Protegido por Admin)
// PUT /api/content/organizacional
router.put('/:section', protect, roleCheck(adminOnly), updateContent);

// 2.2 Rutas de Lectura (Público/Logueado)
// GET /api/content/organizacional (Misión, Visión, Valores, etc.)
router.get('/:section', protect, getContent);


module.exports = router;