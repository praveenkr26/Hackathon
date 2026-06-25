const express = require('express');
const router = express.Router();
const {
  classifyIntent,
  extractProfile,
  processDocument,
  chatWithGemini,
  getChatHistory,
  getChatSession
} = require('../controllers/aiController');

router.post('/intent', classifyIntent);
router.post('/profile', extractProfile);
router.post('/ocr', processDocument);

// Chatbot routes
router.post('/chat', chatWithGemini);
router.get('/chat/history', getChatHistory);
router.get('/chat/:sessionId', getChatSession);

module.exports = router;
