// backend/utils/auditLogger.js
const AuditLog = require('../models/AuditLog');

/**
 * Registra una acción en la auditoría
 * @param {Object} user - El objeto usuario completo (req.user)
 * @param {String} actionType - El tipo de acción (Debe estar en el ENUM del modelo)
 * @param {String} description - Descripción legible
 * @param {Object} targetId - (Opcional) ID del objeto afectado
 * @param {Object} req - El objeto request de Express (para sacar la IP)
 */
const logAction = async (user, actionType, description, targetId = null, req = null) => {
    try {
        // Obtener IP (considerando proxies como Render)
        let ip = 'Unknown';
        if (req) {
            ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        }

        await AuditLog.create({
            user: user._id,
            userRole: user.role, // Tu modelo pide esto obligatorio
            actionType: actionType,
            targetId: targetId,
            description: description,
            ipAddress: ip
        });

        console.log(`📝 [AUDIT] ${actionType}: ${description}`);
    } catch (error) {
        console.error("❌ Error guardando log de auditoría:", error.message);
        // No lanzamos el error para no interrumpir la experiencia del usuario
    }
};

module.exports = logAction;