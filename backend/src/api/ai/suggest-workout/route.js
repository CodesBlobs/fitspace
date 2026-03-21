import { NextResponse } from 'next/server';
import { suggestWorkout } from '@/lib/services/openai';
import { getUserIdFromRequest } from '@/lib/auth-util';

export async function POST(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { preferences } = await req.json();
    console.log(`Suggesting workout for user ${userId} with preferences:`, preferences);
    const suggestion = await suggestWorkout(preferences);
    console.log(`Workout suggestion complete for user ${userId}`);
    return NextResponse.json({ suggestion });
  } catch (err) {
    console.error('AI suggest workout error:', err);
    return NextResponse.json({ error: 'Failed to suggest workout' }, { status: 500 });
  }
}
