// lib/scrapers/nuuvem.ts
import * as cheerio from 'cheerio';
import { Store } from '../types';

export interface ScrapedGame {
  title: string;
  storeId: string;
  price: number;
  url: string;
  isOfficial: boolean;
  coverImage?: string;
}

export const nuuvemScraper = {
  /**
   * Search Nuuvem catalog for a game and return scraped results.
   */
  async searchGames(query: string): Promise<ScrapedGame[]> {
    try {
      const searchUrl = `https://www.nuuvem.com/br-pt/catalog/search/${encodeURIComponent(query)}`;
      
      const res = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        },
        next: { revalidate: 3600 } 
      });

      if (!res.ok) {
        if (res.status === 403) {
          console.warn('Nuuvem Cloudflare blocked the request. Omitting Nuuvem from results.');
          return [];
        }
        throw new Error(`Nuuvem fetch failed: ${res.status}`);
      }

      const html = await res.text();
      const $ = cheerio.load(html);
      
      const games: ScrapedGame[] = [];

      // Nuuvem uses product cards in their grid.
      $('.product-card--grid').each((_, el) => {
        const title = $(el).attr('data-track-product-name');
        const priceStr = $(el).attr('data-track-product-price'); // Usually a float string or similar
        const url = $(el).find('a.product-card--wrapper').attr('href');
        const img = $(el).find('img.product-img').attr('src');

        if (title && priceStr && url) {
          const price = parseFloat(priceStr);
          
          if (!isNaN(price)) {
            games.push({
              title,
              price,
              url,
              storeId: 'nuuvem',
              isOfficial: true,
              coverImage: img
            });
          }
        }
      });

      return games;
    } catch (error) {
      console.error('Nuuvem scraper error:', error);
      return [];
    }
  }
};
