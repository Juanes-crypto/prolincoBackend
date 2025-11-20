// backend/routes/pageContentRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getPageContent, updatePageContent } = require('../controllers/pageContentController');

// Rutas públicas o privadas según necesidad (GET público, PUT privado)
router.get('/:section', protect, getPageContent);
router.put('/:section', protect, updatePageContent);

module.exports = router;