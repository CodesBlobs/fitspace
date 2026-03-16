import { prisma } from '@/lib/db';
import { generateToken } from '@/lib/api-auth';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return Response.json({ error: 'Email, password, and name are required' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return Response.json({ error: 'Email already registered' }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed, name },
    });

    const token = generateToken(user);
    return Response.json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    }, { status: 201 });
  } catch (err) {
    console.error('Register error:', err);
    return Response.json({ error: 'Failed to register' }, { status: 500 });
  }
}
