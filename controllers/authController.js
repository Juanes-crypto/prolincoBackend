// backend/controllers/authController.js
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const logAction = require('../utils/auditLogger'); // Usamos el logger nuevo que sí funciona

// Generar Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Registrar usuario (Lógica Antigua Restaurada)
// @route   POST /api/auth/register
const register = async (req, res) => {
  // NOTA: En tu versión vieja no pedías 'position' ni 'area', así que los quitamos para evitar líos
  const { name, email, documentType, documentNumber, role } = req.body;

  if (!name || !email || !documentType || !documentNumber) {
    return res.status(400).json({ message: "Todos los campos son obligatorios." });
  }

  try {
    // 1. Verificar duplicados
    const userExists = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { documentNumber }]
    });

    if (userExists) {
      return res.status(400).json({ message: "El usuario ya existe (email o documento duplicado)." });
    }

    // 2. Contraseña por defecto = Número de Documento
    const defaultPassword = documentNumber;

    // 3. Crear usuario
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      documentType,
      documentNumber: documentNumber.trim(),
      password: defaultPassword, // Se encripta en el modelo automáticamente
      role: role || "invitado",
      isPasswordSet: false // 🚨 IMPORTANTE: Marca que debe cambiar contraseña
    });

    if (user) {
      // Auditoría
      await logAction(user, 'USER_CREATE', `Registro público: ${user.name}`, user._id, req);

      res.status(201).json({
        message: "Usuario registrado. Debe cambiar contraseña.",
        token: generateToken(user._id),
        user: {
          _id: user._id, // OJO: El frontend suele buscar _id
          name: user.name,
          documentNumber: user.documentNumber,
          role: user.role,
          isPasswordSet: user.isPasswordSet, // Vital para la redirección
        },
      });
    } else {
      res.status(400).json({ message: "Datos inválidos." });
    }
  } catch (error) {
    console.error("Error registro:", error);
    res.status(500).json({ message: "Error del servidor: " + error.message });
  }
};

// @desc    Login (Lógica Antigua Restaurada)
// @route   POST /api/auth/login
const login = async (req, res) => {
  const { documentNumber, password } = req.body;

  if (!documentNumber || !password) {
    return res.status(400).json({ message: "Ingrese documento y contraseña." });
  }

  try {
    const user = await User.findOne({ documentNumber });

    if (user && (await user.matchPassword(password))) {
      
      await logAction(user, 'LOGIN', `Login exitoso: ${user.name}`, user._id, req);

      res.json({
        message: "Login exitoso.",
        token: generateToken(user._id),
        user: { // Estructura plana para facilitar el frontend
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            documentNumber: user.documentNumber,
            isPasswordSet: user.isPasswordSet // Vital
        }
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
        // El middleware 'protect' ya puso el usuario en req.user
        const { currentPassword, newPassword } = req.body; 
        const user = await User.findById(req.user._id);

        // Validar contraseña actual (que es el documento al principio)
        // En tu versión antigua solo pedías la nueva, pero por seguridad pidamos la actual también
        // o si prefieres la versión antigua, quita esta validación:
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