// backend/controllers/userController.js

const User = require('../models/User.js');
const asyncHandler = require('express-async-handler'); // Para manejar excepciones de forma asíncrona
const generateToken = require('../utils/generateToken'); // Función para generar JWT
const { logAuditAction } = require('../middleware/auditMiddleware'); // ✅ AUDITORÍA

// Función auxiliar para obtener la etiqueta de rol
const getRoleLabel = (role) => {
    switch (role) {
        case 'admin':
            return 'Administrador (Total)';
        case 'talento':
            return 'Talento Humano';
        case 'servicio':
            return 'Servicio al Cliente';
        case 'invitado':
            return 'Invitado (Solo Ver)';
        default:
            return role;
    }
};

// @desc    Autenticar usuario / Iniciar sesión
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        
        // ✅ AUDITORÍA: LOGIN EXITOSO
        logAuditAction(req, 'LOGIN', `Inicio de sesión exitoso para el usuario: ${user.name} (${user.email}).`, user._id);
        
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            documentNumber: user.documentNumber,
            isPasswordSet: user.isPasswordSet,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'Email o contraseña incorrectos' });
    }
});

// @desc    Registrar un nuevo usuario
// @route   POST /api/users
// @access  Private/Admin
const registerUser = asyncHandler(async (req, res) => {
    // ⚠️ ¡IMPORTANTE! Asegúrate de NO incluir documentType en la desestructuración si no lo usas,
    // o inclúyelo si debe ser parte del body para la creación.
    const { name, email, password, documentType, documentNumber, role } = req.body; 

    // 1. Validar si el usuario ya existe
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('El usuario ya existe');
    }

    // 2. Preparar los campos del nuevo usuario
    const userFields = {
        name,
        email,
        documentType, // Asumiendo que documentType viene en el req.body
        documentNumber,
        role: role || 'invitado',
        // isPasswordSet: false es por defecto en el modelo
    };

    // 🌟 AJUSTE CRUCIAL: SOLO agregar la contraseña si existe 🌟
    // Esto evita que el middleware de pre('save') intente hashear un valor nulo/vacío
    if (password) {
        userFields.password = password;
    }
    // Si no hay password, isPasswordSet será false (por defecto) y password será null/undefined.


    // 3. Crear el usuario
    const user = await User.create(userFields); // Usamos el objeto userFields

    if (user) {
        // ✅ AUDITORÍA: USUARIO CREADO
        logAuditAction(req, 'USER_CREATE', `Usuario creado: ${user.name} (${user.email}) con rol: ${user.role}.`, user._id);
        
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            documentNumber: user.documentNumber,
            role: user.role,
            isPasswordSet: user.isPasswordSet,
            // ⚠️ Importante: Nunca envíes el password hasheado o el documentoType a menos que sea necesario
            message: `Usuario ${user.name} creado con éxito. Debe cambiar su contraseña inicial.`,
        });
    } else {
        res.status(400);
        throw new Error('Datos de usuario no válidos');
    }
});


// Controlador para listar todos los usuarios
const getUsers = async (req, res) => {
    // ⚠️ SEGURIDAD: Ya verificada en el middleware, pero el controlador lo valida
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Acceso denegado. Se requiere rol de Administrador." });
    }

    try {
        // Encontramos todos los usuarios, excluyendo la contraseña, versión y datos sensibles
        const users = await User.find().select('-password -__v -documentNumber');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener la lista de usuarios.", error: error.message });
    }
};

// Controlador para actualizar el rol de un usuario específico
const updateUserRole = async (req, res) => {
    // ⚠️ SEGURIDAD: Ya verificada en el middleware, pero el controlador lo valida
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Acceso denegado. Se requiere rol de Administrador para modificar roles." });
    }

    const { id } = req.params; 
    const { role } = req.body; 

    // ⚠️ SEGURIDAD ADICIONAL: Validar que el rol sea uno de los permitidos
    // ✅ CORRECCIÓN: Se añade 'basico' a los roles permitidos.
    const allowedRoles = ['admin', 'talento', 'servicio', 'basico', 'invitado'];
    if (!allowedRoles.includes(role)) {
        return res.status(400).json({ message: "Rol no válido." });
    }

    try {
        // Buscamos el usuario antes de actualizar para obtener el rol anterior
        const userToUpdate = await User.findById(id).select('-password');
        if (!userToUpdate) {
            return res.status(404).json({ message: "Usuario no encontrado." });
        }

        const oldRole = userToUpdate.role;

        // Seguridad: No se permite al administrador cambiar su propio rol. (YA ESTÁ BIEN)
        if (req.user._id.toString() === id) {
             return res.status(400).json({ message: "No puedes modificar tu propio rol. Pídele a otro administrador que lo haga." });
        }
        
        // 🚨 SEGURIDAD CRÍTICA: Bloquear la edición de OTROS administradores
        // Solo un Super-Admin podría hacer esto. Para simplificar, lo bloqueamos por ahora.
        if (userToUpdate.role === 'admin' && req.user._id.toString() !== id) {
             return res.status(403).json({ message: "Acceso denegado. No puedes modificar el rol de otro administrador." });
        }


        // 🌟 ACCIÓN CLAVE: Guardar el nuevo rol
        userToUpdate.role = role;
        const updatedUser = await userToUpdate.save();


        // ✅ AUDITORÍA: ROL CAMBIADO (Mantenemos tu función de auditoría)
        logAuditAction(
            req, 
            'ROLE_CHANGE', 
            `Rol de usuario actualizado: ${updatedUser.name} (${updatedUser.email}). Rol anterior: ${oldRole} -> Nuevo Rol: ${updatedUser.role}.`, 
            updatedUser._id
        );


        const roleLabel = getRoleLabel(updatedUser.role);
        // 🌟 RETORNAMOS UNA SEÑAL DE SEGURIDAD 🌟
        // Retornamos el ID del usuario actualizado, esto lo usaremos en el frontend para forzar el logout
        res.status(200).json({ 
            message: `Rol de ${updatedUser.name} actualizado a ${roleLabel}.`, 
            user: updatedUser,
            targetUserId: updatedUser._id // Señal para el frontend
        });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar el rol.", error: error.message });
    }
};

// @desc    Forzar el cambio de contraseña inicial
// @route   PUT /api/users/change-password
// @access  Privado (Usuario logueado)
const changePassword = async (req, res) => {
    // El ID del usuario está en req.user._id, gracias al middleware 'protect'
    const userId = req.user._id; 
    const { password } = req.body;

    // 1. Validación básica
    if (!password) {
        return res.status(400).json({ message: "La nueva contraseña es obligatoria." });
    }
    if (password.length < 6) {
          return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres." });
    }

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado." });
        }

        // 2. Actualizar la contraseña
        user.password = password;
        
        // 3. Marcar la contraseña como cambiada
        user.isPasswordSet = true;

        await user.save(); // Guarda los cambios (se ejecuta el middleware de hasheo)
        
        // ✅ AUDITORÍA: CONTRASEÑA CAMBIADA
        logAuditAction(req, 'PASS_CHANGE', `Contraseña cambiada por el usuario ${user.name} (${user.email}).`, userId);

        res.status(200).json({ 
            message: "¡Contraseña actualizada con éxito! Ya tienes acceso completo.",
            // Devolvemos el nuevo estado
            isPasswordSet: user.isPasswordSet 
        });

    } catch (error) {
        console.error('Error al cambiar la contraseña:', error);
        res.status(500).json({ message: "Error interno al procesar el cambio de contraseña." });
    }
};


module.exports = {
    authUser,
    registerUser,
    getUsers,
    updateUserRole,
    changePassword, 
};