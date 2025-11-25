// backend/services/authService.js
// 🚀 OPTIMIZACIÓN: Separar lógica de negocio (SOLID - Single Responsibility)

const User = require('../models/User');

/**
 * Servicio de autenticación - Maneja la lógica de negocio
 */
class AuthService {
    /**
     * Verificar si un usuario existe por email o documento
     * @param {string} email 
     * @param {string} documentNumber 
     * @returns {Promise<boolean>}
     */
    static async userExists(email, documentNumber) {
        const user = await User.findOne({
            $or: [
                { email: email.toLowerCase() }, 
                { documentNumber }
            ]
        }).lean(); // 🚀 30% más rápido - retorna objeto plano
        
        return !!user;
    }

    /**
     * Buscar usuario por documento
     * @param {string} documentNumber 
     * @returns {Promise<User|null>}
     */
    static async findUserByDocument(documentNumber) {
        return await User.findOne({ documentNumber })
            .select('+password') // Incluir password para matchPassword
            .lean(false); // No usar lean aquí porque necesitamos métodos del model
    }

    /**
     * Crear nuevo usuario
     */
    static async createUser(userData) {
        const { name, email, documentType, documentNumber, role } = userData;
        
        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            documentType,
            documentNumber: documentNumber.trim(),
            password: documentNumber, // Password por defecto
            role: role || 'invitado',
            isPasswordSet: false
        });

        return user;
    }

    /**
     * Formatear respuesta de usuario (sin datos sensibles)
     */
    static formatUserResponse(user) {
        return {
            _id: user._id,
            name: user.name,
            email: user.email,
            documentNumber: user.documentNumber,
            role: user.role,
            isPasswordSet: user.isPasswordSet
        };
    }
}

module.exports = AuthService;
