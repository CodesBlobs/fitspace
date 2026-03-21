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

    const [logs, todayLogs] = await Promise.all([
      prisma.waterLog.findMany({ where, orderBy: { loggedAt: 'desc' } }),
      prisma.waterLog.findMany({
        where: {
          userId,
          loggedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(24, 0, 0, 0))
          }
        }
      })
    ]);

    const totalToday = todayLogs.reduce((sum, l) => sum + l.amount, 0);
    return NextResponse.json({ logs, totalToday });
  } catch (err) {
    console.error('List water logs error:', err);
    return NextResponse.json({ error: 'Failed to fetch water logs' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { amount } = await req.json();
    if (amount === undefined || amount === null) {
      return NextResponse.json({ error: 'Amount (ml) is required' }, { status: 400 });
    }

    const log = await prisma.waterLog.create({
      data: { userId, amount: parseFloat(amount) },
    });

    console.log(`Water logged: ${amount}ml for user ${userId}`);
    return NextResponse.json({ log }, { status: 201 });
  } catch (err) {
    console.error('Log water error:', err);
    return NextResponse.json({ error: 'Failed to log water' }, { status: 500 });
  }
}
