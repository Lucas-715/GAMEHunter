import { GameItem, FreeGame, Notification, WishlistAlert } from './types';

export const mockGames: GameItem[] = [
  {
    id: "1245620",
    steamAppId: "1245620",
    name: "Elden Ring",
    coverImageUrl: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg",
    bannerImage: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/library_hero.jpg",
    isFree: false,
    opportunityScore: 92,
    priceHistory: [
      { date: "2026-06-01", price: 229.90, score: 60 },
      { date: "2026-07-01", price: 199.90, score: 72 },
      { date: "2026-08-01", price: 179.90, score: 80 },
      { date: "2026-09-01", price: 229.90, score: 60 },
      { date: "2026-10-01", price: 169.90, score: 88 },
      { date: "2026-11-01", price: 159.90, score: 92 }
    ],
    allTimeLow: { price: 159.90, date: "2026-11-01" },
    stores: [
      { id: "nuuvem", name: "Nuuvem", price: 159.90, url: "https://www.nuuvem.com/br-pt/item/elden-ring", isOfficial: true },
      { id: "gmg", name: "Green Man Gaming", price: 164.50, url: "https://www.greenmangaming.com/pt/games/elden-ring-pc/", isOfficial: true },
      { id: "steam", name: "Steam", price: 229.90, url: "https://store.steampowered.com/app/1245620/ELDEN_RING/", isOfficial: true },
      { id: "gamersgate", name: "GamersGate", price: 172.00, url: "https://www.gamersgate.com/product/elden-ring/", isOfficial: false }
    ],
    tags: ["Action RPG", "Souls-like", "Mundo Aberto", "Metacritic: 96"]
  },
  {
    id: "1091500",
    steamAppId: "1091500",
    name: "Cyberpunk 2077",
    coverImageUrl: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg",
    bannerImage: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/library_hero.jpg",
    isFree: false,
    opportunityScore: 98,
    priceHistory: [
      { date: "2026-06-01", price: 199.90, score: 55 },
      { date: "2026-07-01", price: 149.90, score: 75 },
      { date: "2026-08-01", price: 119.90, score: 85 },
      { date: "2026-09-01", price: 199.90, score: 55 },
      { date: "2026-10-01", price: 99.95, score: 98 },
      { date: "2026-11-01", price: 99.95, score: 98 }
    ],
    allTimeLow: { price: 99.95, date: "2026-10-15" },
    stores: [
      { id: "gog", name: "GOG", price: 99.95, url: "https://www.gog.com/en/game/cyberpunk_2077", isOfficial: true },
      { id: "nuuvem", name: "Nuuvem", price: 104.90, url: "https://www.nuuvem.com/br-pt/item/cyberpunk-2077", isOfficial: true },
      { id: "steam", name: "Steam", price: 199.90, url: "https://store.steampowered.com/app/1091500/Cyberpunk_2077/", isOfficial: true },
      { id: "gmg", name: "Green Man Gaming", price: 109.90, url: "https://www.greenmangaming.com/pt/search?query=Cyberpunk%202077", isOfficial: true }
    ],
    tags: ["Cyberpunk", "RPG", "Ficção Científica", "Mundo Aberto"]
  },
  {
    id: "1086940",
    steamAppId: "1086940",
    name: "Baldur's Gate 3",
    coverImageUrl: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1086940/header.jpg",
    bannerImage: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1086940/library_hero.jpg",
    isFree: false,
    opportunityScore: 88,
    priceHistory: [
      { date: "2026-06-01", price: 199.99, score: 65 },
      { date: "2026-07-01", price: 179.99, score: 78 },
      { date: "2026-08-01", price: 199.99, score: 65 },
      { date: "2026-09-01", price: 169.99, score: 84 },
      { date: "2026-10-01", price: 159.99, score: 88 },
      { date: "2026-11-01", price: 159.99, score: 88 }
    ],
    allTimeLow: { price: 159.99, date: "2026-10-20" },
    stores: [
      { id: "gog", name: "GOG", price: 159.99, url: "https://www.gog.com/en/game/baldurs_gate_iii", isOfficial: true },
      { id: "steam", name: "Steam", price: 199.99, url: "https://store.steampowered.com/app/1086940/Baldurs_Gate_3/", isOfficial: true },
      { id: "nuuvem", name: "Nuuvem", price: 169.90, url: "https://www.nuuvem.com/br-pt/catalog/search/Baldur's%20Gate%203", isOfficial: true }
    ],
    tags: ["CRPG", "D&D", "Escolhas Importam", "Metacritic: 96"]
  },
  {
    id: "1174180",
    steamAppId: "1174180",
    name: "Red Dead Redemption 2",
    coverImageUrl: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1174180/header.jpg",
    bannerImage: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1174180/library_hero.jpg",
    isFree: false,
    opportunityScore: 100,
    priceHistory: [
      { date: "2026-06-01", price: 299.90, score: 40 },
      { date: "2026-07-01", price: 119.96, score: 85 },
      { date: "2026-08-01", price: 299.90, score: 40 },
      { date: "2026-09-01", price: 98.96, score: 95 },
      { date: "2026-10-01", price: 89.90, score: 100 },
      { date: "2026-11-01", price: 89.90, score: 100 }
    ],
    allTimeLow: { price: 89.90, date: "2026-10-25" },
    stores: [
      { id: "nuuvem", name: "Nuuvem", price: 89.90, url: "https://www.nuuvem.com/br-pt/item/red-dead-redemption-2", isOfficial: true },
      { id: "gmg", name: "Green Man Gaming", price: 94.50, url: "https://www.greenmangaming.com/pt/games/red-dead-redemption-2-pc/", isOfficial: true },
      { id: "steam", name: "Steam", price: 299.90, url: "https://store.steampowered.com/app/1174180/Red_Dead_Redemption_2/", isOfficial: true }
    ],
    tags: ["Mundo Aberto", "Velho Oeste", "Obra-prima", "Metacritic: 97"]
  },
  {
    id: "292030",
    steamAppId: "292030",
    name: "The Witcher 3: Wild Hunt",
    coverImageUrl: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/292030/header.jpg",
    bannerImage: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/292030/library_hero.jpg",
    isFree: false,
    opportunityScore: 100,
    priceHistory: [
      { date: "2026-06-01", price: 129.99, score: 50 },
      { date: "2026-08-01", price: 49.99, score: 88 },
      { date: "2026-10-01", price: 32.49, score: 100 }
    ],
    allTimeLow: { price: 32.49, date: "2026-10-01" },
    stores: [
      { id: "gog", name: "GOG", price: 32.49, url: "https://www.gog.com/en/game/the_witcher_3_wild_hunt", isOfficial: true },
      { id: "steam", name: "Steam", price: 129.99, url: "https://store.steampowered.com/app/292030/The_Witcher_3_Wild_Hunt/", isOfficial: true },
      { id: "nuuvem", name: "Nuuvem", price: 38.90, url: "https://www.nuuvem.com/br-pt/catalog/search/The%20Witcher%203", isOfficial: true }
    ],
    tags: ["RPG", "Fantasia Sombria", "Mundo Aberto"]
  },
  {
    id: "2358720",
    steamAppId: "2358720",
    name: "Black Myth: Wukong",
    coverImageUrl: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2358720/header.jpg",
    bannerImage: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2358720/library_hero.jpg",
    isFree: false,
    opportunityScore: 84,
    priceHistory: [
      { date: "2026-08-01", price: 229.99, score: 65 },
      { date: "2026-10-01", price: 194.90, score: 84 }
    ],
    allTimeLow: { price: 194.90, date: "2026-10-12" },
    stores: [
      { id: "nuuvem", name: "Nuuvem", price: 194.90, url: "https://www.nuuvem.com/br-pt/item/black-myth-wukong", isOfficial: true },
      { id: "gmg", name: "Green Man Gaming", price: 199.90, url: "https://www.greenmangaming.com/pt/games/black-myth-wukong-pc/", isOfficial: true },
      { id: "steam", name: "Steam", price: 229.99, url: "https://store.steampowered.com/app/2358720/Black_Myth_Wukong/", isOfficial: true }
    ],
    tags: ["Action RPG", "Mitologia", "Combate Intenso"]
  },
  {
    id: "2050650",
    steamAppId: "2050650",
    name: "Resident Evil 4",
    coverImageUrl: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2050650/header.jpg",
    bannerImage: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2050650/library_hero.jpg",
    isFree: false,
    opportunityScore: 95,
    priceHistory: [
      { date: "2026-07-01", price: 169.00, score: 60 },
      { date: "2026-09-01", price: 119.00, score: 82 },
      { date: "2026-11-01", price: 84.50, score: 95 }
    ],
    allTimeLow: { price: 84.50, date: "2026-11-01" },
    stores: [
      { id: "nuuvem", name: "Nuuvem", price: 84.50, url: "https://www.nuuvem.com/br-pt/item/resident-evil-4", isOfficial: true },
      { id: "gamersgate", name: "GamersGate", price: 89.90, url: "https://www.gamersgate.com/product/resident-evil-4/", isOfficial: true },
      { id: "steam", name: "Steam", price: 139.00, url: "https://store.steampowered.com/app/2050650/Resident_Evil_4/", isOfficial: true }
    ],
    tags: ["Survival Horror", "Ação", "Remake"]
  },
  {
    id: "1593500",
    steamAppId: "1593500",
    name: "God of War",
    coverImageUrl: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1593500/header.jpg",
    bannerImage: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1593500/library_hero.jpg",
    isFree: false,
    opportunityScore: 91,
    priceHistory: [
      { date: "2026-07-01", price: 199.90, score: 50 },
      { date: "2026-10-01", price: 79.96, score: 91 }
    ],
    allTimeLow: { price: 79.96, date: "2026-10-18" },
    stores: [
      { id: "nuuvem", name: "Nuuvem", price: 79.96, url: "https://www.nuuvem.com/br-pt/item/god-of-war", isOfficial: true },
      { id: "gog", name: "GOG", price: 99.95, url: "https://www.gog.com/en/game/god_of_war", isOfficial: true },
      { id: "steam", name: "Steam", price: 199.90, url: "https://store.steampowered.com/app/1593500/God_of_War/", isOfficial: true }
    ],
    tags: ["Ação", "Aventura", "Mitologia Nórdica"]
  },
  {
    id: "367520",
    steamAppId: "367520",
    name: "Hollow Knight",
    coverImageUrl: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/367520/header.jpg",
    bannerImage: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/367520/library_hero.jpg",
    isFree: false,
    opportunityScore: 96,
    priceHistory: [
      { date: "2026-07-01", price: 46.99, score: 70 },
      { date: "2026-10-01", price: 23.49, score: 96 }
    ],
    allTimeLow: { price: 23.49, date: "2026-10-05" },
    stores: [
      { id: "nuuvem", name: "Nuuvem", price: 23.49, url: "https://www.nuuvem.com/br-pt/item/hollow-knight", isOfficial: true },
      { id: "gog", name: "GOG", price: 23.49, url: "https://www.gog.com/en/game/hollow_knight", isOfficial: true },
      { id: "steam", name: "Steam", price: 46.99, url: "https://store.steampowered.com/app/367520/Hollow_Knight/", isOfficial: true }
    ],
    tags: ["Metroidvania", "Indie", "2D", "Souls-like"]
  },
  {
    id: "553850",
    steamAppId: "553850",
    name: "HELLDIVERS 2",
    coverImageUrl: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/553850/header.jpg",
    bannerImage: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/553850/library_hero.jpg",
    isFree: false,
    opportunityScore: 86,
    priceHistory: [
      { date: "2026-08-01", price: 199.50, score: 65 },
      { date: "2026-11-01", price: 159.60, score: 86 }
    ],
    allTimeLow: { price: 159.60, date: "2026-11-01" },
    stores: [
      { id: "nuuvem", name: "Nuuvem", price: 159.60, url: "https://www.nuuvem.com/br-pt/item/helldivers-2", isOfficial: true },
      { id: "gmg", name: "Green Man Gaming", price: 162.90, url: "https://www.greenmangaming.com/pt/games/helldivers-2-pc/", isOfficial: true },
      { id: "steam", name: "Steam", price: 199.50, url: "https://store.steampowered.com/app/553850/HELLDIVERS_2/", isOfficial: true }
    ],
    tags: ["Co-op Online", "Tiro em Terceira Pessoa", "Ação"]
  }
];

