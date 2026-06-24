const express = require('express');
const router = express.Router();
const {
  classifyIntent,
  extractProfile,
  processDocument
} = require('../controllers/aiController');

router.post('/intent', classifyIntent);
router.post('/profile', extractProfile);
router.post('/ocr', processDocument);

module.exports = router;
