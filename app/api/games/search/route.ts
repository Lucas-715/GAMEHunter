import { NextResponse } from 'next/server';
import { searchEngine } from '@/lib/search-engine';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const query = url.searchParams.get('q');
    
    if (!query) {
      return NextResponse.json({ games: [] });
    }

    const results = await searchEngine.searchGames(query);

    return NextResponse.json(results, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate',
      }
    });

  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', games: [] },
      { status: 500 }
    );
  }
}
