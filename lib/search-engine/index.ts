import { StoreAdapter } from './types';
import { SteamAdapter } from './adapters/steam';
import { GogAdapter } from './adapters/gog';
import { NuuvemAdapter } from './adapters/nuuvem';
import { InstantGamingAdapter } from './adapters/instant_gaming';
import { matchGameTitle } from './matcher';
import { prisma } from '@/lib/prisma';
import { GameItem } from '@/lib/types';

class SearchEngine {
  private adapters: StoreAdapter[] = [];

  constructor() {
    this.adapters.push(new SteamAdapter());
    this.adapters.push(new GogAdapter());
    this.adapters.push(new NuuvemAdapter());
    this.adapters.push(new InstantGamingAdapter());
  }

  async searchGames(query: string) {
    const localGames = await prisma.game.findMany({
      where: {
        name: {
          contains: query,
        }
      },
      take: 10
    });

    const steamAdapter = this.adapters.find(a => a.storeId === 'steam') as SteamAdapter;
    
    // Always query Steam to ensure we don't miss games or leave local games without a steamAppId
    let steamResults: any[] = [];
    if (steamAdapter) {
      steamResults = await steamAdapter.searchByTitle(query);
    }
    
    const searchResultsMap = new Map();
    
    // Seed map with local games
    for (const game of localGames) {
      searchResultsMap.set(game.name.toLowerCase(), game);
    }
    
    // Merge steam results
    for (const result of steamResults.slice(0, 8)) {
      if (!result.storeInternalId) continue;
      
      const game = await prisma.game.upsert({
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
    let coverImageUrl = game.coverImageUrl;
    let isFree = game.isFree;
    const stores: any[] = [];
    
    const steamAdapter = this.adapters.find(a => a.storeId === 'steam') as SteamAdapter;
    const gogAdapter = this.adapters.find(a => a.storeId === 'gog') as GogAdapter;
    const nuuvemAdapter = this.adapters.find(a => a.storeId === 'nuuvem') as NuuvemAdapter;
    const igAdapter = this.adapters.find(a => a.storeId === 'instantgaming') as InstantGamingAdapter;

    if (game.steamAppId && steamAdapter) {
      const steamDetails = await steamAdapter.getFullAppDetails(game.steamAppId);
      if (steamDetails) {
        coverImageUrl = steamDetails.header_image || coverImageUrl;
        isFree = steamDetails.is_free || false;
        
        if (isFree) {
          stores.push({
            id: steamAdapter.storeId,
            name: steamAdapter.storeName,
            price: 0,
            url: `https://store.steampowered.com/app/${game.steamAppId}`,
            isOfficial: true
          });
        } else if (steamDetails.price_overview) {
            stores.push({
            id: steamAdapter.storeId,
            name: steamAdapter.storeName,
            price: steamDetails.price_overview.final / 100,
            url: `https://store.steampowered.com/app/${game.steamAppId}`,
            isOfficial: true
          });
        }
      }
    }

    // Attempt to enrich with GOG
    if (gogAdapter) {
      const gogResults = await gogAdapter.searchByTitle(game.name);
      // Try to find an exact or very close title match using the matcher
      if (gogResults.length > 0) {
        const candidateTitles = gogResults.map(r => r.title);
        const match = matchGameTitle(game.name, candidateTitles);
        
        if (match) {
          const matchedGog = gogResults.find(r => r.title === match.bestMatch);
          if (matchedGog) {
            stores.push({
              id: gogAdapter.storeId,
              name: gogAdapter.storeName,
              price: matchedGog.price,
              url: matchedGog.url,
              isOfficial: gogAdapter.isOfficial
            });
          }
        }
      }
    }

    // Attempt to enrich with Nuuvem
    if (nuuvemAdapter) {
      const nuuvemResults = await nuuvemAdapter.searchByTitle(game.name);
      if (nuuvemResults.length > 0) {
        stores.push({
          id: nuuvemAdapter.storeId,
          name: nuuvemAdapter.storeName,
          price: nuuvemResults[0].price,
          url: nuuvemResults[0].url,
          isOfficial: nuuvemAdapter.isOfficial
        });
      }
    }

    // Attempt to enrich with Instant Gaming
    if (igAdapter) {
      const igResults = await igAdapter.searchByTitle(game.name);
      if (igResults.length > 0) {
        stores.push({
          id: igAdapter.storeId,
          name: igAdapter.storeName,
          price: igResults[0].price,
          url: igResults[0].url,
          isOfficial: igAdapter.isOfficial
        });
      }
    }

    stores.sort((a, b) => a.price - b.price);

    return {
      id: game.id,
      steamAppId: game.steamAppId,
      name: game.name,
      coverImageUrl: coverImageUrl || 'https://placehold.co/600x400/1a1a1a/ffffff?text=Sem+Imagem',
      isFree: isFree,
      priceHistory: [], // Populated by cron later
      allTimeLow: stores.length > 0 ? { price: Math.min(...stores.map(s => s.price)), date: new Date().toISOString() } : { price: 0, date: new Date().toISOString() },
      stores: stores,
      tags: isFree ? ['Free to Play'] : [],
      opportunityScore: isFree ? 100 : 0
    };
  }
}

export const searchEngine = new SearchEngine();
