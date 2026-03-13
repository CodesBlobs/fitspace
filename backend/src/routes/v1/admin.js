const express = require('express');
const router = express.Router();
const analyticsService = require('../../services/analyticsService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * @route   GET /api/v1/admin/activity
 * @desc    Get recent system-wide activity
 * @access  Admin
 */
router.get('/activity', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 50;
    const activity = await analyticsService.getRecentActivity(limit);
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/v1/admin/users
 * @desc    Get list of all users with stats
 * @access  Admin
 */
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          lastLoginAt: true,
          streakCount: true,
          _count: {
            select: {
              meals: true,
              workouts: true
            }
          }
        }
      }),
      prisma.user.count()
    ]);

    res.json({
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
