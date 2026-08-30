const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  const games = await prisma.game.findMany();
  const stores = await prisma.store.findMany();
  const priceHistories = await prisma.priceHistory.findMany();
  const alerts = await prisma.alert.findMany();
  const wishlists = await prisma.wishlist.findMany();
  const searchCaches = await prisma.searchCache.findMany();

  const data = {
    users,
    games,
    stores,
    priceHistories,
    alerts,
    wishlists,
    searchCaches,
  };

  fs.writeFileSync('db_backup.json', JSON.stringify(data, null, 2));
  console.log('Dados exportados com sucesso para db_backup.json');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
