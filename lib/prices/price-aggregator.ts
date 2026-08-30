import { StoreAdapter } from './types';
import { SteamAdapter } from './adapters/steam';
import { GogAdapter } from './adapters/gog';
import { NuuvemAdapter } from './adapters/nuuvem';
import { InstantGamingAdapter } from './adapters/instant_gaming';
import { matchGameTitle } from './matcher';

export interface StoreOffer {
  id: string;
  name: string;
  price: number;
  url: string;
  isOfficial: boolean;
}

export interface AggregatedResult {
  coverImageUrl?: string;
  isFree: boolean;
  stores: StoreOffer[];
}

export class PriceAggregator {
  private adapters: StoreAdapter[] = [];

  constructor() {
    this.adapters.push(new SteamAdapter());
    this.adapters.push(new GogAdapter());
    this.adapters.push(new NuuvemAdapter());
    this.adapters.push(new InstantGamingAdapter());
  }

  /**
   * Fetches prices from all adapters in parallel.
   * Tolerates failures from individual adapters.
   */
  async aggregatePrices(gameName: string, steamAppId?: string | null): Promise<AggregatedResult> {
    const offers: StoreOffer[] = [];
    let coverImageUrl: string | undefined;
    let isFree = false;

    const steamAdapter = this.adapters.find(a => a.storeId === 'steam') as SteamAdapter;
    const gogAdapter = this.adapters.find(a => a.storeId === 'gog') as GogAdapter;
    const nuuvemAdapter = this.adapters.find(a => a.storeId === 'nuuvem') as NuuvemAdapter;
    const igAdapter = this.adapters.find(a => a.storeId === 'instantgaming') as InstantGamingAdapter;

    // Use Promise.allSettled to ensure one failing adapter doesn't break the entire aggregator
    const promises = [];

    // 1. Steam
    if (steamAppId && steamAdapter) {
      promises.push(
        steamAdapter.getFullAppDetails(steamAppId)
          .then(steamDetails => {
            if (steamDetails) {
              if (steamDetails.header_image) coverImageUrl = steamDetails.header_image;
              if (steamDetails.is_free) isFree = true;
              
              const price = steamDetails.is_free ? 0 : (steamDetails.price_overview?.final ? steamDetails.price_overview.final / 100 : undefined);
              
              if (price !== undefined && price >= 0) {
                offers.push({
                  id: steamAdapter.storeId,
                  name: steamAdapter.storeName,
                  price,
                  url: `https://store.steampowered.com/app/${steamAppId}`,
                  isOfficial: true
                });
              }
            }
          })
          .catch(e => console.error("PriceAggregator: Steam failed", e))
      );
    }

    // 2. GOG
    if (gogAdapter) {
      promises.push(
        gogAdapter.searchByTitle(gameName)
          .then(results => {
            if (results.length > 0) {
              const candidateTitles = results.map(r => r.title);
              const match = matchGameTitle(gameName, candidateTitles);
              if (match) {
                const matchedGog = results.find(r => r.title === match.bestMatch);
                if (matchedGog && matchedGog.price >= 0) {
                  offers.push({
                    id: gogAdapter.storeId,
                    name: gogAdapter.storeName,
                    price: matchedGog.price,
                    url: matchedGog.url,
                    isOfficial: gogAdapter.isOfficial
                  });
                }
              }
            }
          })
          .catch(e => console.error("PriceAggregator: GOG failed", e))
      );
    }

    // 3. Nuuvem
    if (nuuvemAdapter) {
      promises.push(
        nuuvemAdapter.searchByTitle(gameName)
          .then(results => {
            if (results.length > 0 && results[0].price >= 0) {
              offers.push({
                id: nuuvemAdapter.storeId,
                name: nuuvemAdapter.storeName,
                price: results[0].price,
                url: results[0].url,
                isOfficial: nuuvemAdapter.isOfficial
              });
            }
          })
          .catch(e => console.error("PriceAggregator: Nuuvem failed", e))
      );
    }

    // 4. Instant Gaming
    if (igAdapter) {
      promises.push(
        igAdapter.searchByTitle(gameName)
          .then(results => {
            if (results.length > 0 && results[0].price >= 0) {
              offers.push({
                id: igAdapter.storeId,
                name: igAdapter.storeName,
                price: results[0].price,
                url: results[0].url,
                isOfficial: igAdapter.isOfficial
              });
            }
          })
          .catch(e => console.error("PriceAggregator: IG failed", e))
      );
    }

    // Wait for all adapters to finish resolving
    await Promise.allSettled(promises);

    // Sort by cheapest
    offers.sort((a, b) => a.price - b.price);

    // Validate and clean up
    const validOffers = offers.filter(offer => 
      offer.price >= 0 && 
      offer.url && 
      offer.url.startsWith('http')
    );

    return {
      coverImageUrl,
      isFree,
      stores: validOffers
    };
  }
}

export const priceAggregator = new PriceAggregator();
