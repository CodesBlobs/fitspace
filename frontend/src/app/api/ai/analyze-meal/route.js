import { verifyToken, unauthorized } from '@/lib/api-auth';
import { analyzeMeal } from '@/lib/openai';

export async function POST(req) {
  try {
    const userId = verifyToken(req);
    if (!userId) return unauthorized();

    const { description } = await req.json();
    if (!description) {
      return Response.json({ error: 'Description is required' }, { status: 400 });
    }

    const analysis = await analyzeMeal(description);
    return Response.json({ analysis });
  } catch (err) {
    console.error('AI meal analysis error:', err);
    return Response.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
