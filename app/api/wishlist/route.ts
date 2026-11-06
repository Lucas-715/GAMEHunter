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
        wishlists: {
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
      return NextResponse.json({ wishlists: [] });
    }

    return NextResponse.json({ wishlists: user.wishlists });
  } catch (error) {
    console.error('Wishlist GET Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { gameId } = await req.json();

    if (!gameId) {
      return NextResponse.json({ message: 'Missing gameId' }, { status: 400 });
    }

    const user = await getOrCreateSessionUser(session.user.email, session.user.name);
    await ensureGameExists(String(gameId));

    // Check if it already exists
    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_gameId: {
          userId: user.id,
          gameId: gameId
        }
      }
    });

    if (existing) {
      return NextResponse.json({ message: 'Already in wishlist', wishlist: existing }, { status: 200 });
    }

    const wishlist = await prisma.wishlist.create({
      data: {
        userId: user.id,
        gameId: gameId
      }
    });

    return NextResponse.json({ message: 'Added to wishlist', wishlist }, { status: 201 });
  } catch (error) {
    console.error('Wishlist POST Error:', error);
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
    const gameId = url.searchParams.get('gameId');

    if (!gameId) {
      return NextResponse.json({ message: 'Missing gameId' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    await prisma.wishlist.delete({
      where: {
        userId_gameId: {
          userId: user.id,
          gameId: gameId
        }
      }
    });

    return NextResponse.json({ message: 'Removed from wishlist' }, { status: 200 });
  } catch (error) {
    console.error('Wishlist DELETE Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
