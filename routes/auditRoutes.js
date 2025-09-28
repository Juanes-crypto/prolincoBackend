// backend/routes/auditRoutes.js

const express = require('express');
const { getAuditLogs } = require('../controllers/auditController');
const { protect, roleCheck } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/audit/logs
// @desc    Obtener todos los logs de auditoría (solo Admin)
// @access  Private/Admin
router.get(
    '/logs', 
    protect, 
    roleCheck(['admin']), // 🔒 Solo el rol 'admin' puede ver los logs
    getAuditLogs
);

module.exports = router;