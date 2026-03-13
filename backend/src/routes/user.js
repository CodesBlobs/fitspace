// ─── User Profile & Settings Routes ─────────────────────────
// GET /api/user/profile  — fetch current user's profile and goals
// PUT /api/user/settings — update user's goals and profile info

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticate);

// ─── Get Profile ───────────────────────────────────────────
router.get('/profile', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        name: true,
        dailyWaterGoal: true,
        dailyCaloriesGoal: true,
        dailySleepGoal: true,
        dailyWorkoutGoal: true,
        weight: true,
        height: true,
        avatar: true,
        createdAt: true,

      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// ─── Update Settings ───────────────────────────────────────
router.put('/settings', async (req, res) => {
  try {
    const {
      name,
      dailyWaterGoal,
      dailyCaloriesGoal,
      dailySleepGoal,
      dailyWorkoutGoal,
      weight,
      height,
      avatar,
    } = req.body;


    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: {
        ...(name && { name }),
        ...(dailyWaterGoal !== undefined && { dailyWaterGoal: parseFloat(dailyWaterGoal) }),
        ...(dailyCaloriesGoal !== undefined && { dailyCaloriesGoal: parseFloat(dailyCaloriesGoal) }),
        ...(dailySleepGoal !== undefined && { dailySleepGoal: parseFloat(dailySleepGoal) }),
        ...(dailyWorkoutGoal !== undefined && { dailyWorkoutGoal: parseInt(dailyWorkoutGoal) }),
        ...(weight !== undefined && { weight: weight ? parseFloat(weight) : null }),
        ...(height !== undefined && { height: height ? parseFloat(height) : null }),
        ...(avatar !== undefined && { avatar }),
      },
    });

    res.json({
      message: 'Settings updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        avatar: updatedUser.avatar,
        dailyWaterGoal: updatedUser.dailyWaterGoal,
        dailyCaloriesGoal: updatedUser.dailyCaloriesGoal,
        dailySleepGoal: updatedUser.dailySleepGoal,
        dailyWorkoutGoal: updatedUser.dailyWorkoutGoal,
      },
    });

  } catch (err) {
    console.error('Update settings error:', err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

module.exports = router;
