// controllers/authController.js

const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs"); // Necesario solo para la contraseña por defecto

// 1. Función auxiliar para generar el JWT
const generateToken = (id) => {
  // Usamos el ID del usuario en el token. El JWT_SECRET está en el .env
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d", // El token expirará en 30 días
  });
};

// @desc    Registrar un nuevo usuario
// @route   POST /api/auth/register
// @access  Público
const registerUser = async (req, res) => {
  const { name, email, documentType, documentNumber, role } = req.body;

  // Validación básica de campos
  if (!documentType || !documentNumber) {
    return res
      .status(400)
      .json({ message: "Por favor, ingrese el tipo y número de documento." });
  }

  try {
    // 1. Verificar si el usuario ya existe
    const userExists = await User.findOne({ documentNumber });

    if (userExists) {
      return res
        .status(400)
        .json({
          message: "Ya existe un usuario con este número de documento.",
        });
    }

    // 2. Definir la contraseña por defecto (Número de Documento)
    // La hashearemos aquí, aunque el middleware de Mongoose lo hará automáticamente.
    // Hacemos un hasheo manual solo para este caso, ya que no se proporciona en el body.

    // ¡IMPORTANTE! Mongoose hashea la contraseña en el middleware pre-save (models/User.js).
    // Le pasamos el documentNumber como contraseña (según requisito), y Mongoose la hashea.
    const defaultPassword = documentNumber;

    // 3. Crear el usuario
    const user = await User.create({
      name,
      email,
      documentType,
      documentNumber,
      // Asignamos la contraseña por defecto (luego será hasheada por Mongoose)
      password: defaultPassword,
      // Si se pasa un rol, lo usa. Si no, usa el 'basico' definido en el modelo
      role: role || "invitado",
    });

    if (user) {
      res.status(201).json({
        message: "Registro exitoso.",
        // Devolvemos el token para que el usuario pueda iniciar sesión inmediatamente
        token: generateToken(user._id),
        user: {
          id: user._id,
          documentNumber: user.documentNumber,
          role: user.role,
        },
      });
    } else {
      res.status(400).json({ message: "Datos de usuario inválidos." });
    }
  } catch (error) {
    console.error("Error en el registro:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

// @desc    Autenticar un usuario (Login)
// @route   POST /api/auth/login
// @access  Público
const loginUser = async (req, res) => {
  const { documentNumber, password } = req.body;

  // Validación básica de campos
  if (!documentNumber || !password) {
    return res
      .status(400)
      .json({
        message: "Por favor, ingrese número de documento y contraseña.",
      });
  }

  try {
    // 1. Buscar al usuario por número de documento
    const user = await User.findOne({ documentNumber });

    // 2. Verificar usuario y contraseña
    // matchPassword es el método que definimos en el modelo User.js
    if (user && (await user.matchPassword(password))) {
      res.json({
        message: "Inicio de sesión exitoso.",
        // Devolvemos el token
        token: generateToken(user._id),
        user: {
          id: user._id,
          documentNumber: user.documentNumber,
          role: user.role,
          isPasswordSet: user.isPasswordSet
        },
      });
    } else {
      res
        .status(401)
        .json({
          message: "Credenciales inválidas (Usuario o Contraseña incorrectos).",
        });
    }
  } catch (error) {
    console.error("Error en el login:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
