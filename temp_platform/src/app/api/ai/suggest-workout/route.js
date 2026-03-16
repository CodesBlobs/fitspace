import { verifyToken, unauthorized } from '@/lib/api-auth';
import { suggestWorkout } from '@/lib/openai';

export async function POST(req) {
  try {
    const userId = verifyToken(req);
    if (!userId) return unauthorized();

    const { preferences } = await req.json();
    const suggestion = await suggestWorkout(preferences);
    return Response.json({ suggestion });
  } catch (err) {
    console.error('AI workout suggestion error:', err);
    return Response.json({ error: 'Suggestion failed' }, { status: 500 });
  }
}
