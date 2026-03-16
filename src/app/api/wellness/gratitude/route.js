import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth-util';

export async function GET(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const entries = await prisma.gratitudeEntry.findMany({
      where: { userId },
      orderBy: { loggedAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({ entries });
  } catch (err) {
    console.error('List gratitude error:', err);
    return NextResponse.json({ error: 'Failed to fetch gratitude entries' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { content } = await req.json();
    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const entry = await prisma.gratitudeEntry.create({
      data: {
        userId,
        content,
      },
    });

    console.log(`Gratitude logged for user ${userId}`);
    return NextResponse.json({ entry }, { status: 201 });
  } catch (err) {
    console.error('Create gratitude error:', err);
    return NextResponse.json({ error: 'Failed to log gratitude' }, { status: 500 });
  }
}
