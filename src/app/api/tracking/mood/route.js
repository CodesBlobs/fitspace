import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth-util';

export async function GET(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const logs = await prisma.moodLog.findMany({
      where: { userId },
      orderBy: { loggedAt: 'desc' },
      take: 30,
    });

    return NextResponse.json({ logs });
  } catch (err) {
    console.error('List mood logs error:', err);
    return NextResponse.json({ error: 'Failed to fetch mood logs' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { mood, energy, notes } = await req.json();
    if (!mood || energy === undefined || energy === null) {
      return NextResponse.json({ error: 'Mood and energy (1-5) are required' }, { status: 400 });
    }

    const log = await prisma.moodLog.create({
      data: {
        userId,
        mood,
        energy: parseInt(energy),
        notes: notes || null,
      },
    });

    return NextResponse.json({ log }, { status: 201 });
  } catch (err) {
    console.error('Log mood error:', err);
    return NextResponse.json({ error: 'Failed to log mood' }, { status: 500 });
  }
}
