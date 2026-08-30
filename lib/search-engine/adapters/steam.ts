import { StoreAdapter, StorePriceResult, StoreSearchResult } from '../types';

export class SteamAdapter implements StoreAdapter {
  storeId = 'steam';
  storeName = 'Steam';
  isOfficial = true;

  /**
   * We don't usually need to scrape Steam for search because we have the Catalog.
   * However, this is a fallback using the public storefront search if needed.
   */
  async searchByTitle(title: string): Promise<StoreSearchResult[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(title)}&l=portuguese&cc=BR`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) return [];
      
      const data = await res.json();
      if (!data || !data.items) return [];

      return data.items.map((item: any) => ({
        title: item.name,
        url: `https://store.steampowered.com/app/${item.id}`,
        price: item.price ? item.price / 100 : 0, // Steam returns price in cents usually in this endpoint
        storeInternalId: item.id.toString(),
      }));
    } catch (e) {
      console.error(`SteamAdapter searchByTitle error:`, e);
      return [];
    }
  }

  async getPriceByIdentifier(appId: string): Promise<StorePriceResult | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}&cc=br&filters=price_overview,basic`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) return null;
      
      const data = await res.json();
      const appData = data[appId];

      if (!appData || !appData.success || !appData.data) {
        return null;
      }

      const gameDetails = appData.data;

      // Handle Free to Play
      if (gameDetails.is_free) {
        return {
          storeId: this.storeId,
          storeName: this.storeName,
          price: 0,
          url: `https://store.steampowered.com/app/${appId}`,
          isOfficial: this.isOfficial,
        };
      }

      const priceOverview = gameDetails.price_overview;
      
      if (!priceOverview) {
        return null; // Might be a game no longer for sale
      }

      return {
        storeId: this.storeId,
        storeName: this.storeName,
        price: priceOverview.final / 100, // Steam returns price in cents (e.g. 19900 for R$ 199,00)
        url: `https://store.steampowered.com/app/${appId}`,
        isOfficial: this.isOfficial,
      };
    } catch (e) {
      console.error(`SteamAdapter getPriceByIdentifier error for ${appId}:`, e);
      return null;
    }
  }

  /**
   * Helper specifically for Steam to fetch full details including genres, is_free, cover image, etc.
   */
  async getFullAppDetails(appId: string) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}&cc=br&l=portuguese`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) return null;
      
      const data = await res.json();
      const appData = data[appId];
      if (appData?.success && appData.data) {
        if (appData.data.type !== 'game') {
          return null;
        }
        return appData.data;
      }
      return null;
    } catch (e) {
      console.error(`SteamAdapter getFullAppDetails error for ${appId}:`, e);
      return null;
    }
  }
}

