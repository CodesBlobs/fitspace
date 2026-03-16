import { prisma } from '@/lib/db';
import { verifyToken, unauthorized } from '@/lib/api-auth';

export async function GET(req) {
  try {
    const userId = verifyToken(req);
    if (!userId) return unauthorized();

    const logs = await prisma.sleepLog.findMany({
      where: { userId },
      orderBy: { loggedAt: 'desc' },
      take: 30,
    });

    return Response.json({ logs });
  } catch (err) {
    console.error('List sleep logs error:', err);
    return Response.json({ error: 'Failed to fetch sleep logs' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const userId = verifyToken(req);
    if (!userId) return unauthorized();

    const { hours, quality, notes } = await req.json();

    if (hours === undefined || quality === undefined) {
      return Response.json({ error: 'Hours and quality (1-5) are required' }, { status: 400 });
    }

    const log = await prisma.sleepLog.create({
      data: {
        userId,
        hours: parseFloat(hours),
        quality: parseInt(quality),
        notes: notes || null,
      },
    });

    return Response.json({ log }, { status: 201 });
  } catch (err) {
    console.error('Log sleep error:', err);
    return Response.json({ error: 'Failed to log sleep' }, { status: 500 });
  }
}
