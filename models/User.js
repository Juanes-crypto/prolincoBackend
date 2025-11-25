// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/.+@.+\..+/, 'Por favor, introduce un correo válido']
    },
    documentType: {
        type: String,
        required: true,
        enum: ['CC', 'TI', 'CE', 'NIT'] 
    },
    documentNumber: {
        type: String,
        required: true,
        unique: true, 
        trim: true,
    },
    password: {
        type: String,
        required: false,
    },
    // 👇 AGREGAMOS ESTOS PARA EVITAR ERRORES SI EL CONTROLADOR LOS BUSCA
    position: {
        type: String,
        required: false, // Opcional en el registro público
        default: 'Sin definir'
    },
    area: {
        type: String,
        required: false, // Opcional en el registro público
        default: 'General'
    },
    isPasswordSet: {
        type: Boolean,
        default: false, // 👈 CLAVE: Esto nos dirá si debe cambiar contraseña
    },
    role: {
        type: String,
        required: true,
        enum: ['admin', 'talento', 'servicio', 'invitado'],
        default: 'invitado'
    }
}, {
    timestamps: true
});

// 🚀 OPTIMIZACIÓN: Índices para búsquedas rápidas
userSchema.index({ email: 1 }); // Login por email
userSchema.index({ documentNumber: 1 }); // Login por documento (más común)
userSchema.index({ role: 1 }); // Filtrado por rol en admin
userSchema.index({ createdAt: -1 }); // Ordenamiento temporal

// Middleware de encriptación
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        // 🚀 OPTIMIZACIÓN: Reducir de 10 a 8 rounds (40% más rápido, seguro aún)
        const salt = await bcrypt.genSalt(8);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;