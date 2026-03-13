const prisma = require('./db');
const crypto = require('crypto');

/**
 * Platform Referral & Promo Service
 */
class ReferralService {
  /**
   * Validate and apply a promo code to a user
   */
  async applyPromoCode(userId, code) {
    const promo = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promo || promo.status !== 'active') {
      throw new Error('Invalid or inactive promo code');
    }

    if (promo.expiresAt && promo.expiresAt < new Date()) {
      throw new Error('Promo code has expired');
    }

    if (promo.maxUses && promo.currentUses >= promo.maxUses) {
      throw new Error('Promo code has reached max uses');
    }

    return prisma.$transaction(async (tx) => {
      // Record redemption
      await tx.promoCodeRedemption.create({
        data: {
          userId,
          code: promo.code,
          promoCodeId: promo.id,
        },
      });

      // Increment usage count
      await tx.promoCode.update({
        where: { id: promo.id },
        data: { currentUses: { increment: 1 } },
      });

      return promo;
    });
  }

  /**
   * Generate a unique referral link for a user
   */
  async generateReferralId(userId) {
    const referralId = crypto.randomBytes(4).toString('hex');
    return prisma.referralLink.create({
      data: {
        ownerUserId: userId,
        referralId,
      },
    });
  }
}

module.exports = new ReferralService();
