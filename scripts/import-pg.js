const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  const data = JSON.parse(fs.readFileSync('db_backup.json', 'utf8'));

  console.log('Inserting Stores...');
  for (const store of data.stores) {
    await prisma.store.upsert({
      where: { id: store.id },
      update: store,
      create: store,
    });
  }

  console.log('Inserting Games...');
  for (const game of data.games) {
    // some sqlite datetimes might be string format, parse them
    if (game.releaseDate) game.releaseDate = new Date(game.releaseDate);
    if (game.createdAt) game.createdAt = new Date(game.createdAt);
    if (game.updatedAt) game.updatedAt = new Date(game.updatedAt);
    
    await prisma.game.upsert({
      where: { id: game.id },
      update: game,
      create: game,
    });
  }

  console.log('Inserting Users...');
  for (const user of data.users) {
    if (user.createdAt) user.createdAt = new Date(user.createdAt);
    if (user.updatedAt) user.updatedAt = new Date(user.updatedAt);
    
    await prisma.user.upsert({
      where: { id: user.id },
      update: user,
      create: user,
    });
  }

  console.log('Inserting Price Histories...');
  for (const ph of data.priceHistories) {
    if (ph.collectionDate) ph.collectionDate = new Date(ph.collectionDate);
    await prisma.priceHistory.upsert({
      where: { id: ph.id },
      update: ph,
      create: ph,
    });
  }

  console.log('Inserting Alerts...');
  for (const alert of data.alerts) {
    if (alert.createdAt) alert.createdAt = new Date(alert.createdAt);
    if (alert.updatedAt) alert.updatedAt = new Date(alert.updatedAt);
    await prisma.alert.upsert({
      where: { id: alert.id },
      update: alert,
      create: alert,
    });
  }

  console.log('Inserting Wishlists...');
  for (const wl of data.wishlists) {
    if (wl.createdAt) wl.createdAt = new Date(wl.createdAt);
    await prisma.wishlist.upsert({
      where: { id: wl.id },
      update: wl,
      create: wl,
    });
  }

  console.log('Inserting Search Caches...');
  for (const sc of data.searchCaches) {
    if (sc.expiresAt) sc.expiresAt = new Date(sc.expiresAt);
    if (sc.createdAt) sc.createdAt = new Date(sc.createdAt);
    if (sc.updatedAt) sc.updatedAt = new Date(sc.updatedAt);
    await prisma.searchCache.upsert({
      where: { id: sc.id },
      update: sc,
      create: sc,
    });
  }

  console.log('Data migration complete!');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
