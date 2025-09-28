// backend/utils/generateToken.js

const jwt = require('jsonwebtoken');

// Función que genera y devuelve el token JWT
const generateToken = (id) => {
    return jwt.sign(
        { id }, 
        process.env.JWT_SECRET, // Usamos la variable de entorno para la clave secreta
        {
            expiresIn: '30d', // El token expira en 30 días
        }
    );
};

module.exports = generateToken;