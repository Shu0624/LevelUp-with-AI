import express from 'express';
import { protect } from '../middleware/auth.js';
import { generateRoadmap } from '../services/aiService.js';
import Resume from '../models/Resume.js';
import Progress from '../models/Progress.js';

const router = express.Router();

// @desc    Generate personalized AI roadmap
// @route   POST /api/ai/roadmap
// @access  Private
router.post('/roadmap', protect, async (req, res) => {
  try {
    const { targetRole = 'Software Engineer', targetMonths = 3, experienceLevel = 'Beginner', specificGoals = '' } = req.body;

    // Gather the student's current profile from DB
    const resume = await Resume.findOne({ user: req.user._id });
    const progress = await Progress.findOne({ user: req.user._id });

    const profile = {
      skills: resume?.parsedData?.skills || [],
      resumeScore: resume?.analysis?.score || 0,
      quizScores: {},
      targetRole,
      targetMonths: parseInt(targetMonths),
      experienceLevel,
      specificGoals
    };

    // Fill quiz scores from progress if available
    if (progress?.modules) {
      for (const mod of progress.modules) {
        if (mod.quizScores?.length > 0) {
          const avg = mod.quizScores.reduce((a, b) => a + b, 0) / mod.quizScores.length;
          profile.quizScores[mod.moduleName || 'unknown'] = Math.round(avg);
        }
      }
    }

    const roadmap = await generateRoadmap(profile);

    res.status(200).json({
      message: 'Roadmap generated successfully',
      roadmap
    });
  } catch (err) {
    console.error('Roadmap error:', err);
    res.status(500).json({ message: 'Failed to generate roadmap' });
  }
});

export default router;
