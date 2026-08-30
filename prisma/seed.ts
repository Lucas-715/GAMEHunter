import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')
  
  // 1. Create User
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      name: 'Test User',
      email: 'test@example.com',
      passwordHash: 'hashed_password', // mock
    },
  })
  
  // 2. Create Stores
  const stores = [
    { name: 'Steam', type: 'OFFICIAL', baseCountry: 'US' },
    { name: 'Epic Games', type: 'OFFICIAL', baseCountry: 'US' },
    { name: 'GOG', type: 'OFFICIAL', baseCountry: 'PL' }
  ]
  
  const createdStores = await Promise.all(
    stores.map(store => 
      prisma.store.upsert({
        where: { name: store.name },
        update: {},
        create: store
      })
    )
  )

  // 3. Create Games
  const games = [
    { name: 'Cyberpunk 2077', publisher: 'CD PROJEKT RED', category: 'RPG' },
    { name: 'Elden Ring', publisher: 'Bandai Namco', category: 'RPG' },
    { name: 'Hollow Knight', publisher: 'Team Cherry', category: 'Metroidvania' }
  ]
  
  const createdGames = await Promise.all(
    games.map(game => 
      prisma.game.create({
        data: game
      })
    )
  )

  // 4. Generate Price History (Last 90 Days)
  const today = new Date()
  
  for (const game of createdGames) {
    for (const store of createdStores) {
      // Create a base price
      let basePrice = 0
      if (game.name === 'Cyberpunk 2077') basePrice = 199.90
      else if (game.name === 'Elden Ring') basePrice = 229.90
      else basePrice = 46.99
      
      // Randomize history
      const priceHistory = []
      for (let i = 90; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        
        // Simulate a sale: 20% chance of being on sale for 30-50% off
        const isOnSale = Math.random() > 0.8
        const discount = isOnSale ? (Math.random() * 0.2 + 0.3) : 0
        const currentPrice = basePrice * (1 - discount)
        
        priceHistory.push({
          price: parseFloat(currentPrice.toFixed(2)),
          currency: 'BRL',
          region: 'BR',
          collectionDate: date,
          gameId: game.id,
          storeId: store.id
        })
      }
      
      await prisma.priceHistory.createMany({
        data: priceHistory
      })
    }
  }

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
