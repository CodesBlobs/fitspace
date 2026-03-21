import { NextResponse } from 'next/server';
import prisma from '../lib/prisma';
import { getUserIdFromRequest } from '../lib/auth-util';

export async function GET(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 6);

    const [meals, workouts, waterLogs, sleepLogs, moodLogs] = await Promise.all([
      prisma.meal.findMany({ where: { userId, loggedAt: { gte: weekAgo } }, orderBy: { loggedAt: 'asc' } }),
      prisma.workout.findMany({ where: { userId, loggedAt: { gte: weekAgo } }, orderBy: { loggedAt: 'asc' } }),
      prisma.waterLog.findMany({ where: { userId, loggedAt: { gte: weekAgo } }, orderBy: { loggedAt: 'asc' } }),
      prisma.sleepLog.findMany({ where: { userId, loggedAt: { gte: weekAgo } }, orderBy: { loggedAt: 'asc' } }),
      prisma.moodLog.findMany({ where: { userId, loggedAt: { gte: weekAgo } }, orderBy: { loggedAt: 'asc' } }),
    ]);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekAgo);
      d.setDate(d.getDate() + i);
      const dayStr = d.toISOString().split('T')[0];
      const nextDay = new Date(d);
      nextDay.setDate(nextDay.getDate() + 1);

      const dayMeals = meals.filter((m) => m.loggedAt >= d && m.loggedAt < nextDay);
      const dayWorkouts = workouts.filter((w) => w.loggedAt >= d && w.loggedAt < nextDay);
      const dayWater = waterLogs.filter((w) => w.loggedAt >= d && w.loggedAt < nextDay);
      const daySleep = sleepLogs.filter((s) => s.loggedAt >= d && s.loggedAt < nextDay);
      const dayMood = moodLogs.filter((m) => m.loggedAt >= d && m.loggedAt < nextDay);

      days.push({
        date: dayStr,
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        calories: dayMeals.reduce((s, m) => s + (m.calories || 0), 0),
        workoutMinutes: dayWorkouts.reduce((s, w) => s + w.duration, 0),
        water: dayWater.reduce((s, w) => s + w.amount, 0),
        sleep: daySleep.length > 0 ? daySleep[0].hours : 0,
        mood: dayMood.length > 0 ? dayMood[dayMood.length - 1].energy : 0,
      });
    }

    return NextResponse.json({ weekly: days });
  } catch (err) {
    console.error('Dashboard weekly error:', err);
    return NextResponse.json({ error: 'Failed to fetch weekly trends' }, { status: 500 });
  }
}
