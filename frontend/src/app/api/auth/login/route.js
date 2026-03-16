import { prisma } from '@/lib/db';
import { generateToken } from '@/lib/api-auth';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = generateToken(user);
    return Response.json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error('Login error:', err);
    return Response.json({ error: 'Failed to login' }, { status: 500 });
  }
}
