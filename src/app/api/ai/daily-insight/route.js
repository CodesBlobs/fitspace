import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getDailyInsight } from '@/lib/services/openai';
import { getUserIdFromRequest } from '@/lib/auth-util';

export async function GET(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [meals, workouts, moodLogs] = await Promise.all([
      prisma.meal.count({ where: { userId, loggedAt: { gte: weekAgo } } }),
      prisma.workout.count({ where: { userId, loggedAt: { gte: weekAgo } } }),
      prisma.moodLog.findMany({
        where: { userId, loggedAt: { gte: weekAgo } },
        orderBy: { loggedAt: 'desc' },
        take: 3,
      }),
    ]);

    const userData = {
      mealsLoggedThisWeek: meals,
      workoutsThisWeek: workouts,
      recentMoods: moodLogs.map((m) => m.mood),
    };

    const insight = await getDailyInsight(userData);
    return NextResponse.json({ insight });
  } catch (err) {
    console.error('AI daily insight error:', err);
    return NextResponse.json({ error: 'Failed to get daily insight' }, { status: 500 });
  }
}
