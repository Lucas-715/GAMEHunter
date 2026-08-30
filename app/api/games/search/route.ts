import { NextResponse } from 'next/server';
import { searchEngine } from '@/lib/search-engine';

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
        'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
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
