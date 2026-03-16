import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth-util';

export async function DELETE(req, { params }) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    const meal = await prisma.meal.findFirst({
      where: { id, userId },
    });

    if (!meal) {
      return NextResponse.json({ error: 'Meal not found' }, { status: 404 });
    }

    await prisma.meal.delete({ where: { id } });
    return NextResponse.json({ message: 'Meal deleted' });
  } catch (err) {
    console.error('Delete meal error:', err);
    return NextResponse.json({ error: 'Failed to delete meal' }, { status: 500 });
  }
}
