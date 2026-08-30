export interface StorePriceResult {
  storeId: string;
  storeName: string;
  price: number;
  url: string;
  isOfficial: boolean;
}

export interface StoreSearchResult {
  title: string;
  url: string;
  price: number;
  // Depending on the store, they might provide their own ID
  storeInternalId?: string;
}

export interface StoreAdapter {
  storeId: string; 
  storeName: string;
  isOfficial: boolean;
  
  /**
   * Search for a game by title in the store's search engine.
   * Useful for stores that do not have a robust API.
   */
  searchByTitle(title: string): Promise<StoreSearchResult[]>;
  
  /**
   * Get the current price of a game by an identifier.
   * The identifier could be a steamAppId, a store-specific slug, etc.
   */
  getPriceByIdentifier(identifier: string): Promise<StorePriceResult | null>;
}
