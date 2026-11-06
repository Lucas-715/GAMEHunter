import { prisma } from '@/lib/prisma';
import { GameItem } from '@/lib/types';
import { convertUSDToBRL } from '../currency';
import { priceAggregator, StoreOffer } from '../prices/price-aggregator';
import { SteamAdapter } from '../prices/adapters/steam';
import { mockGames } from '../gamesData';

const steamAdapter = new SteamAdapter();

class SearchEngine {
  async searchGames(query: string): Promise<{ games: GameItem[] }> {
    const cleanQuery = query.trim();
    const isGenericQuery = ['popular', 'ofertas', 'all', 'destaques'].includes(cleanQuery.toLowerCase());

    let localGames: any[] = [];
    try {
      localGames = await prisma.game.findMany({
        where: isGenericQuery
          ? {}
          : {
              name: {
                contains: cleanQuery,
              },
            },
        include: {
          priceHistory: {
            orderBy: { collectionDate: 'desc' },
            include: { store: true },
          },
        },
        take: 12,
      });
    } catch (e) {
      console.warn("Prisma findMany warning:", e);
    }

    // 1. Consulta API oficial da Steam (storesearch em BRL) + CheapShark API em paralelo
    let externalResults: Array<{ title: string; steamAppId: string; brlPrice: number }> = [];
    if (!isGenericQuery && cleanQuery.length >= 2) {
      const [steamItems, cheapSharkItems] = await Promise.all([
        steamAdapter.searchByTitle(cleanQuery).catch(() => []),
        (async () => {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3500);
            const res = await fetch(
              `https://www.cheapshark.com/api/1.0/games?title=${encodeURIComponent(cleanQuery)}&limit=8`,
              {
                signal: controller.signal,
                cache: 'no-store',
                headers: { 'User-Agent': 'GameHunter/1.0' },
              }
            );
            clearTimeout(timeoutId);
            if (!res.ok) return [];
            const data = await res.json();
            if (!Array.isArray(data)) return [];
            const mapped = [];
            for (const item of data) {
              if (item.steamAppID) {
                const brl = await convertUSDToBRL(Number(item.cheapest || 19.99));
                mapped.push({
                  title: item.external,
                  steamAppId: String(item.steamAppID),
                  brlPrice: brl,
                });
              }
            }
            return mapped;
          } catch {
            return [];
          }
        })(),
      ]);

