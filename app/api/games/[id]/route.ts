import { NextResponse } from 'next/server'
import { searchEngine } from '@/lib/search-engine'
import { rawg } from '@/lib/rawg'

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const gameItem = await searchEngine.getGameDetails(id)

    if (!gameItem) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    try {
      const rawgData = await rawg.searchGame(gameItem.name);
      if (rawgData) {
        gameItem.coverImageUrl = rawgData.background_image || gameItem.coverImageUrl;
        gameItem.bannerImage = rawgData.background_image;
        gameItem.tags = [...new Set([
          ...(gameItem.tags || []),
          ...rawgData.genres.map((g: any) => g.name),
          ...rawgData.tags.slice(0, 3).map((t: any) => t.name)
        ])];
        
        if (rawgData.metacritic) {
          gameItem.tags.unshift(`Metacritic: ${rawgData.metacritic}`);
        }
      }
    } catch (err) {
      console.error("RAWG enrichment failed for", gameItem.name, err);
    }

    return NextResponse.json({
      game: gameItem
    })
  } catch (error) {
    console.error("Game Details API Error:", error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
