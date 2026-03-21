import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth-util';

export async function DELETE(req, { params }) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    const workout = await prisma.workout.findFirst({
      where: { id, userId },
    });

    if (!workout) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }

    await prisma.workout.delete({ where: { id } });
    return NextResponse.json({ message: 'Workout deleted' });
  } catch (err) {
    console.error('Delete workout error:', err);
    return NextResponse.json({ error: 'Failed to delete workout' }, { status: 500 });
  }
}
