import { prisma } from '@/lib/db';
import { verifyToken, unauthorized } from '@/lib/api-auth';

export async function GET(req) {
  try {
    const userId = verifyToken(req);
    if (!userId) return unauthorized();

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

    return Response.json({ workouts });
  } catch (err) {
    console.error('List workouts error:', err);
    return Response.json({ error: 'Failed to fetch workouts' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const userId = verifyToken(req);
    if (!userId) return unauthorized();

    const { type, name, duration, calories, notes } = await req.json();

    if (!type || !name || !duration) {
      return Response.json({ error: 'Type, name, and duration are required' }, { status: 400 });
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

    return Response.json({ workout }, { status: 201 });
  } catch (err) {
    console.error('Create workout error:', err);
    return Response.json({ error: 'Failed to log workout' }, { status: 500 });
  }
}
