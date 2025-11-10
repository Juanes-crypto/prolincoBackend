// routes/contentRoutes.js

const express = require('express');
const router = express.Router();
const { getContent, updateContent, getHistory, updateToolUrl } = require('../controllers/contentController');
const { protect, roleCheck } = require('../middleware/authMiddleware');

// *** 1. Rutas Específicas (con segmentos fijos) ***

// 1.1 Ruta de Historial (Protegido por Admin)
// GET /api/content/organizacional/history
router.get('/:section/history', protect, roleCheck(['admin']), getHistory);

// *** 2. Rutas Genéricas (con solo el parámetro :section) ***

// 2.1 Ruta de Edición (Permisos por sección)
// PUT /api/content/organizacional
router.put('/:section', protect, (req, res, next) => {
    const { section } = req.params;
    const userRole = req.user.role;

    // Definir permisos específicos por sección
    const sectionPermissions = {
        'admin': ['admin'],
        'talento': ['admin', 'talento'],
        'servicio': ['admin', 'servicio'],
        'organizacional': ['admin'] // Solo admin para identidad organizacional
    };

    // Verificar si la sección existe
    if (!sectionPermissions[section]) {
        return res.status(404).json({ message: 'Sección no válida.' });
    }

    // Verificar permisos
    if (!sectionPermissions[section].includes(userRole)) {
        return res.status(403).json({
            message: `Permiso denegado. No tienes autorización para editar la sección ${section}.`
        });
    }

    next();
}, updateContent);

// 2.2 Ruta de actualización de herramientas (Solo Admin)
// PUT /api/content/admin/tool/Marco Legal
router.put('/:section/tool/:toolName', protect, roleCheck(['admin']), updateToolUrl);

// 2.3 Rutas de Lectura (Público/Logueado)
// GET /api/content/organizacional (Misión, Visión, Valores, etc.)
router.get('/:section', protect, getContent);

module.exports = router;
