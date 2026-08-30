import { prisma } from '@/lib/prisma';
import { GameItem } from '@/lib/types';
import { priceAggregator } from '../prices/price-aggregator';

class SearchEngine {
  async searchGames(query: string) {
    let localGames: any[] = [];
    try {
      localGames = await prisma.game.findMany({
        where: {
          name: {
            contains: query,
          }
        },
        take: 10
      });
    } catch (e) {
      console.warn("Prisma findMany failed:", e);
    }

    // Since we decoupled adapters, we will just query Steam API directly here for the search feature 
    // to discover new games that aren't in our local DB yet. 
    // We can do a quick fetch to Steam just for discovery.
    let steamResults: any[] = [];
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const steamSearch = await fetch(`https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(query)}&l=english&cc=BR`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (steamSearch.ok) {
        const data = await steamSearch.json();
        if (data && data.items) {
          steamResults = data.items.map((item: any) => ({
            title: item.name,
            storeInternalId: item.id.toString(),
          }));
        }
      }
    } catch (e) {
      console.error("Steam search discovery failed:", e);
    }
    
    const searchResultsMap = new Map();
    
    // Seed map with local games
    for (const game of localGames) {
      searchResultsMap.set(game.name.toLowerCase(), game);
    }
    
    // Merge steam results
    for (const result of steamResults.slice(0, 8)) {
      if (!result.storeInternalId) continue;
      
      let game = searchResultsMap.get(result.title.toLowerCase());
      try {
        game = await prisma.game.upsert({
          where: { steamAppId: result.storeInternalId },
          update: {
            name: result.title, // In case steam has a better formatted name
          },
          create: {
            name: result.title,
            steamAppId: result.storeInternalId,
            slug: result.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          }
        });
      } catch (e) {
        console.warn("Prisma upsert failed, using memory fallback:", e);
        if (!game) {
          game = {
            id: result.storeInternalId,
            name: result.title,
            steamAppId: result.storeInternalId,
          }
        }
      }
      searchResultsMap.set(game.name.toLowerCase(), game);
    }

    const searchResults = Array.from(searchResultsMap.values());

    if (searchResults.length === 0) return { games: [] };

    const enrichedGames = await Promise.all(
      searchResults.slice(0, 8).map(async (game) => this.enrichGame(game))
    );

    // Filter out games that we couldn't enrich properly (e.g. DLCs or removed games)
    const validGames = enrichedGames.filter(g => g && g.stores && g.stores.length > 0);

    return { games: validGames };
  }

  async getGameDetails(id: string): Promise<GameItem | null> {
    const game = await prisma.game.findUnique({
      where: { id }
    });

    if (!game) return null;

    return await this.enrichGame(game);
  }

  private async enrichGame(game: any): Promise<GameItem> {
    const aggregation = await priceAggregator.aggregatePrices(game.name, game.steamAppId);
    
    return {
      id: game.id,
      steamAppId: game.steamAppId,
      name: game.name,
      coverImageUrl: aggregation.coverImageUrl || game.coverImageUrl || 'https://placehold.co/600x400/1a1a1a/ffffff?text=Sem+Imagem',
      isFree: aggregation.isFree,
      priceHistory: [], // Populated by cron later
      allTimeLow: aggregation.stores.length > 0 ? { price: Math.min(...aggregation.stores.map(s => s.price)), date: new Date().toISOString() } : { price: 0, date: new Date().toISOString() },
      stores: aggregation.stores,
      tags: aggregation.isFree ? ['Free to Play'] : [],
      opportunityScore: aggregation.isFree ? 100 : 0
    };
  }
}

export const searchEngine = new SearchEngine();
