import { prisma } from '@/lib/db';
import { verifyToken, unauthorized } from '@/lib/api-auth';

export async function DELETE(req, { params }) {
  try {
    const userId = verifyToken(req);
    if (!userId) return unauthorized();

    const { id } = params;

    const meal = await prisma.meal.findFirst({
      where: { id, userId },
    });

    if (!meal) {
      return Response.json({ error: 'Meal not found' }, { status: 404 });
    }

    await prisma.meal.delete({ where: { id } });
    return Response.json({ message: 'Meal deleted' });
  } catch (err) {
    console.error('Delete meal error:', err);
    return Response.json({ error: 'Failed to delete meal' }, { status: 500 });
  }
}
