import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth-util';

export async function GET(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dateFilter = { gte: today, lt: tomorrow };

    const [todayMeals, todayWorkouts, todayWater, latestSleep, latestMood, user] = await Promise.all([
      prisma.meal.findMany({ where: { userId, loggedAt: dateFilter } }),
      prisma.workout.findMany({ where: { userId, loggedAt: dateFilter } }),
      prisma.waterLog.findMany({ where: { userId, loggedAt: dateFilter } }),
      prisma.sleepLog.findFirst({ where: { userId }, orderBy: { loggedAt: 'desc' } }),
      prisma.moodLog.findFirst({ where: { userId }, orderBy: { loggedAt: 'desc' } }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { dailyWaterGoal: true, dailyCaloriesGoal: true, dailySleepGoal: true, dailyWorkoutGoal: true }
      }),
    ]);

    const totalCalories = todayMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
    const totalProtein = todayMeals.reduce((sum, m) => sum + (m.protein || 0), 0);
    const totalCarbs = todayMeals.reduce((sum, m) => sum + (m.carbs || 0), 0);
    const totalFat = todayMeals.reduce((sum, m) => sum + (m.fat || 0), 0);
    const totalWorkoutMinutes = todayWorkouts.reduce((sum, w) => sum + w.duration, 0);
    const totalWorkoutCalories = todayWorkouts.reduce((sum, w) => sum + (w.calories || 0), 0);
    const totalWater = todayWater.reduce((sum, w) => sum + w.amount, 0);

    return NextResponse.json({
      summary: {
        calories: { 
          total: totalCalories, protein: totalProtein, carbs: totalCarbs, fat: totalFat,
          goal: user?.dailyCaloriesGoal || 2000
        },
        workouts: { 
          count: todayWorkouts.length, minutes: totalWorkoutMinutes, calories: totalWorkoutCalories,
          goal: user?.dailyWorkoutGoal || 30
        },
        water: { total: totalWater, goal: user?.dailyWaterGoal || 2500 },
        sleep: latestSleep ? { hours: latestSleep.hours, quality: latestSleep.quality, goal: user?.dailySleepGoal || 8 } : null,
        mood: latestMood ? { mood: latestMood.mood, energy: latestMood.energy } : null,
        mealsLogged: todayMeals.length,
      },
    });
  } catch (err) {
    console.error('Dashboard summary error:', err);
    return NextResponse.json({ error: 'Failed to fetch dashboard summary' }, { status: 500 });
  }
}
