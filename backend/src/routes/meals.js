// ─── Meal Routes ────────────────────────────────────────────
// GET    /api/meals       — list meals for current user
// POST   /api/meals       — log a new meal
// DELETE /api/meals/:id   — delete a meal

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// All meal routes require authentication
router.use(authenticate);

// ─── List Meals ─────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { date } = req.query; // optional: filter by date (YYYY-MM-DD)

    let where = { userId: req.userId };
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      where.loggedAt = { gte: start, lt: end };
    }

    const meals = await prisma.meal.findMany({
      where,
      orderBy: { loggedAt: 'desc' },
    });

    res.json({ meals });
  } catch (err) {
    console.error('List meals error:', err);
    res.status(500).json({ error: 'Failed to fetch meals' });
  }
});

// ─── Log Meal ───────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { description, mealType, calories, protein, carbs, fat, fiber, aiAnalysis } = req.body;

    if (!description || !mealType) {
      return res.status(400).json({ error: 'Description and mealType are required' });
    }

    const meal = await prisma.meal.create({
      data: {
        userId: req.userId,
        description,
        mealType,
        calories: calories || null,
        protein: protein || null,
        carbs: carbs || null,
        fat: fat || null,
        fiber: fiber || null,
        aiAnalysis: aiAnalysis || null,
      },
    });

    res.status(201).json({ meal });
  } catch (err) {
    console.error('Create meal error:', err);
    res.status(500).json({ error: 'Failed to log meal' });
  }
});

// ─── Delete Meal ────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const meal = await prisma.meal.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!meal) {
      return res.status(404).json({ error: 'Meal not found' });
    }

    await prisma.meal.delete({ where: { id: req.params.id } });
    res.json({ message: 'Meal deleted' });
  } catch (err) {
    console.error('Delete meal error:', err);
    res.status(500).json({ error: 'Failed to delete meal' });
  }
});

module.exports = router;
