import express from 'express';
import { protect } from '../middleware/auth.js';
import InterviewSession from '../models/InterviewSession.js';

const router = express.Router();

// @desc    Save a completed AI interview session
// @route   POST /api/interview/session
// @access  Private
router.post('/session', protect, async (req, res) => {
  try {
    const { topic, messagesCount, durationSeconds, score } = req.body;

    const session = await InterviewSession.create({
      host: req.user._id,
      roomId: `ai-${Date.now().toString(36)}`,
      type: 'mock-interview',
      status: 'completed',
      topic: topic || 'hr',
      messagesCount: messagesCount || 0,
      aiScore: score || 0,
      startedAt: new Date(Date.now() - (durationSeconds || 0) * 1000),
      endedAt: new Date()
    });

    res.status(201).json({
      message: 'Interview session saved',
      session: {
        _id: session._id,
        topic: session.topic,
        messagesCount: session.messagesCount,
        durationSeconds,
        aiScore: session.aiScore,
        completedAt: session.endedAt
      }
    });
  } catch (err) {
    console.error('Save interview session error:', err);
    res.status(500).json({ message: 'Failed to save interview session' });
  }
});

// @desc    Get interview history for current user
// @route   GET /api/interview/history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const sessions = await InterviewSession.find({ host: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Calculate duration for each session
    const formatted = sessions.map(s => ({
      _id: s._id,
      topic: s.topic || 'hr',
      type: s.type,
      status: s.status,
      messagesCount: s.messagesCount || 0,
      aiScore: s.aiScore || 0,
      durationSeconds: s.startedAt && s.endedAt
        ? Math.round((new Date(s.endedAt) - new Date(s.startedAt)) / 1000)
        : 0,
      completedAt: s.endedAt || s.createdAt
    }));

    res.status(200).json({
      total: formatted.length,
      sessions: formatted
    });
  } catch (err) {
    console.error('Interview history error:', err);
    res.status(500).json({ message: 'Failed to fetch interview history' });
  }
});

export default router;
