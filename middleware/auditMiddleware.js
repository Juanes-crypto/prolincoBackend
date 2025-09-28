// backend/middleware/auditMiddleware.js

const AuditLog = require('../models/AuditLog');

/**
 * Registra una acción de auditoría en la base de datos.
 * @param {Object} req - Objeto de solicitud de Express (para obtener user y IP).
 * @param {string} actionType - Tipo de acción (e.g., 'USER_CREATE').
 * @param {string} description - Descripción de la acción.
 * @param {string} [targetId=null] - ID del objeto afectado (opcional).
 */
const logAuditAction = async (req, actionType, description, targetId = null) => {
    try {
        // Aseguramos que haya un usuario autenticado para registrar la acción
        const user = req.user ? req.user._id : null;
        const userRole = req.user ? req.user.role : 'GUEST'; // Si no hay usuario, es un invitado o error

        // Obtener la IP del cliente (maneja proxies si están configurados)
        const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        if (!user || userRole === 'GUEST') {
             // Si no hay un usuario autenticado, solo registramos si es un intento de LOGIN/LOGOUT
             if (actionType !== 'LOGIN' && actionType !== 'LOGOUT') {
                 console.warn(`[AUDIT WARNING] Intento de loguear acción sin usuario autenticado: ${actionType}`);
                 return; // No registramos acciones internas sin user
             }
        }
        
        const logEntry = new AuditLog({
            user: user,
            userRole: userRole,
            actionType,
            description,
            targetId,
            ipAddress,
        });

        await logEntry.save();
        
    } catch (error) {
        console.error(`[AUDIT ERROR] Fallo al guardar el log de auditoría: ${error.message}`);
        // No lanzamos error aquí, para no detener la operación principal del servidor
    }
};

module.exports = { logAuditAction };