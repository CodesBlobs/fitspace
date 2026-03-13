const express = require('express');
const router = express.Router();
const referralService = require('../../services/referralService');

/**
 * @route   POST /api/v1/promo/apply
 * @desc    Apply a promo code to the current user
 */
router.post('/apply', async (req, res) => {
  const { userId, code } = req.body;
  if (!userId || !code) {
    return res.status(400).json({ error: 'User ID and code are required' });
  }

  try {
    const result = await referralService.applyPromoCode(userId, code);
    res.json({ success: true, promo: result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route   POST /api/v1/promo/referral-link
 * @desc    Generate a referral link for a user
 */
router.post('/referral-link', async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const link = await referralService.generateReferralId(userId);
    res.json(link);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
