import { prisma } from '@/lib/db';
import { verifyToken, unauthorized } from '@/lib/api-auth';

export async function GET(req) {
  try {
    const userId = verifyToken(req);
    if (!userId) return unauthorized();

    const logs = await prisma.moodLog.findMany({
      where: { userId },
      orderBy: { loggedAt: 'desc' },
      take: 30,
    });

    return Response.json({ logs });
  } catch (err) {
    console.error('List mood logs error:', err);
    return Response.json({ error: 'Failed to fetch mood logs' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const userId = verifyToken(req);
    if (!userId) return unauthorized();

    const { mood, energy, notes } = await req.json();

    if (!mood || energy === undefined || energy === null) {
      return Response.json({ error: 'Mood and energy (1-5) are required' }, { status: 400 });
    }

    const log = await prisma.moodLog.create({
      data: {
        userId,
        mood,
        energy: parseInt(energy),
        notes: notes || null,
      },
    });

    return Response.json({ log }, { status: 201 });
  } catch (err) {
    console.error('Log mood error:', err);
    return Response.json({ error: 'Failed to log mood' }, { status: 500 });
  }
}
