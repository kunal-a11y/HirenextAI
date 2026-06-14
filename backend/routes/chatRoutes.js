const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');

// @route   POST api/chat/send
// @desc    Send a message to AI
// @access  Private
router.post('/send', auth, chatController.sendMessage);

// @route   GET api/chat/history
// @desc    Get user chat history
// @access  Private
router.get('/history', auth, chatController.getHistory);

// @route   DELETE api/chat/clear
// @desc    Clear user chat history
// @access  Private
router.delete('/clear', auth, chatController.clearHistory);

module.exports = router;
