import { StoreAdapter, StorePrice } from '../types';

export class GamersGateAdapter implements StoreAdapter {
  id = 'gamersgate';
  name = 'GamersGate';
  
  async getPriceByIdentifier(identifier: string): Promise<StorePrice | null> {
    try {
      // 1. Search for game on CheapShark by name
      const searchRes = await fetch(`https://www.cheapshark.com/api/1.0/games?title=${encodeURIComponent(identifier)}&limit=3`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        cache: 'no-store'
      });
      const searchData = await searchRes.json();
      if (!searchData || searchData.length === 0) return null;
      
      const gameId = searchData[0].gameID;
      
      // 2. Get game details
      const detailsRes = await fetch(`https://www.cheapshark.com/api/1.0/games?id=${gameId}`, {
         headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
         cache: 'no-store'
      });
      const detailsData = await detailsRes.json();
      if (!detailsData || !detailsData.deals) return null;
      
      // 3. Find GamersGate deal (storeID 2)
      const deal = detailsData.deals.find((d: any) => d.storeID === '2');
      if (!deal) return null;
      
      return {
        price: Number(deal.price),
        url: `https://www.cheapshark.com/redirect?dealID=${deal.dealID}`,
        isOfficial: true
      };
    } catch (error) {
      console.error('Error fetching GamersGate price:', error);
      return null;
    }
  }
}
