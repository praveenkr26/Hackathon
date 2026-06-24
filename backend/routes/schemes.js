const express = require('express');
const router = express.Router();
const {
  getAllSchemes,
  getStats,
  getCategories,
  getSchemeById,
  getByCategory,
  matchSchemes
} = require('../controllers/schemeController');

// IMPORTANT: specific routes must come before parameterized routes
router.get('/stats', getStats);
router.get('/categories', getCategories);
router.get('/category/:category', getByCategory);
router.post('/match', matchSchemes);
router.get('/:id', getSchemeById);
router.get('/', getAllSchemes);

module.exports = router;