export const mockFreeGames: FreeGame[] = [
  {
    id: "f1",
    title: "Marvel's Midnight Suns",
    provider: "Epic Games Store",
    image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/368260/header.jpg",
    claimUrl: "https://store.epicgames.com/pt-BR/free-games",
    expiresAt: "2026-12-15T15:00:00Z"
  },
  {
    id: "f2",
    title: "Fallout: New Vegas Ultimate",
    provider: "Prime Gaming / GOG",
    image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/22380/header.jpg",
    claimUrl: "https://gaming.amazon.com/home",
    expiresAt: "2026-12-28T23:59:59Z"
  },
  {
    id: "f3",
    title: "Counter-Strike 2 & Destaques F2P",
    provider: "Steam Oficial",
    image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/730/header.jpg",
    claimUrl: "https://store.steampowered.com/app/730/CounterStrike_2/",
    expiresAt: "2026-12-31T23:59:59Z"
  }
];

export const mockNotifications: Notification[] = [
  {
    id: "n1",
    title: "Alerta de Preço Atingido!",
    message: "Cyberpunk 2077 atingiu o menor preço histórico de R$ 99,95 na GOG (50% OFF).",
    time: "Há 2 horas",
    read: false,
    type: "alert"
  },
  {
    id: "n2",
    title: "Jogo Grátis Disponível",
    message: "Resgate Marvel's Midnight Suns gratuitamente na Epic Games Store esta semana.",
    time: "Há 5 horas",
    read: false,
    type: "promo"
  },
  {
    id: "n3",
    title: "Queda de Preço Detectada",
    message: "Red Dead Redemption 2 caiu para R$ 89,90 na Nuuvem (Chave Oficial Rockstar/Steam).",
    time: "Ontem",
    read: true,
    type: "alert"
  }
];

export const mockAlerts: WishlistAlert[] = [
  {
    id: "a1",
    gameId: "1091500",
    gameName: "Cyberpunk 2077",
    targetPrice: 100.00,
    currentPrice: 99.95,
    store: "GOG",
    image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg",
    active: true
  },
  {
    id: "a2",
    gameId: "1245620",
    gameName: "Elden Ring",
    targetPrice: 150.00,
    currentPrice: 159.90,
    store: "Nuuvem",
    image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg",
    active: true
  }
];
