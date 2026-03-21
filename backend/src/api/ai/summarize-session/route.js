import { NextResponse } from 'next/server';
import { generateMealSessionSummary } from '@/lib/services/openai';
import { getUserIdFromRequest } from '@/lib/auth-util';

export async function POST(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { meals } = await req.json();
    if (!meals || !Array.isArray(meals) || meals.length === 0) {
      return NextResponse.json({ error: 'Meals are required for summary' }, { status: 400 });
    }

    console.log(`Generating session summary for user ${userId} with ${meals.length} meals`);
    const summary = await generateMealSessionSummary(meals);
    console.log(`Session summary complete for user ${userId}`);
    
    return NextResponse.json({ summary });
  } catch (err) {
    console.error('AI session summary error:', err);
    return NextResponse.json({ error: 'Failed to generate session summary' }, { status: 500 });
  }
}
