import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth-util';

// Get start of week (Monday) for a given date
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const weekStart = new Date(d.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
}

// Get end of week (Sunday) for a given date
function getWeekEnd(date) {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  return weekEnd;
}

// Calculate score based on various metrics
function calculateScore(metrics) {
  return (
    metrics.totalWorkouts * 10 +
    metrics.workoutMinutes * 0.5 +
    metrics.mealsLogged * 5 +
    metrics.sleepHours * 3 +
    (metrics.waterIntake / 1000) * 2 + // Convert ml to liters
    metrics.moodScore * 4
  );
}

// GET - Fetch leaderboard rankings
export async function GET(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const timeframe = searchParams.get('timeframe') || 'weekly';

    const now = new Date();
    const weekStart = getWeekStart(now);
    const weekEnd = getWeekEnd(now);

    // Get current user's data for the week
    const [todayMeals, todayWorkouts, todayWater, todaySleep, todayMood, user] = await Promise.all([
      prisma.meal.findMany({
        where: {
          userId,
          loggedAt: { gte: weekStart, lt: weekEnd },
        },
      }),
      prisma.workout.findMany({
        where: {
          userId,
          loggedAt: { gte: weekStart, lt: weekEnd },
        },
      }),
      prisma.waterLog.findMany({
        where: {
          userId,
          loggedAt: { gte: weekStart, lt: weekEnd },
        },
      }),
      prisma.sleepLog.findMany({
        where: {
          userId,
          loggedAt: { gte: weekStart, lt: weekEnd },
        },
      }),
      prisma.moodLog.findMany({
        where: {
          userId,
          loggedAt: { gte: weekStart, lt: weekEnd },
        },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          dailyWaterGoal: true,
        },
      }),
    ]);

    // Calculate user metrics
    const userMetrics = {
      totalWorkouts: todayWorkouts.length,
      workoutMinutes: todayWorkouts.reduce((sum, w) => sum + w.duration, 0),
      workoutsCalories: todayWorkouts.reduce((sum, w) => sum + (w.calories || 0), 0),
      mealsLogged: todayMeals.length,
      totalCalories: todayMeals.reduce((sum, m) => sum + (m.calories || 0), 0),
      waterIntake: todayWater.reduce((sum, w) => sum + w.amount, 0),
      sleepHours: todaySleep.reduce((sum, s) => sum + s.hours, 0),
      moodScore: todayMood.length > 0
        ? todayMood.reduce((sum, m) => sum + m.energy, 0) / todayMood.length
        : 0,
    };

    const userScore = calculateScore(userMetrics);

    // Get or create leaderboard entry for current user
    let userEntry = await prisma.leaderboardEntry.findFirst({
      where: {
        userId,
        weekStart,
      },
    });

    if (!userEntry) {
      userEntry = await prisma.leaderboardEntry.create({
        data: {
          userId,
          weekStart,
          weekEnd,
          ...userMetrics,
          score: userScore,
        },
      });
    } else {
      userEntry = await prisma.leaderboardEntry.update({
        where: { id: userEntry.id },
        data: {
          ...userMetrics,
          score: userScore,
        },
      });
    }

    // Get all users for leaderboard
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
      },
    });

    // Calculate scores for all users
    const leaderboardPromises = allUsers.map(async (u) => {
      if (u.id === userId) {
        return {
          user: {
            id: u.id,
            name: u.name,
            avatar: u.avatar,
          },
          ...userMetrics,
          score: userScore,
          isCurrentUser: true,
        };
      }

      const [meals, workouts, water, sleep, mood] = await Promise.all([
        prisma.meal.findMany({
          where: { userId: u.id, loggedAt: { gte: weekStart, lt: weekEnd } },
        }),
        prisma.workout.findMany({
          where: { userId: u.id, loggedAt: { gte: weekStart, lt: weekEnd } },
        }),
        prisma.waterLog.findMany({
          where: { userId: u.id, loggedAt: { gte: weekStart, lt: weekEnd } },
        }),
        prisma.sleepLog.findMany({
          where: { userId: u.id, loggedAt: { gte: weekStart, lt: weekEnd } },
        }),
        prisma.moodLog.findMany({
          where: { userId: u.id, loggedAt: { gte: weekStart, lt: weekEnd } },
        }),
      ]);

      const metrics = {
        totalWorkouts: workouts.length,
        workoutMinutes: workouts.reduce((sum, w) => sum + w.duration, 0),
        workoutsCalories: workouts.reduce((sum, w) => sum + (w.calories || 0), 0),
        mealsLogged: meals.length,
        totalCalories: meals.reduce((sum, m) => sum + (m.calories || 0), 0),
        waterIntake: water.reduce((sum, w) => sum + w.amount, 0),
        sleepHours: sleep.reduce((sum, s) => sum + s.hours, 0),
        moodScore: mood.length > 0
          ? mood.reduce((sum, m) => sum + m.energy, 0) / mood.length
          : 0,
      };

      return {
        user: {
          id: u.id,
          name: u.name,
          avatar: u.avatar,
        },
        ...metrics,
        score: calculateScore(metrics),
        isCurrentUser: false,
      };
    });

    const allEntries = await Promise.all(leaderboardPromises);

    // Sort by score descending
    const sorted = allEntries.sort((a, b) => b.score - a.score);

    // Add rank
    const ranked = sorted.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    // Find current user's position
    const currentUserEntry = ranked.find((e) => e.isCurrentUser);

    return NextResponse.json({
      leaderboard: ranked.slice(0, 10), // Top 10
      currentUser: currentUserEntry,
      totalCount: ranked.length,
      weekStart,
      weekEnd,
    });
  } catch (err) {
    console.error('Leaderboard fetch error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}

// POST - Update/create leaderboard entry (called after logging activities)
export async function POST(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { metrics } = body;

    const now = new Date();
    const weekStart = getWeekStart(now);
    const weekEnd = getWeekEnd(now);

    const score = calculateScore(metrics);

    const entry = await prisma.leaderboardEntry.upsert({
      where: {
        userId_weekStart: {
          userId,
          weekStart,
        },
      },
      update: {
        ...metrics,
        score,
      },
      create: {
        userId,
        weekStart,
        weekEnd,
        ...metrics,
        score,
      },
    });

    return NextResponse.json({ entry });
  } catch (err) {
    console.error('Leaderboard update error:', err);
    return NextResponse.json(
      { error: 'Failed to update leaderboard' },
      { status: 500 }
    );
  }
}
