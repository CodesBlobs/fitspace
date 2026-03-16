import { prisma } from '@/lib/db';
import { verifyToken, unauthorized } from '@/lib/api-auth';
import { getDailyInsight } from '@/lib/openai';

export async function GET(req) {
  try {
    const userId = verifyToken(req);
    if (!userId) return unauthorized();

    // Fetch some basic user stats for better insight
    const [user, meals, workouts] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.meal.findMany({ where: { userId }, take: 10, orderBy: { loggedAt: 'desc' } }),
      prisma.workout.findMany({ where: { userId }, take: 5, orderBy: { loggedAt: 'desc' } }),
    ]);

    const userData = {
      name: user.name,
      mealsLoggedThisWeek: meals.length,
      workoutsThisWeek: workouts.length,
      goals: {
        water: user.dailyWaterGoal,
        calories: user.dailyCaloriesGoal,
        sleep: user.dailySleepGoal,
      }
    };

    const insight = await getDailyInsight(userData);
    return Response.json({ insight });
  } catch (err) {
    console.error('AI insight error:', err);
    return Response.json({ error: 'Failed to generate insight' }, { status: 500 });
  }
}
