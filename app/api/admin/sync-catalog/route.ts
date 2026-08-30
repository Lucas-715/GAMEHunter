import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeTitle } from '@/lib/prices/matcher';

/**
 * Route to synchronize the base catalog of games from Steam API.
 * This should be triggered periodically (e.g. daily) to keep our local database
 * aware of all existing games.
 */
export async function GET(req: Request) {
  // Simple auth check via header or search param
  const url = new URL(req.url);
  const secret = url.searchParams.get('secret');
  
  if (secret !== process.env.ADMIN_SECRET && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const res = await fetch('https://api.steampowered.com/ISteamApps/GetAppList/v2/');
    if (!res.ok) {
      throw new Error('Failed to fetch from Steam');
    }
    
    const data = await res.json();
    const apps = data.applist?.apps;
    
    if (!apps || !Array.isArray(apps)) {
      throw new Error('Invalid format from Steam');
    }

    console.log(`Received ${apps.length} apps from Steam`);
    
    // We only process a chunk to prevent massive DB lock or timeout in serverless
    // In a real scenario, this would be a queued background job, but for now we take a limit
    const limitParam = url.searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam) : 500;
    
    // Reverse to get the latest games first, or process randomly
    const appsToProcess = apps.reverse().slice(0, limit);
    
    let processed = 0;
    let newGames = 0;

    // Use transaction for batch insert/upsert
    for (const app of appsToProcess) {
      if (!app.name) continue;
      
      const steamAppId = app.appid.toString();
      const slug = normalizeTitle(app.name).replace(/\s+/g, '-');
      
      // Skip very empty or weird names
      if (!slug || slug.length < 2) continue;

      try {
        const existing = await prisma.game.findUnique({
          where: { steamAppId }
        });

        if (!existing) {
          // If the slug already exists from another game without steamAppId, we'll get an error, 
          // so we use a unique slug combining appId if necessary
          const uniqueSlug = `${slug}-${steamAppId}`;

          await prisma.game.create({
            data: {
              name: app.name,
              steamAppId,
              slug: uniqueSlug,
            }
          });
          newGames++;
        }
        processed++;
      } catch (err) {
        // Silently ignore individual insert errors (e.g. duplicate slug edge cases)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${processed} apps, added ${newGames} new games.`,
    });

  } catch (error) {
    console.error('Catalog Sync Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
