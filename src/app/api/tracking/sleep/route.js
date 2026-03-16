import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth-util';

export async function GET(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const logs = await prisma.sleepLog.findMany({
      where: { userId },
      orderBy: { loggedAt: 'desc' },
      take: 30,
    });

    return NextResponse.json({ logs });
  } catch (err) {
    console.error('List sleep logs error:', err);
    return NextResponse.json({ error: 'Failed to fetch sleep logs' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { hours, quality, notes } = await req.json();
    if (hours === undefined || quality === undefined) {
      return NextResponse.json({ error: 'Hours and quality (1-5) are required' }, { status: 400 });
    }

    const log = await prisma.sleepLog.create({
      data: {
        userId,
        hours: parseFloat(hours),
        quality: parseInt(quality),
        notes: notes || null,
      },
    });

    return NextResponse.json({ log }, { status: 201 });
  } catch (err) {
    console.error('Log sleep error:', err);
    return NextResponse.json({ error: 'Failed to log sleep' }, { status: 500 });
  }
}
