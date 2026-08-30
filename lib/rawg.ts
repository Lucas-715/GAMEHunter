// lib/rawg.ts
export interface RawgGameSearchInfo {
  id: number;
  slug: string;
  name: string;
  background_image: string;
  rating: number; // usually out of 5
  metacritic: number;
  genres: Array<{ id: number; name: string }>;
  tags: Array<{ id: number; name: string }>;
}

const RAWG_BASE_URL = 'https://api.rawg.io/api';
const RAWG_API_KEY = process.env.RAWG_API_KEY;

export const rawg = {
  /**
   * Search for a game by name to get enriched metadata.
   */
  async searchGame(query: string): Promise<RawgGameSearchInfo | null> {
    if (!RAWG_API_KEY) {
      console.warn('RAWG_API_KEY is not defined. Skipping RAWG enrichment.');
      return null;
    }

    try {
      // Clean query a bit for better RAWG matching
      const cleanQuery = query.replace(/[:\-]/g, ' ').trim();
      
      const res = await fetch(`${RAWG_BASE_URL}/games?key=${RAWG_API_KEY}&search=${encodeURIComponent(cleanQuery)}&page_size=3`, {
        next: { revalidate: 3600 } // Cache for 1 hour at Next.js fetch level
      });
      
      if (!res.ok) {
        throw new Error(`RAWG API error: ${res.status}`);
      }

      const data = await res.json();
      
      if (data.results && data.results.length > 0) {
        // Simple fuzzy match strategy: just return the first result 
        // since RAWG usually sorts best matches first.
        return data.results[0] as RawgGameSearchInfo;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching from RAWG:', error);
      return null;
    }
  },

  /**
   * Get specific game details by RAWG slug or ID if more details are needed
   */
  async getGameDetails(idOrSlug: string | number): Promise<RawgGameSearchInfo | null> {
    if (!RAWG_API_KEY) return null;

    try {
      const res = await fetch(`${RAWG_BASE_URL}/games/${idOrSlug}?key=${RAWG_API_KEY}`, {
        next: { revalidate: 3600 }
      });
      
      if (!res.ok) {
        throw new Error(`RAWG API error: ${res.status}`);
      }

      return await res.json() as RawgGameSearchInfo;
    } catch (error) {
      console.error('Error fetching details from RAWG:', error);
      return null;
    }
  }
};
