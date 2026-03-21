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

    const meals = await prisma.meal.findMany({
      where,
      orderBy: { loggedAt: 'desc' },
    });

    return NextResponse.json({ meals });
  } catch (err) {
    console.error('List meals error:', err);
    return NextResponse.json({ error: 'Failed to fetch meals' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { description, mealType, calories, protein, carbs, fat, fiber, aiAnalysis } = await req.json();

    if (!description || !mealType) {
      return NextResponse.json({ error: 'Description and mealType are required' }, { status: 400 });
    }

    const meal = await prisma.meal.create({
      data: {
        userId,
        description,
        mealType,
        calories: calories || null,
        protein: protein || null,
        carbs: carbs || null,
        fat: fat || null,
        fiber: fiber || null,
        aiAnalysis: aiAnalysis || null,
      },
    });

    console.log(`Meal logged successfully: ${meal.id} for user ${userId}`);
    return NextResponse.json({ meal }, { status: 201 });
  } catch (err) {
    console.error('Create meal error:', err);
    return NextResponse.json({ error: 'Failed to log meal' }, { status: 500 });
  }
}
