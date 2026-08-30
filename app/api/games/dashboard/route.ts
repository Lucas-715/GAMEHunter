import { NextResponse } from 'next/server'
import { searchEngine } from '@/lib/search-engine'
import { rawg } from '@/lib/rawg'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const cacheKey = 'dashboard_deals_v4'
  
  try {
    const cached = await prisma.searchCache.findUnique({ where: { key: cacheKey } })
    if (cached && cached.expiresAt > new Date()) {
      return NextResponse.json(JSON.parse(cached.data))
    }

    // Temporary list of popular games to show on dashboard
    // Once the PriceHistory cron is running, we can query the DB for the best discounts
    const popularTitles = ['Cyberpunk 2077', 'Elden Ring', 'Red Dead Redemption 2', 'Grand Theft Auto V', 'The Witcher 3'];
    const allGames = [];

    for (const title of popularTitles) {
      const results = await searchEngine.searchGames(title);
      if (results.games.length > 0) {
        // Try to find exact match first to avoid picking DLCs like REDmod
        let game = results.games.find(g => g.name.toLowerCase() === title.toLowerCase());
        if (!game) game = results.games[0];
        
        if (game && game.stores && game.stores.length > 0) {
          allGames.push(game);
        }
      }
    }

    // We can slice deals into 'featured' and 'opportunities'
    let featured = allGames.slice(0, 3); // Let's take 3 for the carousel
    const opportunities = allGames.slice(3);

    // Enrich featured with RAWG (since they need banners/tags on the carousel)
    featured = await Promise.all(featured.map(async (game) => {
      try {
        const rawgData = await rawg.searchGame(game.name);
        if (rawgData) {
          game.coverImageUrl = rawgData.background_image || game.coverImageUrl;
          game.bannerImage = rawgData.background_image;
          game.tags = [...new Set([
            ...(game.tags || []),
            ...rawgData.genres.map((g: any) => g.name),
            ...rawgData.tags.slice(0, 3).map((t: any) => t.name)
          ])];
          
          if (rawgData.metacritic) {
            game.tags.unshift(`Metacritic: ${rawgData.metacritic}`);
          }
        }
      } catch (err) {
        console.error("RAWG enrichment failed for", game.name, err);
      }
      return game;
    }));

    const responseData = {
      featured,
      opportunities
    };

    // Save to cache (expires in 2 hours)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 2)
    
    try {
      await prisma.searchCache.upsert({
        where: { key: cacheKey },
        update: { data: JSON.stringify(responseData), expiresAt },
        create: { key: cacheKey, data: JSON.stringify(responseData), expiresAt }
      })
    } catch (cacheErr) {
      console.warn("Failed to save to cache (read-only db?):", cacheErr);
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Dashboard API Error:", error)
    return NextResponse.json({ featured: [], opportunities: [] }, { status: 500 })
  }
}
