import { StoreAdapter, StorePriceResult } from './types';
import { SteamAdapter } from './adapters/steam';
import { GogAdapter } from './adapters/gog';
import { GreenManGamingAdapter } from './adapters/greenmangaming';
import { GamersGateAdapter } from './adapters/gamersgate';
import { matchGameTitle } from './matcher';

export interface StoreOffer {
  id: string;
  name: string;
  price: number;
  url: string;
  isOfficial: boolean;
}

export class PriceAggregator {
  adapters: StoreAdapter[] = [];

  constructor() {
    this.adapters.push(new SteamAdapter());
    this.adapters.push(new GogAdapter());
    this.adapters.push(new GreenManGamingAdapter());
    this.adapters.push(new GamersGateAdapter());
  }

  /**
   * Fetches the current price of a game across all supported stores
   * by using its DB identifier (steamAppId, slug, etc) or resolving by name.
   */
  async getGamePrices(game: any): Promise<StoreOffer[]> {
    const promises = this.adapters.map(async (adapter) => {
      let identifier = game.name;
      
      // Some adapters prefer steamAppId
      if (adapter.storeId === 'steam' && game.steamAppId) {
        identifier = game.steamAppId;
      }

      try {
        const result = await adapter.getPriceByIdentifier(identifier);
        
        if (result) {
          return {
            id: result.storeId,
            name: result.storeName,
            price: result.price,
            url: result.url,
            isOfficial: result.isOfficial
          } as StoreOffer;
        }
      } catch (e) {
        console.error(`PriceAggregator: adapter ${adapter.storeName} failed for ${identifier}`, e);
      }
      return null;
    });

    const results = await Promise.all(promises);
    return results.filter((r): r is StoreOffer => r !== null);
  }

  /**
   * Used for search-as-you-type where we only have a title string.
   * This calls searchByTitle on all adapters concurrently.
   */
  async getPricesByTitle(gameName: string): Promise<StoreOffer[]> {
    const offers: StoreOffer[] = [];
    const promises: Promise<void>[] = [];

    const steamAdapter = this.adapters.find(a => a.storeId === 'steam');
    const gogAdapter = this.adapters.find(a => a.storeId === 'gog');
    const gmgAdapter = this.adapters.find(a => a.storeId === 'gmg');
    const gamersgateAdapter = this.adapters.find(a => a.storeId === 'gamersgate');

    // 1. Steam
    if (steamAdapter) {
      promises.push(
        steamAdapter.searchByTitle(gameName)
          .then((results: any[]) => {
            if (results.length > 0) {
              const bestMatchStr = matchGameTitle(gameName, results.map(r => r.title));
              if (bestMatchStr) {
                const bestMatch = results.find(r => r.title === bestMatchStr.bestMatch);
                if (bestMatch && bestMatch.price >= 0) {
                  offers.push({
                    id: steamAdapter.storeId,
                    name: steamAdapter.storeName,
                    price: bestMatch.price,
                    url: bestMatch.url,
                    isOfficial: steamAdapter.isOfficial
                  });
                }
              }
            }
          })
          .catch((e: Error) => console.error("PriceAggregator: Steam failed", e))
      );
    }

    // 2. GOG
    if (gogAdapter) {
      promises.push(
        gogAdapter.searchByTitle(gameName)
          .then((results: any[]) => {
            if (results.length > 0) {
              const bestMatchStr = matchGameTitle(gameName, results.map(r => r.title));
              if (bestMatchStr) {
                 const bestMatch = results.find(r => r.title === bestMatchStr.bestMatch);
                 if (bestMatch && bestMatch.price >= 0) {
                   offers.push({
                     id: gogAdapter.storeId,
                     name: gogAdapter.storeName,
                     price: bestMatch.price,
                     url: bestMatch.url,
                     isOfficial: gogAdapter.isOfficial
                   });
                 }
              }
            }
          })
          .catch((e: Error) => console.error("PriceAggregator: GOG failed", e))
      );
    }

    // Wait for all adapters to finish resolving
    await Promise.allSettled(promises);

    // Sort by cheapest
    offers.sort((a, b) => a.price - b.price);
    return offers;
  }
}

export const priceAggregator = new PriceAggregator();
