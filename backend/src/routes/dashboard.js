// ─── Dashboard Routes ───────────────────────────────────────
// GET /api/dashboard/summary   — aggregated stats for dashboard
// GET /api/dashboard/weekly    — weekly trend data for charts

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticate);

// ─── Dashboard Summary ─────────────────────────────────────
router.get('/summary', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dateFilter = { gte: today, lt: tomorrow };

    // Today's data
    const [todayMeals, todayWorkouts, todayWater, latestSleep, latestMood] = await Promise.all([
      prisma.meal.findMany({
        where: { userId: req.userId, loggedAt: dateFilter },
      }),
      prisma.workout.findMany({
        where: { userId: req.userId, loggedAt: dateFilter },
      }),
      prisma.waterLog.findMany({
        where: { userId: req.userId, loggedAt: dateFilter },
      }),
      prisma.sleepLog.findFirst({
        where: { userId: req.userId },
        orderBy: { loggedAt: 'desc' },
      }),
      prisma.moodLog.findFirst({
        where: { userId: req.userId },
        orderBy: { loggedAt: 'desc' },
      }),
    ]);

    // Aggregate
    const totalCalories = todayMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
    const totalProtein = todayMeals.reduce((sum, m) => sum + (m.protein || 0), 0);
    const totalCarbs = todayMeals.reduce((sum, m) => sum + (m.carbs || 0), 0);
    const totalFat = todayMeals.reduce((sum, m) => sum + (m.fat || 0), 0);
    const totalWorkoutMinutes = todayWorkouts.reduce((sum, w) => sum + w.duration, 0);
    const totalWorkoutCalories = todayWorkouts.reduce((sum, w) => sum + (w.calories || 0), 0);
    const totalWater = todayWater.reduce((sum, w) => sum + w.amount, 0);

    res.json({
      summary: {
        calories: { total: totalCalories, protein: totalProtein, carbs: totalCarbs, fat: totalFat },
        workouts: { count: todayWorkouts.length, minutes: totalWorkoutMinutes, calories: totalWorkoutCalories },
        water: { total: totalWater, goal: 2500 }, // 2.5L daily goal
        sleep: latestSleep ? { hours: latestSleep.hours, quality: latestSleep.quality } : null,
        mood: latestMood ? { mood: latestMood.mood, energy: latestMood.energy } : null,
        mealsLogged: todayMeals.length,
      },
    });
  } catch (err) {
    console.error('Dashboard summary error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard summary' });
  }
});

// ─── Weekly Trends ──────────────────────────────────────────
router.get('/weekly', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 6); // 7 days including today

    const [meals, workouts, waterLogs, sleepLogs, moodLogs] = await Promise.all([
      prisma.meal.findMany({
        where: { userId: req.userId, loggedAt: { gte: weekAgo } },
        orderBy: { loggedAt: 'asc' },
      }),
      prisma.workout.findMany({
        where: { userId: req.userId, loggedAt: { gte: weekAgo } },
        orderBy: { loggedAt: 'asc' },
      }),
      prisma.waterLog.findMany({
        where: { userId: req.userId, loggedAt: { gte: weekAgo } },
        orderBy: { loggedAt: 'asc' },
      }),
      prisma.sleepLog.findMany({
        where: { userId: req.userId, loggedAt: { gte: weekAgo } },
        orderBy: { loggedAt: 'asc' },
      }),
      prisma.moodLog.findMany({
        where: { userId: req.userId, loggedAt: { gte: weekAgo } },
        orderBy: { loggedAt: 'asc' },
      }),
    ]);

    // Group by day
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekAgo);
      d.setDate(d.getDate() + i);
      const dayStr = d.toISOString().split('T')[0];
      const nextDay = new Date(d);
      nextDay.setDate(nextDay.getDate() + 1);

      const dayMeals = meals.filter((m) => m.loggedAt >= d && m.loggedAt < nextDay);
      const dayWorkouts = workouts.filter((w) => w.loggedAt >= d && w.loggedAt < nextDay);
      const dayWater = waterLogs.filter((w) => w.loggedAt >= d && w.loggedAt < nextDay);
      const daySleep = sleepLogs.filter((s) => s.loggedAt >= d && s.loggedAt < nextDay);
      const dayMood = moodLogs.filter((m) => m.loggedAt >= d && m.loggedAt < nextDay);

      days.push({
        date: dayStr,
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        calories: dayMeals.reduce((s, m) => s + (m.calories || 0), 0),
        workoutMinutes: dayWorkouts.reduce((s, w) => s + w.duration, 0),
        water: dayWater.reduce((s, w) => s + w.amount, 0),
        sleep: daySleep.length > 0 ? daySleep[0].hours : 0,
        mood: dayMood.length > 0 ? dayMood[dayMood.length - 1].energy : 0,
      });
    }

    res.json({ weekly: days });
  } catch (err) {
    console.error('Dashboard weekly error:', err);
    res.status(500).json({ error: 'Failed to fetch weekly trends' });
  }
});

module.exports = router;
