import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  const games = await prisma.game.findMany({
    where: {
      name: {
        contains: 'Dragon Ball',
        mode: 'insensitive'
      }
    },
    include: {
      priceHistory: {
        include: { store: true }
      }
    }
  });
  
  for (const game of games) {
    console.log(game.name);
    console.log(" Stores:", [...new Set(game.priceHistory.map(ph => ph.store.name))]);
  }
}
check();
