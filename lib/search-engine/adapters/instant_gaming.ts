import { StoreAdapter, StorePriceResult, StoreSearchResult } from '../types';

export class InstantGamingAdapter implements StoreAdapter {
  storeId = 'instantgaming';
  storeName = 'Instant Gaming';
  isOfficial = false; // Important: Reseller, triggers risk warnings

  // Mocking the response
  async searchByTitle(title: string): Promise<StoreSearchResult[]> {
    try {
      const basePrice = 199.90; 
      // Instant gaming usually has steeper discounts but is unofficial
      const discount = Math.random() > 0.5 ? 0.6 : 0.75; 
      
      const mockResult: StoreSearchResult = {
        title: title, 
        url: `https://www.instant-gaming.com/pt/pesquisar/?q=${encodeURIComponent(title)}`,
        price: parseFloat((basePrice * discount).toFixed(2)),
        storeInternalId: `ig_${Date.now()}`
      };

      return [mockResult];
    } catch (e) {
      console.error(`InstantGamingAdapter searchByTitle error:`, e);
      return [];
    }
  }

  async getPriceByIdentifier(igId: string): Promise<StorePriceResult | null> {
    return {
      storeId: this.storeId,
      storeName: this.storeName,
      price: 139.90, 
      url: `https://www.instant-gaming.com`,
      isOfficial: this.isOfficial,
    };
  }
}
