import { prisma } from '@/lib/prisma';
import { GameItem } from '@/lib/types';
import { priceAggregator, StoreOffer } from '../prices/price-aggregator';

class SearchEngine {
  async searchGames(query: string) {
    let localGames: any[] = [];
    try {
      // Include latest price history directly from DB
      localGames = await prisma.game.findMany({
        where: {
          name: {
            contains: query,
            mode: 'insensitive' // Depending on Postgres collation, this might be needed
          }
        },
        include: {
          priceHistory: {
            orderBy: { collectionDate: 'desc' },
            include: { store: true }
          }
        },
        take: 10
      });
    } catch (e) {
      console.warn("Prisma findMany failed:", e);
    }

    // Since we decoupled adapters, we query Steam API directly here for the search feature 
    // to discover new games that aren't in our local DB yet. 
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
      
      // If we don't have it, create it
      if (!game) {
        try {
          game = await prisma.game.upsert({
            where: { steamAppId: result.storeInternalId },
            update: { name: result.title },
            create: {
              name: result.title,
              steamAppId: result.storeInternalId,
              slug: result.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            },
            include: {
              priceHistory: {
                orderBy: { collectionDate: 'desc' },
                include: { store: true }
              }
            }
          });
        } catch (e) {
          console.warn("Prisma upsert failed, using memory fallback:", e);
          game = {
            id: result.storeInternalId,
            name: result.title,
            steamAppId: result.storeInternalId,
            priceHistory: []
          }
        }
        searchResultsMap.set(game.name.toLowerCase(), game);
      }
    }

    const searchResults = Array.from(searchResultsMap.values());
    if (searchResults.length === 0) return { games: [] };

    // Format games reading only from DB (instant)
    // We do not call priceAggregator here. We just use whatever is in priceHistory.
    const validGames: GameItem[] = [];
    
    for (const game of searchResults.slice(0, 8)) {
      const stores = this.getUniqueStoresFromHistory(game.priceHistory || []);
      
      // For search results, we accept games even without stores (they might just have been discovered)
      validGames.push({
        id: game.id,
        steamAppId: game.steamAppId || undefined,
        name: game.name,
        coverImageUrl: game.coverImageUrl || `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${game.steamAppId}/header.jpg`,
        isFree: game.isFree || false,
        priceHistory: [],
        allTimeLow: stores.length > 0 ? { price: Math.min(...stores.map(s => s.price)), date: new Date().toISOString() } : { price: 0, date: new Date().toISOString() },
        stores: stores,
        tags: game.isFree ? ['Free to Play'] : [],
        opportunityScore: game.isFree ? 100 : (stores.length > 0 ? 50 : 0)
      });
    }

    return { games: validGames };
  }

  async getGameDetails(id: string): Promise<GameItem | null> {
    const game = await prisma.game.findUnique({
      where: { id },
      include: {
        priceHistory: {
          orderBy: { collectionDate: 'desc' },
          include: { store: true }
        }
      }
    });

    if (!game) return null;

    // Check if the latest price is fresh (less than 6 hours old)
    let isFresh = false;
    let stores = this.getUniqueStoresFromHistory(game.priceHistory);

    if (game.priceHistory.length > 0) {
      const latestDate = game.priceHistory[0].collectionDate.getTime();
      const now = new Date().getTime();
      const sixHoursMs = 6 * 60 * 60 * 1000;
      
      if (now - latestDate < sixHoursMs) {
        isFresh = true;
      }
    }

    // If it's stale or empty, we scrape live on-demand for this specific game
    if (!isFresh || stores.length === 0) {
      console.log(`[getGameDetails] Prices for ${game.name} are stale/empty. Scraping live...`);
      const aggregation = await priceAggregator.aggregatePrices(game.name, game.steamAppId);
      
      // Format to stores
      stores = aggregation.stores;
      
      // Update DB asynchronously in the background so we don't block the UI more than necessary
      // Or we can await it if we want to ensure it's saved. For vercel, if we don't await, it might get killed.
      // We will await it to be safe.
      for (const offer of stores) {
        const store = await prisma.store.upsert({
          where: { name: offer.name },
          update: {},
          create: {
            name: offer.name,
            type: offer.isOfficial ? 'OFFICIAL' : 'RESELLER',
            integrationStatus: 'ACTIVE',
          },
        });

        await prisma.priceHistory.create({
          data: {
            price: offer.price,
            currency: 'BRL',
            region: 'BR',
            link: offer.url,
            gameId: game.id,
            storeId: store.id,
          },
        });
      }

      await prisma.game.update({
        where: { id: game.id },
        data: {
          coverImageUrl: aggregation.coverImageUrl || game.coverImageUrl,
          isFree: aggregation.isFree,
        }
      });
      
      game.coverImageUrl = aggregation.coverImageUrl || game.coverImageUrl;
      game.isFree = aggregation.isFree;
    }

    return {
      id: game.id,
      steamAppId: game.steamAppId || undefined,
      name: game.name,
      coverImageUrl: game.coverImageUrl || `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${game.steamAppId}/header.jpg`,
      isFree: game.isFree,
      priceHistory: [], // Populated by cron later if needed for charts
      allTimeLow: stores.length > 0 ? { price: Math.min(...stores.map(s => s.price)), date: new Date().toISOString() } : { price: 0, date: new Date().toISOString() },
      stores: stores,
      tags: game.isFree ? ['Free to Play'] : [],
      opportunityScore: game.isFree ? 100 : (stores.length > 0 ? 50 : 0)
    };
  }

  private getUniqueStoresFromHistory(priceHistory: any[]): StoreOffer[] {
    const storeMap = new Map<string, StoreOffer>();
    
    // Since history is ordered by desc, the first time we see a store it is the latest
    for (const record of priceHistory) {
      if (!record.store || !record.store.name) continue;
      
      if (!storeMap.has(record.store.name)) {
        storeMap.set(record.store.name, {
          id: record.store.id,
          name: record.store.name,
          price: record.price,
          url: record.link || '',
          isOfficial: record.store.type === 'OFFICIAL'
        });
      }
    }
    
    return Array.from(storeMap.values()).sort((a, b) => a.price - b.price);
  }
}

export const searchEngine = new SearchEngine();
