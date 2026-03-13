// ─── AI Routes ──────────────────────────────────────────────
// POST /api/ai/analyze-meal    — AI nutrition analysis
// POST /api/ai/suggest-workout — AI workout suggestion
// GET  /api/ai/daily-insight   — AI motivational insight

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const { analyzeMeal, suggestWorkout, getDailyInsight } = require('../services/openai');
const { transcribeAudio } = require('../services/elevenlabs');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const upload = multer({ dest: 'uploads/' });

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticate);

// ─── Voice Transcription ─────────────────────────────────────
router.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const text = await transcribeAudio(req.file.path);

    // Clean up file
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Error deleting temp file:', err);
    });

    res.json({ text });
  } catch (err) {
    console.error('Transcription route error:', err);
    res.status(500).json({ error: 'Failed to transcribe audio' });
  }
});


// ─── Analyze Meal ───────────────────────────────────────────
router.post('/analyze-meal', async (req, res) => {
  try {
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Meal description is required' });
    }

    const analysis = await analyzeMeal(description);
    res.json({ analysis });
  } catch (err) {
    console.error('AI analyze meal error:', err);
    res.status(500).json({ error: 'Failed to analyze meal' });
  }
});

// ─── Suggest Workout ────────────────────────────────────────
router.post('/suggest-workout', async (req, res) => {
  try {
    const { preferences } = req.body; // e.g. { type: 'cardio', duration: 30, level: 'beginner' }

    const suggestion = await suggestWorkout(preferences || {});
    res.json({ suggestion });
  } catch (err) {
    console.error('AI suggest workout error:', err);
    res.status(500).json({ error: 'Failed to suggest workout' });
  }
});

// ─── Daily Insight ──────────────────────────────────────────
router.get('/daily-insight', async (req, res) => {
  try {
    // Gather user's recent data for context
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [meals, workouts, moodLogs] = await Promise.all([
      prisma.meal.count({ where: { userId: req.userId, loggedAt: { gte: weekAgo } } }),
      prisma.workout.count({ where: { userId: req.userId, loggedAt: { gte: weekAgo } } }),
      prisma.moodLog.findMany({
        where: { userId: req.userId, loggedAt: { gte: weekAgo } },
        orderBy: { loggedAt: 'desc' },
        take: 3,
      }),
    ]);

    const userData = {
      mealsLoggedThisWeek: meals,
      workoutsThisWeek: workouts,
      recentMoods: moodLogs.map((m) => m.mood),
    };

    const insight = await getDailyInsight(userData);
    res.json({ insight });
  } catch (err) {
    console.error('AI daily insight error:', err);
    res.status(500).json({ error: 'Failed to get daily insight' });
  }
});

module.exports = router;
