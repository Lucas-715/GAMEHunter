import { StoreAdapter, StorePriceResult, StoreSearchResult } from '../types';
import { matchGameTitle } from '../matcher';

export class SteamAdapter implements StoreAdapter {
  storeId = 'steam';
  storeName = 'Steam';
  isOfficial = true;

  async searchByTitle(title: string): Promise<StoreSearchResult[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(
        `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(title)}&l=portuguese&cc=BR`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);
      if (!res.ok) return [];
      
      const data = await res.json();
      if (!data || !data.items) return [];

      return data.items.map((item: any) => {
        let finalPrice = 0;
        if (item.price) {
          if (typeof item.price === 'number') {
            finalPrice = item.price / 100;
          } else if (typeof item.price.final === 'number') {
            finalPrice = item.price.final / 100;
          }
        }
        return {
          title: item.name,
          url: `https://store.steampowered.com/app/${item.id}`,
          price: finalPrice,
          storeInternalId: item.id.toString(),
        };
      });
    } catch (e) {
      console.warn(`SteamAdapter searchByTitle warning:`, e);
      return [];
    }
  }

  async getPriceByIdentifier(identifier: string): Promise<StorePriceResult | null> {
    try {
      const isNumericAppId = /^\d+$/.test(identifier.trim());

      // Se recebemos o título em vez do AppID numérico, resolvemos via storesearch
      if (!isNumericAppId) {
        const searchResults = await this.searchByTitle(identifier);
        if (searchResults.length > 0) {
          const match = matchGameTitle(identifier, searchResults.map(r => r.title));
          const chosen = match ? searchResults.find(r => r.title === match.bestMatch) : searchResults[0];
          if (chosen && chosen.price > 0) {
            return {
              storeId: this.storeId,
              storeName: this.storeName,
              price: chosen.price,
              url: chosen.url,
              isOfficial: this.isOfficial,
            };
          }
        }
        return null;
      }

      const appId = identifier.trim();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(
        `https://store.steampowered.com/api/appdetails?appids=${appId}&cc=br&filters=price_overview,basic`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);
      if (!res.ok) return null;
      
      const data = await res.json();
      const appData = data[appId];

      if (!appData || !appData.success || !appData.data) {
        return null;
      }

      const gameDetails = appData.data;

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
      if (!priceOverview || typeof priceOverview.final !== 'number') {
        return null;
      }

      return {
        storeId: this.storeId,
        storeName: this.storeName,
        price: priceOverview.final / 100,
        url: `https://store.steampowered.com/app/${appId}`,
        isOfficial: this.isOfficial,
      };
    } catch (e) {
      console.warn(`SteamAdapter getPriceByIdentifier warning for ${identifier}:`, e);
      return null;
    }
  }

  async getFullAppDetails(appId: string) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(
        `https://store.steampowered.com/api/appdetails?appids=${appId}&cc=br&l=portuguese`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);
      if (!res.ok) return null;
      
      const data = await res.json();
      const appData = data[appId];
      if (appData?.success && appData.data) {
        return appData.data;
      }
      return null;
    } catch (e) {
      console.warn(`SteamAdapter getFullAppDetails warning for ${appId}:`, e);
      return null;
    }
  }
}
