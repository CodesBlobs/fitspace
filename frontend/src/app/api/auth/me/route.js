import { prisma } from '@/lib/db';
import { verifyToken, unauthorized } from '@/lib/api-auth';

export async function GET(req) {
  try {
    const userId = verifyToken(req);
    if (!userId) return unauthorized();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return Response.json({ user });
  } catch (err) {
    console.error('Me error:', err);
    return Response.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}
