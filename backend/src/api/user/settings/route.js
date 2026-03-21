import { NextResponse } from 'next/server';
import prisma from '../lib/prisma';
import { getUserIdFromRequest } from '../lib/auth-util';

export async function PUT(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const {
      name, dailyWaterGoal, dailyCaloriesGoal, dailySleepGoal, dailyWorkoutGoal,
      weight, height, avatar,
    } = await req.json();

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(dailyWaterGoal !== undefined && { dailyWaterGoal: parseFloat(dailyWaterGoal) }),
        ...(dailyCaloriesGoal !== undefined && { dailyCaloriesGoal: parseFloat(dailyCaloriesGoal) }),
        ...(dailySleepGoal !== undefined && { dailySleepGoal: parseFloat(dailySleepGoal) }),
        ...(dailyWorkoutGoal !== undefined && { dailyWorkoutGoal: parseInt(dailyWorkoutGoal) }),
        ...(weight !== undefined && { weight: weight ? parseFloat(weight) : null }),
        ...(height !== undefined && { height: height ? parseFloat(height) : null }),
        ...(avatar !== undefined && { avatar }),
      },
    });

    console.log(`Settings updated for user ${userId}`);
    return NextResponse.json({
      message: 'Settings updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        avatar: updatedUser.avatar,
        dailyWaterGoal: updatedUser.dailyWaterGoal,
        dailyCaloriesGoal: updatedUser.dailyCaloriesGoal,
        dailySleepGoal: updatedUser.dailySleepGoal,
        dailyWorkoutGoal: updatedUser.dailyWorkoutGoal,
      },
    });
  } catch (err) {
    console.error('Update settings error:', err);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
