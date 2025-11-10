// models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true, // Hacemos que el nombre sea obligatorio
        trim: true,
    },
    email: {
        type: String,
        required: true, // Hacemos que el email sea obligatorio
        unique: true, // El email debe ser único
        trim: true,
        lowercase: true,
        match: [/.+@.+\..+/, 'Por favor, introduce un correo válido']
    },
    // La forma de registrarse: TIPO DE DOCUMENTO + NÚMERO DE DOCUMENTO
    documentType: {
        type: String,
        required: true,
        enum: ['CC', 'TI', 'CE', 'NIT'] // Ejemplo de tipos, puedes ajustarlos
    },
    documentNumber: {
        type: String,
        required: true,
        unique: true, // Asegura que no haya números de documento duplicados
        trim: true,
    },
    password: {
        type: String,
        required: false,
    },
    isPasswordSet: {
        type: Boolean,
        default: false, // Por defecto, la contraseña no ha sido cambiada
    },
    role: {
        type: String,
        required: true,
         enum: ['admin', 'talento', 'servicio', 'invitado'],
        default: 'invitado' // El rol predeterminado al registrarse
    }
}, {
    timestamps: true // Agrega campos 'createdAt' y 'updatedAt'
});

// Middleware de Mongoose: Encripta la contraseña antes de guardar el usuario
userSchema.pre('save', async function(next) {
    // Solo hashear si la contraseña se ha modificado (o es nueva)
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Método para comparar contraseñas (uso en el login)
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;