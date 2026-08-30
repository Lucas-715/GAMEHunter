import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query) {
    return NextResponse.json({ games: [] })
  }

  // SQLite doesn't natively support case-insensitive contains in Prisma standard way,
  // but for the MVP this basic search will suffice.
  const games = await prisma.game.findMany({
    where: {
      name: {
        contains: query,
      },
    },
    include: {
      priceHistory: {
        orderBy: {
          collectionDate: 'desc'
        },
        take: 3
      }
    },
    take: 10
  })

  return NextResponse.json({ games })
}
