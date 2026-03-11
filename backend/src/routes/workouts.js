// ─── Workout Routes ─────────────────────────────────────────
// GET    /api/workouts       — list workouts for current user
// POST   /api/workouts       — log a new workout
// DELETE /api/workouts/:id   — delete a workout

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticate);

// ─── List Workouts ──────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { date } = req.query;

    let where = { userId: req.userId };
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      where.loggedAt = { gte: start, lt: end };
    }

    const workouts = await prisma.workout.findMany({
      where,
      orderBy: { loggedAt: 'desc' },
    });

    res.json({ workouts });
  } catch (err) {
    console.error('List workouts error:', err);
    res.status(500).json({ error: 'Failed to fetch workouts' });
  }
});

// ─── Log Workout ────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { type, name, duration, calories, notes } = req.body;

    if (!type || !name || !duration) {
      return res.status(400).json({ error: 'Type, name, and duration are required' });
    }

    const workout = await prisma.workout.create({
      data: {
        userId: req.userId,
        type,
        name,
        duration: parseInt(duration),
        calories: calories ? parseFloat(calories) : null,
        notes: notes || null,
      },
    });

    res.status(201).json({ workout });
  } catch (err) {
    console.error('Create workout error:', err);
    res.status(500).json({ error: 'Failed to log workout' });
  }
});

// ─── Delete Workout ─────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const workout = await prisma.workout.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    await prisma.workout.delete({ where: { id: req.params.id } });
    res.json({ message: 'Workout deleted' });
  } catch (err) {
    console.error('Delete workout error:', err);
    res.status(500).json({ error: 'Failed to delete workout' });
  }
});

module.exports = router;
