// backend/controllers/auditController.js

const AuditLog = require('../models/AuditLog');
const asyncHandler = require('express-async-handler');

// @desc    Obtiene todos los logs de auditoría, populando la información del usuario
// @route   GET /api/audit/logs
// @access  Private/Admin
const getAuditLogs = asyncHandler(async (req, res) => {
    // La verificación de rol ('admin') ya fue realizada por roleCheck en la ruta.
    
    try {
        // Obtenemos todos los logs, ordenados por fecha de creación descendente (los más nuevos primero)
        // Usamos populate para traer el nombre del usuario asociado al 'user' ID
        const logs = await AuditLog.find({})
            .sort({ createdAt: -1 }) 
            .populate('user', 'name email documentNumber role') // Solo traemos datos relevantes del usuario
            .limit(100); // Opcional: limitar para no sobrecargar la respuesta si hay millones de logs

        res.status(200).json(logs);

    } catch (error) {
        console.error(`Error al obtener logs de auditoría: ${error.message}`);
        res.status(500).json({ message: 'Error interno al cargar el historial de auditoría.' });
    }
});

module.exports = {
    getAuditLogs,
};