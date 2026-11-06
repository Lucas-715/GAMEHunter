import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { isRateLimited } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    
    if (ip !== 'unknown' && isRateLimited(ip)) {
      return NextResponse.json({ message: 'Muitas tentativas. Tente novamente em 15 minutos.' }, { status: 429 });
    }

    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Todos os campos são obrigatórios' }, { status: 400 });
    }

    const cleanEmail = email.trim();
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });

      if (existingUser) {
        return NextResponse.json({ message: 'E-mail já está em uso' }, { status: 400 });
      }

      await prisma.user.create({
        data: {
          name: name.trim(),
          email: cleanEmail,
          passwordHash: hashedPassword,
        },
      });
    } catch (dbErr) {
      console.warn('Database write fallback to memory store:', dbErr);
      if (!globalThis.__inMemoryUsers) {
        globalThis.__inMemoryUsers = [];
      }
      if (globalThis.__inMemoryUsers.some(u => u.email.toLowerCase() === cleanEmail.toLowerCase())) {
        return NextResponse.json({ message: 'E-mail já está em uso' }, { status: 400 });
      }
      globalThis.__inMemoryUsers.push({
        id: 'mem-' + Date.now(),
        name: name.trim(),
        email: cleanEmail,
        passwordHash: hashedPassword,
        plan: 'FREE',
      });
    }

    return NextResponse.json({ message: 'Usuário criado com sucesso' }, { status: 201 });
  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ message: 'Erro interno no servidor' }, { status: 500 });
  }
}
