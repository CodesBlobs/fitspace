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

    const logs = await prisma.waterLog.findMany({
      where,
      orderBy: { loggedAt: 'desc' },
    });

    // Calculate total for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayLogs = await prisma.waterLog.findMany({
      where: {
        userId,
        loggedAt: { gte: today, lt: tomorrow },
      },
    });
    const totalToday = todayLogs.reduce((sum, l) => sum + l.amount, 0);

    return Response.json({ logs, totalToday });
  } catch (err) {
    console.error('List water logs error:', err);
    return Response.json({ error: 'Failed to fetch water logs' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const userId = verifyToken(req);
    if (!userId) return unauthorized();

    const { amount } = await req.json();

    if (amount === undefined || amount === null) {
      return Response.json({ error: 'Amount (ml) is required' }, { status: 400 });
    }

    const log = await prisma.waterLog.create({
      data: { userId, amount: parseFloat(amount) },
    });

    return Response.json({ log }, { status: 201 });
  } catch (err) {
    console.error('Log water error:', err);
    return Response.json({ error: 'Failed to log water' }, { status: 500 });
  }
}
