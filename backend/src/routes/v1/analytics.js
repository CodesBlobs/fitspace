const express = require('express');
const router = express.Router();
const analyticsService = require('../../services/analyticsService');

/**
 * @route   GET /api/v1/analytics/overview
 * @desc    Get high-level system metrics
 * @access  Admin
 */
router.get('/overview', async (req, res) => {
  try {
    const overview = await analyticsService.getOverview();
    res.json(overview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/v1/analytics/engagement
 * @desc    Get DAU/WAU/MAU and stickiness
 * @access  Admin
 */
router.get('/engagement', async (req, res) => {
  try {
    const engagement = await analyticsService.getEngagement();
    res.json(engagement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
