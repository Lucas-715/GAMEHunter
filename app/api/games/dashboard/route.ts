import { NextResponse } from 'next/server';
import { searchEngine } from '@/lib/search-engine';
import { rawg } from '@/lib/rawg';
import { prisma } from '@/lib/prisma';
import { GameItem } from '@/lib/types';
import { mockGames } from '@/lib/gamesData';

export const dynamic = 'force-dynamic';

export async function GET() {
  const cacheKey = 'dashboard_deals_v12';
  
  try {
    try {
      const cached = await prisma.searchCache.findUnique({ where: { key: cacheKey } });
      if (cached && cached.expiresAt > new Date()) {
        const parsed = JSON.parse(cached.data);
        if (parsed.featured?.length > 0 && parsed.opportunities?.length > 0) {
          return NextResponse.json(parsed);
        }
      }
    } catch {
      // Continua se o cache do Prisma falhar
    }

    // Busca jogos combinando o banco de dados local, catálogo curado e APIs
    const { games } = await searchEngine.searchGames('popular');
    
    // Garante que todos os jogos do mockGames também estejam disponíveis se houver poucos resultados
    const mergedMap = new Map<string, GameItem>();
    for (const g of games) {
      mergedMap.set(g.name.toLowerCase(), g);
    }
    for (const mg of mockGames) {
      if (!mergedMap.has(mg.name.toLowerCase())) {
        mergedMap.set(mg.name.toLowerCase(), mg);
      }
    }

    const allGames = Array.from(mergedMap.values());

    let featured = allGames.slice(0, 4);
    const opportunities = allGames.slice(0, 10);

    // Enriquecimento opcional com RAWG se RAWG_API_KEY estiver configurada
    if (process.env.RAWG_API_KEY) {
      featured = await Promise.all(
        featured.map(async (game) => {
          try {
            const rawgData = await rawg.searchGame(game.name);
            if (rawgData) {
              game.coverImageUrl = rawgData.background_image || game.coverImageUrl;
              game.bannerImage = rawgData.background_image || game.bannerImage;
              game.tags = [
                ...new Set([
                  ...(game.tags || []),
                  ...rawgData.genres.map((g: any) => g.name),
                ]),
              ];
            }
          } catch {
            // Ignora falha na RAWG
          }
          return game;
        })
      );
    }

    const responseData = {
      featured,
      opportunities,
      games: allGames,
    };

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 2);

    try {
      await prisma.searchCache.upsert({
        where: { key: cacheKey },
        update: { data: JSON.stringify(responseData), expiresAt },
        create: { key: cacheKey, data: JSON.stringify(responseData), expiresAt },
      });
    } catch {
      // Ignora erro de escrita em ambiente read-only
    }

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("Dashboard API Error:", error);
    // Fallback resiliente para nunca quebrar a UI
    return NextResponse.json({
      featured: mockGames.slice(0, 4),
      opportunities: mockGames,
      games: mockGames,
    });
  }
}
