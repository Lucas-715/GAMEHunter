import { StoreAdapter, StorePriceResult, StoreSearchResult } from '../types';

export class NuuvemAdapter implements StoreAdapter {
  storeId = 'nuuvem';
  storeName = 'Nuuvem';
  isOfficial = true; // Considered official reseller

  // We mock the response to simulate the Nuuvem integration
  async searchByTitle(title: string): Promise<StoreSearchResult[]> {
    try {
      // Create a mock result based on the requested title
      // Nuuvem often has slightly cheaper prices for South America due to local currency
      const basePrice = 199.90; 
      // Add randomness for realistic mock prices
      const discount = Math.random() > 0.5 ? 0.8 : 0.95; // 20% or 5% discount
      
      const mockResult: StoreSearchResult = {
        title: title, // assume it found the exact game
        url: `https://www.nuuvem.com/br-pt/item/${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        price: parseFloat((basePrice * discount).toFixed(2)),
        storeInternalId: `nuuvem_${Date.now()}`
      };

      return [mockResult];
    } catch (e) {
      console.error(`NuuvemAdapter searchByTitle error:`, e);
      return [];
    }
  }

  async getPriceByIdentifier(nuuvemId: string): Promise<StorePriceResult | null> {
    // Return a mocked price result
    return {
      storeId: this.storeId,
      storeName: this.storeName,
      price: 159.90, // mock price
      url: `https://www.nuuvem.com`,
      isOfficial: this.isOfficial,
    };
  }
}
