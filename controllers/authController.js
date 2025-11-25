// backend/controllers/authController.js
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const logAction = require('../utils/auditLogger');
const AuthService = require('../services/authService'); // 🚀 OPTIMIZACIÓN: Service layer

// Generar Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Registrar usuario
// @route   POST /api/auth/register
// 🚀 OPTIMIZACIÓN: Validación temprana y delegación a service
const register = async (req, res) => {
  const { name, email, documentType, documentNumber, role } = req.body;

  // Validación temprana (sin consultar DB)
  if (!name || !email || !documentType || !documentNumber) {
    return res.status(400).json({ message: "Todos los campos son obligatorios." });
  }

  try {
    // 1. Verificar duplicados usando service
    const exists = await AuthService.userExists(email, documentNumber);
    if (exists) {
      return res.status(400).json({ message: "El usuario ya existe (email o documento duplicado)." });
    }

    // 2. Crear usuario
    const user = await AuthService.createUser({ name, email, documentType, documentNumber, role });

    if (user) {
      // Auditoría
      await logAction(user, 'USER_CREATE', `Registro público: ${user.name}`, user._id, req);

      res.status(201).json({
        message: "Usuario registrado. Debe cambiar contraseña.",
        token: generateToken(user._id),
        user: AuthService.formatUserResponse(user)
      });
    } else {
      res.status(400).json({ message: "Datos inválidos." });
    }
  } catch (error) {
    console.error("Error registro:", error);
    res.status(500).json({ message: "Error del servidor: " + error.message });
  }
};

// @desc    Login
// @route   POST /api/auth/login
// 🚀 OPTIMIZACIÓN: Validación temprana y service layer
const login = async (req, res) => {
  const { documentNumber, password } = req.body;

  // Validación temprana
  if (!documentNumber || !password) {
    return res.status(400).json({ message: "Ingrese documento y contraseña." });
  }

  try {
    const user = await AuthService.findUserByDocument(documentNumber);

    if (user && (await user.matchPassword(password))) {
      await logAction(user, 'LOGIN', `Login exitoso: ${user.name}`, user._id, req);

      res.json({
        message: "Login exitoso.",
        token: generateToken(user._id),
        user: AuthService.formatUserResponse(user)
      });
    } else {
      res.status(401).json({ message: "Credenciales incorrectas." });
    }
  } catch (error) {
    console.error("Error login:", error);
    res.status(500).json({ message: "Error del servidor." });
  }
};

// @desc    Cambiar Contraseña
// @route   PUT /api/auth/change-password
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body; 
        const user = await User.findById(req.user._id);

        if (user && (await user.matchPassword(currentPassword))) {
            user.password = newPassword;
            user.isPasswordSet = true;
            await user.save();

            await logAction(user, 'PASS_CHANGE', `Cambio de contraseña`, user._id, req);
            res.json({ message: "Contraseña actualizada." });
        } else {
            res.status(401).json({ message: "La contraseña actual no coincide." });
        }
    } catch (error) {
        res.status(500).json({ message: "Error al cambiar contraseña." });
    }
};

module.exports = { register, login, changePassword };