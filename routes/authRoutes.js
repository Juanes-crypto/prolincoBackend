// routes/authRoutes.js

const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');

// Ruta para crear un nuevo usuario
// POST a /api/auth/register
router.post('/register', registerUser);

// Ruta para iniciar sesión
// POST a /api/auth/login
router.post('/login', loginUser);

module.exports = router;