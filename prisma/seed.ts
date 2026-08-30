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
    { name: 'Nuuvem', type: 'RESELLER', baseCountry: 'BR' },
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

  // Clear existing games to avoid duplicates if run multiple times without reset
  await prisma.priceHistory.deleteMany({})
  await prisma.game.deleteMany({})

  // 3. Create Games with official images
  const games = [
    { name: 'Cyberpunk 2077', publisher: 'CD PROJEKT RED', category: 'RPG', coverImageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg', basePrice: 199.90 },
    { name: 'Elden Ring', publisher: 'Bandai Namco', category: 'Action RPG', coverImageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg', basePrice: 229.90 },
    { name: 'Red Dead Redemption 2', publisher: 'Rockstar Games', category: 'Action/Adventure', coverImageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1174180/header.jpg', basePrice: 299.90 },
    { name: 'The Witcher 3: Wild Hunt', publisher: 'CD PROJEKT RED', category: 'RPG', coverImageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/292030/header.jpg', basePrice: 139.99 },
    { name: 'Grand Theft Auto V', publisher: 'Rockstar Games', category: 'Action', coverImageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/271590/header.jpg', basePrice: 109.89 },
    { name: 'Baldur\'s Gate 3', publisher: 'Larian Studios', category: 'RPG', coverImageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1086940/header.jpg', basePrice: 199.99 },
    { name: 'Hollow Knight', publisher: 'Team Cherry', category: 'Metroidvania', coverImageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/367520/header.jpg', basePrice: 46.99 },
    { name: 'Stardew Valley', publisher: 'ConcernedApe', category: 'Simulation', coverImageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/413150/header.jpg', basePrice: 24.99 },
    { name: 'No Man\'s Sky', publisher: 'Hello Games', category: 'Survival', coverImageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/275850/header.jpg', basePrice: 162.00 },
    { name: 'Hogwarts Legacy', publisher: 'Warner Bros. Games', category: 'Action RPG', coverImageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/990080/header.jpg', basePrice: 249.99 },
    { name: 'Black Myth: Wukong', publisher: 'Game Science', category: 'Action RPG', coverImageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2358720/header.jpg', basePrice: 229.99 },
    { name: 'DOOM Eternal', publisher: 'Bethesda', category: 'FPS', coverImageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/782330/header.jpg', basePrice: 149.00 },
    { name: 'Resident Evil 4', publisher: 'Capcom', category: 'Survival Horror', coverImageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2050650/header.jpg', basePrice: 199.90 },
    { name: 'Persona 5 Royal', publisher: 'SEGA', category: 'JRPG', coverImageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1687950/header.jpg', basePrice: 249.00 },
    { name: 'Final Fantasy VII Remake', publisher: 'Square Enix', category: 'JRPG', coverImageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1462040/header.jpg', basePrice: 349.90 },
    { name: 'Sekiro: Shadows Die Twice', publisher: 'Activision', category: 'Action', coverImageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/814380/header.jpg', basePrice: 199.90 },
    { name: 'Horizon Zero Dawn', publisher: 'PlayStation', category: 'Action RPG', coverImageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1151640/header.jpg', basePrice: 199.90 },
    { name: 'God of War', publisher: 'PlayStation', category: 'Action', coverImageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1593500/header.jpg', basePrice: 199.90 },
    { name: 'Marvel\'s Spider-Man Remastered', publisher: 'PlayStation', category: 'Action', coverImageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1817040/header.jpg', basePrice: 249.90 },
    { name: 'Hades', publisher: 'Supergiant Games', category: 'Roguelike', coverImageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1145360/header.jpg', basePrice: 73.99 },
    { name: 'Monster Hunter: World', publisher: 'Capcom', category: 'Action RPG', coverImageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/582010/header.jpg', basePrice: 99.90 },
    { name: 'Dead Space', publisher: 'Electronic Arts', category: 'Survival Horror', coverImageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1693980/header.jpg', basePrice: 249.00 },
    { name: 'Fallout 4', publisher: 'Bethesda', category: 'RPG', coverImageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/377160/header.jpg', basePrice: 59.99 },
    { name: 'Skyrim Special Edition', publisher: 'Bethesda', category: 'RPG', coverImageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/489830/header.jpg', basePrice: 149.00 },
    { name: 'Helldivers 2', publisher: 'PlayStation', category: 'Shooter', coverImageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/553850/header.jpg', basePrice: 199.50 },
    { name: 'Palworld', publisher: 'Pocketpair', category: 'Survival', coverImageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1623730/header.jpg', basePrice: 88.99 },
  ]
  
  const createdGames = await Promise.all(
    games.map(game => 
      prisma.game.create({
        data: {
          name: game.name,
          publisher: game.publisher,
          category: game.category,
          coverImageUrl: game.coverImageUrl,
        }
      })
    )
  )

  // 4. Generate Price History (Last 90 Days)
  const storeAvailability: Record<string, string[]> = {
    'Red Dead Redemption 2': ['Steam', 'Epic Games'],
    'Cyberpunk 2077': ['Steam', 'Epic Games', 'GOG'],
    'The Witcher 3: Wild Hunt': ['Steam', 'Epic Games', 'GOG', 'Nuuvem'],
    'Elden Ring': ['Steam'],
    'Baldur\'s Gate 3': ['Steam', 'GOG'],
    'Hogwarts Legacy': ['Steam', 'Epic Games'],
    'Black Myth: Wukong': ['Steam', 'Epic Games'],
    'DOOM Eternal': ['Steam', 'Epic Games'],
    'Resident Evil 4': ['Steam', 'Nuuvem'],
    'Persona 5 Royal': ['Steam'],
    'Final Fantasy VII Remake': ['Steam', 'Epic Games'],
    'Sekiro: Shadows Die Twice': ['Steam'],
    'Horizon Zero Dawn': ['Steam', 'Epic Games', 'GOG'],
    'God of War': ['Steam', 'Epic Games', 'GOG'],
    'Marvel\'s Spider-Man Remastered': ['Steam', 'Epic Games'],
    'Hades': ['Steam', 'Epic Games'],
    'Monster Hunter: World': ['Steam', 'Nuuvem'],
    'Dead Space': ['Steam', 'Epic Games'],
    'Fallout 4': ['Steam', 'Epic Games', 'GOG'],
    'Skyrim Special Edition': ['Steam', 'Epic Games', 'GOG'],
    'Helldivers 2': ['Steam'],
    'Palworld': ['Steam'],
  }

  for (let idx = 0; idx < createdGames.length; idx++) {
    const game = createdGames[idx]
    const gameInfo = games[idx]
    
    const availableStoreNames = storeAvailability[game.name] || ['Steam']
    const storesForGame = createdStores.filter(s => availableStoreNames.includes(s.name))

    for (const store of storesForGame) {
      // Create a current price
      const isDiscounted = Math.random() > 0.6
      const currentPrice = isDiscounted ? gameInfo.basePrice * 0.75 : gameInfo.basePrice // 25% off or full price

      await prisma.priceHistory.create({
        data: {
          gameId: game.id,
          storeId: store.id,
          price: currentPrice,
          currency: 'BRL',
          region: 'BR',
          collectionDate: new Date(),
        }
      })

      // Create historical prices for the chart
      for (let i = 1; i <= 10; i++) {
        const pastDate = new Date()
        pastDate.setDate(pastDate.getDate() - (i * 9))
        
        const historicalPrice = gameInfo.basePrice * (1 - (Math.random() * 0.5))
        await prisma.priceHistory.create({
          data: {
            gameId: game.id,
            storeId: store.id,
            price: parseFloat(historicalPrice.toFixed(2)),
            currency: 'BRL',
            region: 'BR',
            collectionDate: pastDate,
          }
        })
      }
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
