const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const messagesController = require('../controllers/messagesController');

// Get conversations for current user
router.get('/conversations', protect, messagesController.getConversations);

// Get messages for a conversation
router.get('/:id', protect, messagesController.getMessages);

// Send message to conversation (use id='new' to create new conv)
router.post('/:id/send', protect, messagesController.sendMessage);

module.exports = router;
