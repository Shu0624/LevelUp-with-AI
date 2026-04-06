import express from 'express';
import { protect } from '../middleware/auth.js';
import { getAIChatResponse } from '../services/chatService.js';

const router = express.Router();

// @desc    Chat with AI mentor
// @route   POST /api/chat
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { topic, message, questionIndex, projectDescription } = req.body;
    const response = await getAIChatResponse(topic || 'hr', message, questionIndex || 0, projectDescription);
    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ message: 'Chat failed' });
  }
});

export default router;
