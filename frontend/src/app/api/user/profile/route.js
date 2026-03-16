import { prisma } from '@/lib/db';
import { verifyToken, unauthorized } from '@/lib/api-auth';

export async function GET(req) {
  try {
    const userId = verifyToken(req);
    if (!userId) return unauthorized();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        dailyWaterGoal: true,
        dailyCaloriesGoal: true,
        dailySleepGoal: true,
        dailyWorkoutGoal: true,
        weight: true,
        height: true,
      },
    });

    return Response.json({ user });
  } catch (err) {
    console.error('Get profile error:', err);
    return Response.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const userId = verifyToken(req);
    if (!userId) return unauthorized();

    const updates = await req.json();
    
    // Safety check: remove fields that shouldn't be updated here
    delete updates.id;
    delete updates.email;
    delete updates.password;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updates,
    });

    return Response.json({ user });
  } catch (err) {
    console.error('Update profile error:', err);
    return Response.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
