const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'model'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const ChatSessionSchema = new mongoose.Schema({
  title: {
    type: String,
    default: 'New Chat'
  },
  messages: [MessageSchema]
}, { timestamps: true });

module.exports = mongoose.model('ChatSession', ChatSessionSchema);
