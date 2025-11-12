// middleware/authMiddleware.js

const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Necesitamos el modelo de usuario para buscarlo

// 1. Middleware de protección principal (Autenticación)
const protect = async (req, res, next) => {
  let token;

  // 1.1. Buscar el token en los encabezados de la solicitud (Bearer Token)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Obtener el token de la cadena "Bearer <token>"
      token = req.headers.authorization.split(" ")[1];

      // 1.2. Verificar el token con el secreto
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 1.3. Obtener el usuario del token (excluyendo la contraseña)
      // Esto adjunta el objeto 'user' a la solicitud (req.user)
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res
          .status(401)
          .json({ message: "Token inválido, usuario no encontrado." });
      }

      next(); // Continuar con el siguiente middleware o la función del controlador
    } catch (error) {
      console.error(`Error de autenticación JWT: ${error.message}`);
      return res
        .status(401)
        .json({ message: "No autorizado, token fallido o expirado." });
    }
  }

  // Si no hay token
  if (!token) {
    return res
      .status(401)
      .json({ message: "No autorizado, no se encontró token." });
  }
};

// 2. Middleware de protección de roles (Autorización)
// Recibe un array de roles permitidos (ej: ['admin', 'servicio'])
const roleCheck = (roles) => {
  return (req, res, next) => {
    // Asume que 'protect' ya se ejecutó y adjuntó el usuario (req.user)
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Acceso denegado. Se requiere rol de ${roles.join(' o ')} para esta acción.`,
      });
    }
    next();
  };
};

module.exports = { protect, roleCheck };
   