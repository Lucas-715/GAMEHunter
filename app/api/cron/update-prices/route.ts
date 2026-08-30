import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { priceAggregator } from '@/lib/prices/price-aggregator';

// Set standard timeout context for Edge/Serverless depending on deployment if needed
export const maxDuration = 60; // 60 seconds is the max for Vercel Hobby plan

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.warn("CRON_SECRET is not configured in the environment variables.");
      return NextResponse.json(
        { error: 'CRON_SECRET not configured' },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Process a batch of 10 games, prioritizing the ones that haven't been updated recently.
    // We can sort by updatedAt on the Game table, or ideally by the latest PriceHistory.
    // For simplicity and efficiency, let's just pick the 10 games with the oldest updatedAt,
    // and after processing we "touch" them (update their updatedAt).

    const gamesBatch = await prisma.game.findMany({
      take: 10,
      orderBy: {
        updatedAt: 'asc',
      },
    });

    if (gamesBatch.length === 0) {
      return NextResponse.json({ message: 'No games to update' }, { status: 200 });
    }

    let updatedCount = 0;
    const errors = [];

    for (const game of gamesBatch) {
      try {
        const aggregation = await priceAggregator.aggregatePrices(game.name, game.steamAppId);
        
        // Upsert stores and insert price history
        for (const offer of aggregation.stores) {
          const store = await prisma.store.upsert({
            where: { name: offer.name },
            update: {}, // Already exists, do nothing
            create: {
              name: offer.name,
              type: offer.isOfficial ? 'OFFICIAL' : 'RESELLER',
              integrationStatus: 'ACTIVE',
            },
          });

          await prisma.priceHistory.create({
            data: {
              price: offer.price,
              currency: 'BRL',
              region: 'BR',
              link: offer.url,
              gameId: game.id,
              storeId: store.id,
            },
          });
        }

        // Update the game to reflect new info (e.g. coverImage, isFree) and touch updatedAt
        await prisma.game.update({
          where: { id: game.id },
          data: {
            coverImageUrl: aggregation.coverImageUrl || game.coverImageUrl,
            isFree: aggregation.isFree,
            // Prisma will automatically update the `updatedAt` field when modifying the record
          }
        });

        updatedCount++;
      } catch (err: any) {
        console.error(`Failed to update game ${game.id} (${game.name}):`, err);
        errors.push({ gameId: game.id, error: err.message });
      }
    }

    return NextResponse.json({
      message: 'Batch processing complete',
      processed: gamesBatch.length,
      successes: updatedCount,
      failures: errors.length,
      errors
    }, { status: 200 });

  } catch (error: any) {
    console.error("Cron Update Prices Error:", error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
