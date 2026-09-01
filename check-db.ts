import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  const games = await prisma.game.findMany({
    where: {
      name: {
        contains: 'Dragon Ball',
        mode: 'insensitive'
      }
    }
  });
  console.log("DB Games found:", games.map(g => g.name));
}
check();
