// routes/authRoutes.js

const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');
const { protect, roleCheck } = require('../middleware/authMiddleware');

// 🔒 SEGURIDAD CRÍTICA: Solo administradores pueden registrar nuevos usuarios
// POST a /api/auth/register
router.post('/register', protect, roleCheck(['admin']), registerUser);

// Ruta para iniciar sesión (pública)
// POST a /api/auth/login
router.post('/login', loginUser);

module.exports = router;
