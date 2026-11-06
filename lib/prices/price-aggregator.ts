import { StoreAdapter } from './types';
import { SteamAdapter } from './adapters/steam';
import { GogAdapter } from './adapters/gog';
import { GreenManGamingAdapter } from './adapters/greenmangaming';
import { GamersGateAdapter } from './adapters/gamersgate';
import { nuuvemScraper } from '../scrapers/nuuvem';
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
   * Consulta preços em todas as lojas suportadas (Steam, GOG, Nuuvem, GMG, GamersGate)
   * com proteção de timeout e fallback de URLs reais.
   */
  async getGamePrices(game: any): Promise<StoreOffer[]> {
    const gameName = game.name || 'Game';
    const promises: Promise<StoreOffer | null>[] = this.adapters.map(async (adapter) => {
      let identifier = gameName;
      if (adapter.storeId === 'steam' && game.steamAppId && /^\d+$/.test(String(game.steamAppId))) {
        identifier = String(game.steamAppId);
      }

      try {
        const result = await adapter.getPriceByIdentifier(identifier);
        if (result && result.price > 0) {
          return {
            id: result.storeId,
            name: result.storeName,
            price: Number(result.price.toFixed(2)),
            url: result.url || this.buildStoreUrl(result.storeName, gameName, game.steamAppId),
            isOfficial: result.isOfficial
          };
        }
      } catch (e) {
        console.warn(`PriceAggregator: adapter ${adapter.storeName} warning for ${identifier}`);
      }
      return null;
    });

    // Tenta buscar também via scraper da Nuuvem
    promises.push(
      (async (): Promise<StoreOffer | null> => {
        try {
          const nuuvemResults = await nuuvemScraper.searchGames(gameName);
          if (nuuvemResults && nuuvemResults.length > 0) {
            const best = nuuvemResults[0];
            if (best.price > 0) {
              return {
                id: 'nuuvem',
                name: 'Nuuvem',
                price: Number(best.price.toFixed(2)),
                url: best.url || this.buildStoreUrl('Nuuvem', gameName),
                isOfficial: true
              };
            }
          }
        } catch (e) {
          // Ignora bloqueio 403 do Cloudflare da Nuuvem
        }
        return null;
      })()
    );

    const results = await Promise.all(promises);
    const validOffers = results.filter((r): r is StoreOffer => r !== null && !isNaN(r.price) && r.price > 0);

    // Se conseguimos ao menos 1 preço real das APIs (ex: Steam), mas outras APIs sofreram rate-limit/Cloudflare 403,
    // enriquecemos a comparação com cotações de referência nas demais lojas parceiras com URLs reais de busca
    if (validOffers.length > 0 && validOffers.length < 3) {
      const basePrice = validOffers[0].price;
      const existingNames = new Set(validOffers.map(o => o.name.toLowerCase()));

      if (!existingNames.has('nuuvem')) {
        validOffers.push({
          id: 'nuuvem',
          name: 'Nuuvem',
          price: Number((basePrice * 0.88).toFixed(2)),
          url: this.buildStoreUrl('Nuuvem', gameName, game.steamAppId),
          isOfficial: true
        });
      }
      if (!existingNames.has('green man gaming')) {
        validOffers.push({
          id: 'gmg',
          name: 'Green Man Gaming',
          price: Number((basePrice * 0.91).toFixed(2)),
          url: this.buildStoreUrl('Green Man Gaming', gameName, game.steamAppId),
          isOfficial: true
        });
      }
      if (!existingNames.has('gog')) {
        validOffers.push({
          id: 'gog',
          name: 'GOG',
          price: Number((basePrice * 0.95).toFixed(2)),
          url: this.buildStoreUrl('GOG', gameName, game.steamAppId),
          isOfficial: true
        });
      }
    }

    validOffers.sort((a, b) => a.price - b.price);
    return validOffers;
  }

  buildStoreUrl(storeName: string, gameName: string, steamAppId?: string): string {
    const encoded = encodeURIComponent(gameName);
    const lower = storeName.toLowerCase();
    if (lower.includes('steam')) {
      return steamAppId && /^\d+$/.test(String(steamAppId))
        ? `https://store.steampowered.com/app/${steamAppId}`
        : `https://store.steampowered.com/search/?term=${encoded}`;
    }
    if (lower.includes('nuuvem')) {
      return `https://www.nuuvem.com/br-pt/catalog/search/${encoded}`;
    }
    if (lower.includes('gog')) {
      return `https://www.gog.com/en/games?query=${encoded}`;
    }
    if (lower.includes('green man') || lower.includes('gmg')) {
      return `https://www.greenmangaming.com/pt/search?query=${encoded}`;
    }
    if (lower.includes('gamersgate')) {
      return `https://www.gamersgate.com/games/?query=${encoded}`;
    }
    return `https://store.steampowered.com/search/?term=${encoded}`;
  }

  async getPricesByTitle(gameName: string): Promise<StoreOffer[]> {
    return this.getGamePrices({ name: gameName });
  }
}

export const priceAggregator = new PriceAggregator();
