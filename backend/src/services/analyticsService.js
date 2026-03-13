const prisma = require('./db');

/**
 * Platform Analytics Service
 */
class AnalyticsService {
  /**
   * Track a system event
   */
  async trackEvent({ eventName, userId, metadata, sessionId }) {
    try {
      await prisma.analyticsEvent.create({
        data: {
          eventName,
          userId,
          metadata: metadata || {},
          sessionId,
        },
      });
    } catch (error) {
      console.error('Failed to track analytics event:', error);
    }
  }

  /**
   * Get high-level overview metrics
   */
  async getOverview() {
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const weekStart = new Date(new Date().setDate(now.getDate() - now.getDay()));
    const monthStart = new Date(new Date().setDate(1));

    const [totalUsers, newUsersToday, newUsersWeek, newUsersMonth] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.user.count({ where: { createdAt: { gte: weekStart } } }),
      prisma.user.count({ where: { createdAt: { gte: monthStart } } }),
    ]);

    const totalEvents = await prisma.analyticsEvent.count();

    return {
      totalUsers,
      newUsersToday,
      newUsersWeek,
      newUsersMonth,
      totalEvents,
    };
  }

  /**
   * Engagement metrics: DAU, WAU, MAU, Stickiness
   */
  async getEngagement() {
    const now = new Date();
    const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
    const weekStart = new Date(new Date().setDate(now.getDate() - 7));
    const monthStart = new Date(new Date().setDate(now.getDate() - 30));

    const [dauResult, wauResult, mauResult] = await Promise.all([
      prisma.analyticsEvent.findMany({
        where: { createdAt: { gte: todayStart }, userId: { not: null } },
        select: { userId: true },
        distinct: ['userId'],
      }),
      prisma.analyticsEvent.findMany({
        where: { createdAt: { gte: weekStart }, userId: { not: null } },
        select: { userId: true },
        distinct: ['userId'],
      }),
      prisma.analyticsEvent.findMany({
        where: { createdAt: { gte: monthStart }, userId: { not: null } },
        select: { userId: true },
        distinct: ['userId'],
      }),
    ]);

    const dau = dauResult.length;
    const wau = wauResult.length;
    const mau = mauResult.length;
    const stickiness = mau > 0 ? Math.round((dau / mau) * 100) : 0;

    return { dau, wau, mau, stickiness };
  }

  /**
   * Recent Activity Feed
   */
  async getRecentActivity(limit = 50) {
    const events = await prisma.analyticsEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: { select: { email: true, name: true } },
      },
    });

    return events.map((e) => ({
      id: e.id,
      eventName: e.eventName,
      userId: e.userId,
      userEmail: e.user?.email,
      userName: e.user?.name,
      metadata: e.metadata,
      createdAt: e.createdAt,
    }));
  }
}

module.exports = new AnalyticsService();
