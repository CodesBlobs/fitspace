import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth-util';

export async function GET(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');

    let where = { userId };
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      where.loggedAt = { gte: start, lt: end };
    }

    const workouts = await prisma.workout.findMany({
      where,
      orderBy: { loggedAt: 'desc' },
    });

    return NextResponse.json({ workouts });
  } catch (err) {
    console.error('List workouts error:', err);
    return NextResponse.json({ error: 'Failed to fetch workouts' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { type, name, duration, calories, notes } = await req.json();

    if (!type || !name || !duration) {
      return NextResponse.json({ error: 'Type, name, and duration are required' }, { status: 400 });
    }

    const workout = await prisma.workout.create({
      data: {
        userId,
        type,
        name,
        duration: parseInt(duration),
        calories: calories ? parseFloat(calories) : null,
        notes: notes || null,
      },
    });

    console.log(`Workout logged successfully: ${workout.id} for user ${userId}`);
    return NextResponse.json({ workout }, { status: 201 });
  } catch (err) {
    console.error('Create workout error:', err);
    return NextResponse.json({ error: 'Failed to log workout' }, { status: 500 });
  }
}
