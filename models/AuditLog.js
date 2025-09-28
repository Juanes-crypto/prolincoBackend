// backend/models/AuditLog.js

const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    // 1. Quién hizo la acción
    user: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    userRole: { // Rol del usuario al momento de la acción
        type: String,
        required: true,
    },

    // 2. Qué se hizo
    actionType: { // Ejemplo: 'LOGIN', 'LOGOUT', 'USER_CREATE', 'DOC_DELETE', 'PASS_CHANGE'
        type: String,
        required: true,
        enum: ['LOGIN', 'LOGOUT', 'USER_CREATE', 'USER_UPDATE', 'USER_DELETE', 'DOC_UPLOAD', 'DOC_DELETE', 'PASS_CHANGE', 'ROLE_CHANGE'],
    },
    
    // 3. Sobre qué se actuó
    targetId: { // ID del objeto afectado (ej: el ID del documento borrado, o el ID del usuario modificado)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Puede referenciar a User, Document, o lo que sea necesario
        default: null,
    },
    
    // 4. Descripción y metadata adicional
    description: { // Descripción legible para humanos (ej: "Usuario Juan Pérez creó el archivo Contrato.pdf")
        type: String,
        required: true,
    },
    ipAddress: { // Dirección IP desde donde se realizó la acción
        type: String,
    },
}, {
    timestamps: true // Agrega createdAt (cuándo ocurrió) y updatedAt
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
module.exports = AuditLog;