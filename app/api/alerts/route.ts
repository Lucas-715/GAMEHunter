import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { mockGames } from '@/lib/gamesData';

async function getOrCreateSessionUser(email: string, name?: string | null) {
  return prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: name || email.split('@')[0],
      passwordHash: 'session_auth_user',
    },
  });
}

async function ensureGameExists(gameId: string) {
  const existing = await prisma.game.findUnique({ where: { id: gameId } });
  if (existing) return existing;

  const mock = mockGames.find((g) => g.id === gameId);
  return prisma.game.create({
    data: {
      id: gameId,
      name: mock?.name || `Game #${gameId}`,
      slug: (mock?.name || `game-${gameId}`).toLowerCase().replace(/[^a-z0-9]+/g, '-') + `-${gameId}`,
      coverImageUrl: mock?.coverImageUrl || null,
      publisher: 'Estúdio Oficial',
      category: mock?.tags?.[0] || 'Action',
    },
  });
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await getOrCreateSessionUser(session.user.email, session.user.name);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        alerts: {
          include: {
            game: {
              include: {
                priceHistory: {
                  include: { store: true },
                  orderBy: { collectionDate: 'desc' }
                }
              }
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ alerts: [] });
    }

    return NextResponse.json({ alerts: user.alerts });
  } catch (error) {
    console.error('Alerts GET Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { gameId, conditionValue, type = 'TARGET_PRICE' } = await req.json();

    if (!gameId || conditionValue === undefined) {
      return NextResponse.json({ message: 'Missing gameId or conditionValue' }, { status: 400 });
    }

    const user = await getOrCreateSessionUser(session.user.email, session.user.name);
    await ensureGameExists(String(gameId));

    // Check if user already has an alert for this game
    const existingAlerts = await prisma.alert.findMany({
      where: {
        userId: user.id,
        gameId: gameId,
        type: type
      }
    });

    if (existingAlerts.length > 0) {
      // Update existing alert
      const updated = await prisma.alert.update({
        where: { id: existingAlerts[0].id },
        data: { conditionValue: Number(conditionValue) }
      });
      return NextResponse.json({ message: 'Alert updated', alert: updated }, { status: 200 });
    }

    const alert = await prisma.alert.create({
      data: {
        userId: user.id,
        gameId: gameId,
        type: type,
        conditionValue: Number(conditionValue),
        notificationChannel: 'EMAIL'
      }
    });

    // Also automatically add to wishlist if creating an alert
    const existingWishlist = await prisma.wishlist.findUnique({
      where: {
        userId_gameId: {
          userId: user.id,
          gameId: gameId
        }
      }
    });

    if (!existingWishlist) {
      await prisma.wishlist.create({
        data: {
          userId: user.id,
          gameId: gameId
        }
      });
    }

    return NextResponse.json({ message: 'Alert created', alert }, { status: 201 });
  } catch (error) {
    console.error('Alerts POST Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const alertId = url.searchParams.get('id');

    if (!alertId) {
      return NextResponse.json({ message: 'Missing alert id' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Validate ownership
    const alert = await prisma.alert.findUnique({ where: { id: alertId } });
    if (!alert || alert.userId !== user.id) {
      return NextResponse.json({ message: 'Alert not found or unauthorized' }, { status: 404 });
    }

    await prisma.alert.delete({
      where: { id: alertId }
    });

    return NextResponse.json({ message: 'Alert removed' }, { status: 200 });
  } catch (error) {
    console.error('Alerts DELETE Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id, status, conditionValue } = await req.json();

    if (!id) {
      return NextResponse.json({ message: 'Missing alert id' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const alert = await prisma.alert.findUnique({ where: { id } });
    if (!alert || alert.userId !== user.id) {
      return NextResponse.json({ message: 'Alert not found or unauthorized' }, { status: 404 });
    }

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (conditionValue !== undefined) updateData.conditionValue = Number(conditionValue);

    const updated = await prisma.alert.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ message: 'Alert updated', alert: updated }, { status: 200 });
  } catch (error) {
    console.error('Alerts PATCH Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
