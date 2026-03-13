const express = require('express');
const router = express.Router();
const gamificationService = require('../../services/gamificationService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * @route   GET /api/v1/gamification/badges
 * @desc    Get all available badges
 */
router.get('/badges', async (req, res) => {
  try {
    const badges = await prisma.badge.findMany();
    res.json(badges);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/v1/gamification/my-badges/:userId
 * @desc    Get badges earned by a specific user
 */
router.get('/my-badges/:userId', async (req, res) => {
  try {
    const badges = await prisma.userBadge.findMany({
      where: { userId: req.params.userId },
      include: { badge: true }
    });
    res.json(badges);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/v1/gamification/streak/update
 * @desc    Manually trigger a streak update (for testing/integration)
 */
router.post('/streak/update', async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'User ID is required' });

  try {
    await gamificationService.updateStreak(userId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
