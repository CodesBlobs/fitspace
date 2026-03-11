// ─── Tracking Routes ────────────────────────────────────────
// Water, Sleep, and Mood logging endpoints
// GET/POST for each tracking type

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticate);

// ═══════════════════════════════════════════════════════════
// WATER
// ═══════════════════════════════════════════════════════════

// ─── List Water Logs ────────────────────────────────────────
router.get('/water', async (req, res) => {
  try {
    const { date } = req.query;
    let where = { userId: req.userId };

    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      where.loggedAt = { gte: start, lt: end };
    }

    const logs = await prisma.waterLog.findMany({
      where,
      orderBy: { loggedAt: 'desc' },
    });

    // Calculate total for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayLogs = await prisma.waterLog.findMany({
      where: {
        userId: req.userId,
        loggedAt: { gte: today, lt: tomorrow },
      },
    });
    const totalToday = todayLogs.reduce((sum, l) => sum + l.amount, 0);

    res.json({ logs, totalToday });
  } catch (err) {
    console.error('List water logs error:', err);
    res.status(500).json({ error: 'Failed to fetch water logs' });
  }
});

// ─── Log Water ──────────────────────────────────────────────
router.post('/water', async (req, res) => {
  try {
    const { amount } = req.body; // in ml

    if (amount === undefined || amount === null) {
      return res.status(400).json({ error: 'Amount (ml) is required' });
    }

    const log = await prisma.waterLog.create({
      data: { userId: req.userId, amount: parseFloat(amount) },
    });

    res.status(201).json({ log });
  } catch (err) {
    console.error('Log water error:', err);
    res.status(500).json({ error: 'Failed to log water' });
  }
});

// ═══════════════════════════════════════════════════════════
// SLEEP
// ═══════════════════════════════════════════════════════════

// ─── List Sleep Logs ────────────────────────────────────────
router.get('/sleep', async (req, res) => {
  try {
    const logs = await prisma.sleepLog.findMany({
      where: { userId: req.userId },
      orderBy: { loggedAt: 'desc' },
      take: 30,
    });

    res.json({ logs });
  } catch (err) {
    console.error('List sleep logs error:', err);
    res.status(500).json({ error: 'Failed to fetch sleep logs' });
  }
});

// ─── Log Sleep ──────────────────────────────────────────────
router.post('/sleep', async (req, res) => {
  try {
    const { hours, quality, notes } = req.body;

    if (hours === undefined || quality === undefined) {
      return res.status(400).json({ error: 'Hours and quality (1-5) are required' });
    }

    const log = await prisma.sleepLog.create({
      data: {
        userId: req.userId,
        hours: parseFloat(hours),
        quality: parseInt(quality),
        notes: notes || null,
      },
    });

    res.status(201).json({ log });
  } catch (err) {
    console.error('Log sleep error:', err);
    res.status(500).json({ error: 'Failed to log sleep' });
  }
});

// ═══════════════════════════════════════════════════════════
// MOOD
// ═══════════════════════════════════════════════════════════

// ─── List Mood Logs ─────────────────────────────────────────
router.get('/mood', async (req, res) => {
  try {
    const logs = await prisma.moodLog.findMany({
      where: { userId: req.userId },
      orderBy: { loggedAt: 'desc' },
      take: 30,
    });

    res.json({ logs });
  } catch (err) {
    console.error('List mood logs error:', err);
    res.status(500).json({ error: 'Failed to fetch mood logs' });
  }
});

// ─── Log Mood ───────────────────────────────────────────────
router.post('/mood', async (req, res) => {
  try {
    const { mood, energy, notes } = req.body;

    if (!mood || energy === undefined || energy === null) {
      return res.status(400).json({ error: 'Mood and energy (1-5) are required' });
    }

    const log = await prisma.moodLog.create({
      data: {
        userId: req.userId,
        mood,
        energy: parseInt(energy),
        notes: notes || null,
      },
    });

    res.status(201).json({ log });
  } catch (err) {
    console.error('Log mood error:', err);
    res.status(500).json({ error: 'Failed to log mood' });
  }
});

module.exports = router;
