// backend/routes/contentRoutes.js - VERSIÓN CORREGIDA COMPLETA

const express = require('express');
const router = express.Router();
const { getContent, updateContent, getHistory, updateToolUrl } = require('../controllers/contentController');
const { protect, roleCheck } = require('../middleware/authMiddleware');

// *** 1. Ruta de Historial (Protegido por Admin) ***
// GET /api/content/organizacional/history
router.get('/:section/history', protect, roleCheck(['admin']), getHistory);

// *** 2. Ruta de actualización de herramientas (con permisos por sección) ***
// PUT /api/content/admin/tool/Marco%20Legal
router.put('/:section/tool/:toolName', protect, (req, res, next) => {
    const { section } = req.params;
    const userRole = req.user.role;

    console.log(`🔧 Ruta tool llamada: section=${section}, toolName=${req.params.toolName}, userRole=${userRole}`);

    // 🌟 PERMISOS CORREGIDOS - igual que en updateContent
    const sectionPermissions = {
        'admin': ['admin'],
        'talento': ['admin', 'talento'],
        'servicio': ['admin', 'servicio'],
        'organizacional': ['admin']
    };

    // Verificar si la sección existe
    if (!sectionPermissions[section]) {
        console.log(`❌ Sección no permitida: ${section}`);
        return res.status(404).json({ message: 'Sección no válida.' });
    }

    // Verificar permisos
    if (!sectionPermissions[section].includes(userRole)) {
        console.log(`❌ Permiso denegado: ${userRole} no puede editar ${section}`);
        return res.status(403).json({
            message: `Permiso denegado. No tienes autorización para editar herramientas en la sección ${section}.`
        });
    }
    
    console.log(`✅ Permiso concedido para ${userRole} en ${section}`);
    next();
}, updateToolUrl);

// *** 3. Ruta de Edición General (Permisos por sección) ***
// PUT /api/content/organizacional
router.put('/:section', protect, (req, res, next) => {
    const { section } = req.params;
    const userRole = req.user.role;

    console.log(`📝 Ruta updateContent llamada: section=${section}, userRole=${userRole}`);

    // Definir permisos específicos por sección
    const sectionPermissions = {
        'admin': ['admin'],
        'talento': ['admin', 'talento'],
        'servicio': ['admin', 'servicio'],
        'organizacional': ['admin']
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

// *** 4. Rutas de Lectura (Público/Logueado) ***
// GET /api/content/organizacional (Misión, Visión, Valores, etc.)
router.get('/:section', protect, getContent);

module.exports = router;