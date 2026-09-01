import { StoreAdapter, StorePriceResult } from '../types';

export class GreenManGamingAdapter implements StoreAdapter {
  storeId = 'gmg';
  storeName = 'Green Man Gaming';
  isOfficial = true;

  async searchByTitle(title: string): Promise<any[]> {
    return [];
  }
  
  async getPriceByIdentifier(identifier: string): Promise<StorePriceResult | null> {
    try {
      // 1. Search for game on CheapShark by name
      const searchRes = await fetch(`https://www.cheapshark.com/api/1.0/games?title=${encodeURIComponent(identifier)}&limit=3`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        cache: 'no-store'
      });
      const searchData = await searchRes.json();
      if (!searchData || searchData.length === 0) return null;
      
      // Get the best match (usually the first one)
      const gameId = searchData[0].gameID;
      
      // 2. Get game details
      const detailsRes = await fetch(`https://www.cheapshark.com/api/1.0/games?id=${gameId}`, {
         headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
         cache: 'no-store'
      });
      const detailsData = await detailsRes.json();
      if (!detailsData || !detailsData.deals) return null;
      
      // 3. Find Green Man Gaming deal (storeID 3)
      const gmgDeal = detailsData.deals.find((d: any) => d.storeID === '3');
      if (!gmgDeal) return null;
      
      return {
        storeId: this.storeId,
        storeName: this.storeName,
        price: Number(gmgDeal.price),
        url: `https://www.cheapshark.com/redirect?dealID=${gmgDeal.dealID}`,
        isOfficial: this.isOfficial
      };
    } catch (error) {
      console.error('Error fetching GMG price:', error);
      return null;
    }
  }
}
