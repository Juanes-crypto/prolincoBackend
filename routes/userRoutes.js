// backend/routes/userRoutes.js (CORREGIDO)

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
// 🌟 Importar roleCheck 🌟
const { protect, roleCheck } = require('../middleware/authMiddleware.js'); 

// 1. Ruta para obtener todos los usuarios (Requiere Admin)
// Nota: Esta ruta también necesita roleCheck para ser exclusiva de admin.
router.get('/', protect, roleCheck(['admin']), userController.getUsers); // ✅ Agregado roleCheck

// 2. Ruta para que el usuario cambie su propia contraseña 
router.put('/change-password', protect, userController.changePassword);

// 3. Ruta para actualizar el rol de un usuario (Requiere Admin)
// 🌟 ¡AQUÍ ESTÁ EL CAMBIO CLAVE! 🌟
router.put('/:id', protect, roleCheck(['admin']), userController.updateUserRole); // ✅ Agregado roleCheck

module.exports = router;