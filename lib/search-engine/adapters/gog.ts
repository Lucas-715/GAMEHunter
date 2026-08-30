import { StoreAdapter, StorePriceResult, StoreSearchResult } from '../types';

export class GogAdapter implements StoreAdapter {
  storeId = 'gog';
  storeName = 'GOG';
  isOfficial = true;

  async searchByTitle(title: string): Promise<StoreSearchResult[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`https://catalog.gog.com/v1/catalog?query=${encodeURIComponent(title)}&limit=3&country=BR&currency=BRL`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!res.ok) return [];
      
      const data = await res.json();
      if (!data || !data.products) return [];

      return data.products.map((item: any) => ({
        title: item.title,
        url: item.storeLink,
        // price.finalMoney might not be BRL unless the machine IP is in BR or if we parse differently
        // but for now, we take what the API gives us as a base value
        price: item.price?.finalMoney?.amount ? parseFloat(item.price.finalMoney.amount) : 0,
        storeInternalId: item.id.toString(),
      }));
    } catch (e) {
      console.error(`GogAdapter searchByTitle error:`, e);
      return [];
    }
  }

  async getPriceByIdentifier(gogId: string): Promise<StorePriceResult | null> {
    try {
      // Use catalog API by id to get pricing
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const priceRes = await fetch(`https://catalog.gog.com/v1/catalog?id=${gogId}&country=BR&currency=BRL`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!priceRes.ok) return null;
      
      const priceData = await priceRes.json();
      if (priceData.products && priceData.products.length > 0) {
        const product = priceData.products[0];
        const price = product.price?.finalMoney?.amount ? parseFloat(product.price.finalMoney.amount) : 0;
        
        return {
          storeId: this.storeId,
          storeName: this.storeName,
          price,
          url: product.storeLink,
          isOfficial: this.isOfficial,
        };
      }
      return null;
    } catch (e) {
      console.error(`GogAdapter getPriceByIdentifier error for ${gogId}:`, e);
      return null;
    }
  }
}