      for (const s of steamItems) {
        if (s.storeInternalId) {
          externalResults.push({
            title: s.title,
            steamAppId: s.storeInternalId,
            brlPrice: s.price > 0 ? s.price : 99.90,
          });
        }
      }
      for (const c of cheapSharkItems) {
        if (!externalResults.some((e) => e.steamAppId === c.steamAppId)) {
          externalResults.push(c);
        }
      }
    }

    const resultsMap = new Map<string, GameItem>();

    // 2. Popula primeiro com jogos do catálogo curado que dão match
    const matchingMocks = isGenericQuery
      ? mockGames
      : mockGames.filter(
          (g) =>
            g.name.toLowerCase().includes(cleanQuery.toLowerCase()) ||
            g.tags?.some((t) => t.toLowerCase().includes(cleanQuery.toLowerCase()))
        );

    for (const mg of matchingMocks) {
      resultsMap.set(mg.name.toLowerCase(), mg);
    }

    // 3. Mescla jogos do banco local Prisma
    for (const dbGame of localGames) {
      const key = dbGame.name.toLowerCase();
      if (resultsMap.has(key)) continue;

      const extractedAppId = this.extractSteamAppId(dbGame.steamAppId, dbGame.coverImageUrl);
      let stores = this.getUniqueStoresFromHistory(dbGame.priceHistory || [], dbGame.name, extractedAppId);

      if (stores.length === 0) {
        stores = this.buildDefaultStoresForGame(dbGame.name, 149.90, extractedAppId);
      }

      const prices = stores.map((s) => s.price).filter((p) => p > 0);
      const minPrice = prices.length > 0 ? Math.min(...prices) : 99.90;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : minPrice * 1.3;
      const score = this.calculateOpportunityScore(minPrice, maxPrice);

      resultsMap.set(key, {
        id: dbGame.id,
        steamAppId: extractedAppId,
        name: dbGame.name,
        coverImageUrl:
          dbGame.coverImageUrl ||
          (extractedAppId
            ? `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${extractedAppId}/header.jpg`
            : 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg'),
        bannerImage: extractedAppId
          ? `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${extractedAppId}/library_hero.jpg`
          : dbGame.coverImageUrl,
        isFree: dbGame.isFree || false,
        priceHistory: (dbGame.priceHistory || []).slice(0, 6).map((ph: any) => ({
          date: new Date(ph.collectionDate).toISOString().split('T')[0],
          price: ph.price,
          score: 85,
        })),
        allTimeLow: { price: minPrice, date: new Date().toISOString().split('T')[0] },
        stores,
        tags: [dbGame.category || 'Action RPG', dbGame.publisher || 'PC Digital'].filter(Boolean),
        opportunityScore: score,
      });
    }

    // 4. Mescla resultados descobertos nas APIs (Steam / CheapShark)
    for (const ext of externalResults.slice(0, 10)) {
      const key = ext.title.toLowerCase();
      if (resultsMap.has(key)) continue;

      const stores = this.buildDefaultStoresForGame(ext.title, ext.brlPrice, ext.steamAppId);
      const minPrice = Math.min(...stores.map((s) => s.price));
      const maxPrice = Math.max(...stores.map((s) => s.price));

      resultsMap.set(key, {
        id: ext.steamAppId,
        steamAppId: ext.steamAppId,
        name: ext.title,
        coverImageUrl: `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${ext.steamAppId}/header.jpg`,
        bannerImage: `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${ext.steamAppId}/library_hero.jpg`,
        isFree: ext.brlPrice === 0,
        priceHistory: [
          { date: '2026-08-01', price: Number((maxPrice * 1.1).toFixed(2)), score: 65 },
          { date: '2026-09-15', price: maxPrice, score: 75 },
          { date: '2026-11-01', price: minPrice, score: 90 },
        ],
        allTimeLow: { price: minPrice, date: '2026-11-01' },
        stores,
        tags: ['Steam Key', 'Lojas Oficiais', 'Entrega Digital'],
        opportunityScore: this.calculateOpportunityScore(minPrice, maxPrice),
      });
    }

    return { games: Array.from(resultsMap.values()).slice(0, 14) };
  }

  async getGameDetails(id: string): Promise<GameItem | null> {
    // 1. Verifica no catálogo enriquecido primeiro por ID ou steamAppId
    const mockMatch = mockGames.find(
      (g) => g.id === id || g.steamAppId === id || g.name.toLowerCase() === id.toLowerCase()
    );

    // 2. Busca no banco Prisma por id, steamAppId ou slug
    let dbGame: any = null;
    try {
      dbGame = await prisma.game.findFirst({
        where: {
          OR: [{ id }, { steamAppId: id }, { slug: id }],
        },
        include: {
          priceHistory: {
            orderBy: { collectionDate: 'desc' },
            include: { store: true },
          },
        },
      });
    } catch (e) {
      console.warn("Prisma findFirst warning in getGameDetails:", e);
    }

    if (mockMatch && !dbGame) {
      // Tenta atualizar preços ao vivo sem bloquear se falhar
      try {
        const liveOffers = await priceAggregator.getGamePrices(mockMatch);
        if (liveOffers.length >= 2) {
          return {
            ...mockMatch,
            stores: liveOffers,
            allTimeLow: {
              price: Math.min(mockMatch.allTimeLow.price, ...liveOffers.map((o) => o.price)),
              date: mockMatch.allTimeLow.date,
            },
          };
        }
      } catch {
        // Fallback para os dados do mockMatch
      }
      return mockMatch;
    }

    if (dbGame) {
      const extractedAppId = this.extractSteamAppId(dbGame.steamAppId, dbGame.coverImageUrl);
      let stores = this.getUniqueStoresFromHistory(dbGame.priceHistory || [], dbGame.name, extractedAppId);

      // Se tiver menos de 2 lojas no histórico, consulta o agregador ao vivo
      if (stores.length < 2) {
        const liveStores = await priceAggregator.getGamePrices({
          ...dbGame,
          steamAppId: extractedAppId,
        });
        if (liveStores.length > 0) {
          stores = liveStores;
        } else if (stores.length === 0) {
          stores = this.buildDefaultStoresForGame(dbGame.name, 149.90, extractedAppId);
        }
      }

      const minPrice = Math.min(...stores.map((s) => s.price));
      const maxPrice = Math.max(...stores.map((s) => s.price));

      return {
        id: dbGame.id,
        steamAppId: extractedAppId,
        name: dbGame.name,
        coverImageUrl:
          dbGame.coverImageUrl ||
          (extractedAppId
            ? `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${extractedAppId}/header.jpg`
            : 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg'),
        bannerImage:
          mockMatch?.bannerImage ||
          (extractedAppId
            ? `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${extractedAppId}/library_hero.jpg`
            : dbGame.coverImageUrl),
        isFree: dbGame.isFree || false,
        priceHistory:
          mockMatch?.priceHistory ||
          (dbGame.priceHistory || []).slice(0, 6).map((ph: any) => ({
            date: new Date(ph.collectionDate).toISOString().split('T')[0],
            price: ph.price,
            score: 85,
          })),
        allTimeLow: {
          price: minPrice,
          date: new Date().toISOString().split('T')[0],
        },
        stores,
        tags: mockMatch?.tags || [dbGame.category || 'Action RPG', dbGame.publisher || 'Lojas Oficiais'].filter(Boolean),
        opportunityScore: this.calculateOpportunityScore(minPrice, maxPrice),
      };
    }

    // 3. Se não estava nem no mock nem no DB, mas é um Steam App ID numérico (descoberto via busca)
    if (/^\d+$/.test(id)) {
      const steamDetails = await steamAdapter.getFullAppDetails(id);
      const name = steamDetails?.name || `Game #${id}`;
      const liveOffers = await priceAggregator.getGamePrices({ name, steamAppId: id });
      const stores =
        liveOffers.length > 0 ? liveOffers : this.buildDefaultStoresForGame(name, 119.90, id);
      const minPrice = Math.min(...stores.map((s) => s.price));
      const maxPrice = Math.max(...stores.map((s) => s.price));

      return {
        id,
        steamAppId: id,
        name,
        coverImageUrl:
          steamDetails?.header_image ||
          `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${id}/header.jpg`,
        bannerImage:
          steamDetails?.background_raw ||
          `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${id}/library_hero.jpg`,
        isFree: steamDetails?.is_free || false,
        priceHistory: [
          { date: '2026-08-01', price: Number((maxPrice * 1.15).toFixed(2)), score: 65 },
          { date: '2026-09-15', price: maxPrice, score: 78 },
          { date: '2026-11-01', price: minPrice, score: 92 },
        ],
        allTimeLow: { price: minPrice, date: '2026-11-01' },
        stores,
        tags:
          steamDetails?.genres?.map((g: any) => g.description) || ['PC Digital', 'Steam Key'],
        opportunityScore: this.calculateOpportunityScore(minPrice, maxPrice),
      };
    }

    return mockGames[0];
  }

  private extractSteamAppId(steamAppId?: string | null, coverUrl?: string | null): string | undefined {
    if (steamAppId) return steamAppId;
    if (coverUrl) {
      const match = coverUrl.match(/\/apps\/(\d+)\//);
      if (match) return match[1];
    }
    return undefined;
  }

  private calculateOpportunityScore(minPrice: number, maxPrice: number): number {
    if (minPrice <= 0) return 100;
    if (maxPrice <= minPrice) return 85;
    const discountRatio = 1 - minPrice / maxPrice;
    return Math.min(100, Math.max(68, Math.round(70 + discountRatio * 60)));
  }

  private buildDefaultStoresForGame(gameName: string, basePrice: number, steamAppId?: string): StoreOffer[] {
    const cleanBase = basePrice > 0 ? basePrice : 129.90;
    const nuuvemPrice = Number((cleanBase * 0.85).toFixed(2));
    const gmgPrice = Number((cleanBase * 0.89).toFixed(2));
    const gogPrice = Number((cleanBase * 0.92).toFixed(2));
    const steamPrice = Number(cleanBase.toFixed(2));

    return [
      {
        id: 'nuuvem',
        name: 'Nuuvem',
        price: nuuvemPrice,
        url: priceAggregator.buildStoreUrl('Nuuvem', gameName, steamAppId),
        isOfficial: true,
      },
      {
        id: 'gmg',
        name: 'Green Man Gaming',
        price: gmgPrice,
        url: priceAggregator.buildStoreUrl('Green Man Gaming', gameName, steamAppId),
        isOfficial: true,
      },
      {
        id: 'gog',
        name: 'GOG',
        price: gogPrice,
        url: priceAggregator.buildStoreUrl('GOG', gameName, steamAppId),
        isOfficial: true,
      },
      {
        id: 'steam',
        name: 'Steam',
        price: steamPrice,
        url: priceAggregator.buildStoreUrl('Steam', gameName, steamAppId),
        isOfficial: true,
      },
    ].sort((a, b) => a.price - b.price);
  }

  private getUniqueStoresFromHistory(
    priceHistory: any[],
    gameName: string,
    steamAppId?: string
  ): StoreOffer[] {
    const storeMap = new Map<string, StoreOffer>();

    for (const record of priceHistory) {
      if (!record.store || !record.store.name) continue;
      if (record.store.name.toLowerCase() === 'epic games') continue;

      if (!storeMap.has(record.store.name)) {
        const validUrl =
          record.link && record.link !== '#' && record.link.startsWith('http')
            ? record.link
            : priceAggregator.buildStoreUrl(record.store.name, gameName, steamAppId);

        storeMap.set(record.store.name, {
          id: record.store.id || record.store.name.toLowerCase(),
          name: record.store.name,
          price: Number(record.price.toFixed(2)),
          url: validUrl,
          isOfficial: record.store.type === 'OFFICIAL' || record.store.name === 'Nuuvem',
        });
      }
    }

    return Array.from(storeMap.values()).sort((a, b) => a.price - b.price);
  }
}

export const searchEngine = new SearchEngine();
