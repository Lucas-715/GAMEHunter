import { NextResponse } from 'next/server'
import { searchEngine } from '@/lib/search-engine'
import { rawg } from '@/lib/rawg'
import { prisma } from '@/lib/prisma'
import { GameItem } from '@/lib/types'

export const dynamic = 'force-dynamic';

export async function GET() {
  const cacheKey = 'dashboard_deals_v6'
  
  try {
    try {
      const cached = await prisma.searchCache.findUnique({ where: { key: cacheKey } })
      if (cached && cached.expiresAt > new Date()) {
        const parsed = JSON.parse(cached.data);
        // Only return from cache if it's not empty, otherwise we try again
        if (parsed.featured?.length > 0 || parsed.opportunities?.length > 0) {
          return NextResponse.json(parsed)
        }
      }
    } catch (cacheErr) {
      console.warn("Failed to read from cache (Prisma error?):", cacheErr);
    }

    let allGames: GameItem[] = [];
    let dbError: any = null;

    // First try to find games that ALREADY have prices in the DB
    try {
      const dbGames = await prisma.game.findMany({
        where: { priceHistory: { some: {} } },
        include: {
          priceHistory: {
            orderBy: { collectionDate: 'desc' },
            include: { store: true }
          }
        },
        take: 10
      });

      if (dbGames.length > 0) {
        for (const g of dbGames) {
          // Re-use search logic to map nicely
          const results = await searchEngine.searchGames(g.name);
          const match = results.games.find(res => res.id === g.id);
          if (match && match.stores.length > 0) {
            allGames.push(match);
          }
        }
      }
    } catch (e: any) {
      dbError = e;
      console.warn("Failed to fetch games with prices from DB:", e);
    }

    // If still empty (new DB, migrated DB, etc), seed ONLY 1 or 2 games safely
    if (allGames.length < 3) {
      const popularTitles = ['Cyberpunk 2077', 'Elden Ring', 'Red Dead Redemption 2', 'Grand Theft Auto V', 'The Witcher 3'];
      
      const startTime = Date.now();
      for (const title of popularTitles) {
        if (allGames.length >= 3) break; 
        
        // STRICT 7-second limit to avoid Vercel Hobby 10s timeout (leaving 3s for RAWG and response)
        if (Date.now() - startTime > 7000) {
          console.warn("Approaching serverless timeout, breaking seed loop");
          break; 
        }

        try {
          const results = await searchEngine.searchGames(title);
          if (results.games.length > 0) {
            let game = results.games.find(g => g.name.toLowerCase() === title.toLowerCase());
            if (!game) game = results.games[0];
            
            if (game) {
              if (!game.stores || game.stores.length === 0) {
                const detailedGame = await searchEngine.getGameDetails(game.id);
                if (detailedGame && detailedGame.stores && detailedGame.stores.length > 0) {
                  allGames.push(detailedGame);
                }
              } else {
                allGames.push(game);
              }
            }
          }
        } catch (e: any) {
          dbError = e;
          console.warn("Error seeding title", title, e);
        }
      }
    }

    if (allGames.length === 0 && dbError) {
      throw new Error(`O Banco de Dados falhou: ${dbError.message || String(dbError)}`);
    }

    // We can slice deals into 'featured' and 'opportunities'
    let featured = allGames.slice(0, 3); // Let's take 3 for the carousel
    const opportunities = allGames.slice(3, 10);

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
    
    // Only cache if we actually got data, to avoid trapping an empty state
    if (featured.length > 0) {
      try {
        await prisma.searchCache.upsert({
          where: { key: cacheKey },
          update: { data: JSON.stringify(responseData), expiresAt },
          create: { key: cacheKey, data: JSON.stringify(responseData), expiresAt }
        })
      } catch (cacheErr) {
        console.warn("Failed to save to cache (read-only db?):", cacheErr);
      }
    }

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("Dashboard API Error:", error)
    return NextResponse.json({ featured: [], opportunities: [], error: error.message || String(error) }, { status: 500 })
  }
}
