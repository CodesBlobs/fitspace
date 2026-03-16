import { NextResponse } from 'next/server';
import { analyzeMeal } from '@/lib/services/openai';
import { getUserIdFromRequest } from '@/lib/auth-util';

export async function POST(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { description } = await req.json();
    if (!description) {
      return NextResponse.json({ error: 'Meal description is required' }, { status: 400 });
    }

    console.log(`Analyzing meal for user ${userId}: ${description.substring(0, 50)}...`);
    const analysis = await analyzeMeal(description);
    console.log(`Meal analysis complete for user ${userId}`);
    return NextResponse.json({ analysis });
  } catch (err) {
    console.error('AI analyze meal error:', err);
    return NextResponse.json({ error: 'Failed to analyze meal' }, { status: 500 });
  }
}
