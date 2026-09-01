import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const witcher = await prisma.game.findFirst({
    where: { name: { contains: 'Witcher 3', mode: 'insensitive' } },
    include: { priceHistory: { include: { store: true } } }
  });
  console.log(witcher?.name);
  console.log(witcher?.priceHistory.map(p => ({
    store: p.store.name,
    url: p.url
  })));
}
main();
