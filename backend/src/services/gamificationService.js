const prisma = require('./db');

/**
 * Platform Gamification Service
 */
class GamificationService {
  /**
   * Update or reset user streaks based on activity
   */
  async updateStreak(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { streakCount: true, lastPracticeDate: true },
    });

    if (!user) return;

    const today = new Date().toISOString().slice(0, 10);
    const lastDate = user.lastPracticeDate;

    if (lastDate === today) return; // Already updated today

    let newStreak = 1;
    if (lastDate) {
      const last = new Date(lastDate);
      const diff = Math.floor((new Date(today) - last) / (1000 * 60 * 60 * 24));
      
      if (diff === 1) {
        newStreak = user.streakCount + 1;
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        streakCount: newStreak,
        lastPracticeDate: today,
      },
    });

    // Check for streak-based badges
    await this.checkStreakBadges(userId, newStreak);
  }

  /**
   * Award a badge to a user
   */
  async awardBadge(userId, badgeName) {
    const badge = await prisma.badge.findUnique({ where: { name: badgeName } });
    if (!badge) return;

    try {
      await prisma.userBadge.create({
        data: {
          userId,
          badgeId: badge.id,
        },
      });
      // Track event
      const analyticsService = require('./analyticsService');
      await analyticsService.trackEvent({
        eventName: 'badge_earned',
        userId,
        metadata: { badgeName },
      });
    } catch (error) {
      // Ignore unique constraint (badge already earned)
    }
  }

  /**
   * Internal logic for streak-based badges
   */
  async checkStreakBadges(userId, streakCount) {
    if (streakCount === 3) await this.awardBadge(userId, 'On a Roll');
    if (streakCount === 7) await this.awardBadge(userId, 'Week Warrior');
    if (streakCount === 30) await this.awardBadge(userId, 'Monthly Master');
  }
}

module.exports = new GamificationService();
