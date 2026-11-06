import { StoreAdapter, StorePriceResult, StoreSearchResult } from '../types';
import { matchGameTitle } from '../matcher';

export class GogAdapter implements StoreAdapter {
  storeId = 'gog';
  storeName = 'GOG';
  isOfficial = true;

  async searchByTitle(title: string): Promise<StoreSearchResult[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(`https://catalog.gog.com/v1/catalog?query=${encodeURIComponent(title)}&limit=5&country=BR&currency=BRL`, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      clearTimeout(timeoutId);
      
      if (!res.ok) return [];
      
      const data = await res.json();
      if (!data || !data.products) return [];

      return data.products.map((item: any) => ({
        title: item.title,
        url: item.storeLink || `https://www.gog.com/en/games?query=${encodeURIComponent(title)}`,
        price: item.price?.finalMoney?.amount ? parseFloat(item.price.finalMoney.amount) : 0,
        storeInternalId: item.id.toString(),
      })).filter((p: StoreSearchResult) => p.price > 0);
    } catch (e) {
      console.warn(`GogAdapter searchByTitle warning:`, e);
      return [];
    }
  }

  async getPriceByIdentifier(identifier: string): Promise<StorePriceResult | null> {
    try {
      // Se o identifier for um nome de jogo (contém espaços ou letras), usamos searchByTitle
      const isNumericId = /^\d+$/.test(identifier.trim());

      if (!isNumericId) {
        const results = await this.searchByTitle(identifier);
        if (results.length > 0) {
          const match = matchGameTitle(identifier, results.map(r => r.title));
          const chosen = match ? results.find(r => r.title === match.bestMatch) : results[0];
          if (chosen && chosen.price > 0) {
            return {
              storeId: this.storeId,
              storeName: this.storeName,
              price: chosen.price,
              url: chosen.url || `https://www.gog.com/en/games?query=${encodeURIComponent(identifier)}`,
              isOfficial: this.isOfficial,
            };
          }
        }
        return null;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const priceRes = await fetch(`https://catalog.gog.com/v1/catalog?id=${identifier}&country=BR&currency=BRL`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!priceRes.ok) return null;
      
      const priceData = await priceRes.json();
      if (priceData.products && priceData.products.length > 0) {
        const product = priceData.products[0];
        const price = product.price?.finalMoney?.amount ? parseFloat(product.price.finalMoney.amount) : 0;
        if (price <= 0) return null;

        return {
          storeId: this.storeId,
          storeName: this.storeName,
          price,
          url: product.storeLink || `https://www.gog.com/en/games?query=${encodeURIComponent(product.title || identifier)}`,
          isOfficial: this.isOfficial,
        };
      }
      return null;
    } catch (e) {
      console.warn(`GogAdapter getPriceByIdentifier warning for ${identifier}:`, e);
      return null;
    }
  }
}
