import { GameItem, FreeGame, Notification, WishlistAlert } from './types';

export const mockGames: GameItem[] = [
  {
    id: "g1",
    name: "Elden Ring",
    coverImageUrl: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg",
    bannerImage: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg",
    priceHistory: [
      { date: "2023-11-01", price: 229.90, score: 65 },
      { date: "2023-12-01", price: 199.90, score: 75 },
      { date: "2024-01-01", price: 159.90, score: 85 }
    ],
    allTimeLow: { price: 159.90, date: "2024-01-01" },
    stores: [
      { id: "s1", name: "Steam", price: 229.90, url: "#", isOfficial: true },
      { id: "s2", name: "Nuuvem", price: 199.90, url: "#", isOfficial: true },
      { id: "s3", name: "Instant Gaming", price: 159.90, url: "#", isOfficial: false }
    ],
    tags: ["RPG", "Souls-like", "Open World"]
  },
  {
    id: "g2",
    name: "Cyberpunk 2077",
    coverImageUrl: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg",
    bannerImage: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg",
    priceHistory: [
      { date: "2023-10-01", price: 199.90, score: 60 },
      { date: "2023-11-20", price: 99.90, score: 92 },
      { date: "2024-01-15", price: 119.90, score: 80 }
    ],
    allTimeLow: { price: 99.90, date: "2023-11-20" },
    stores: [
      { id: "s1", name: "Steam", price: 119.90, url: "#", isOfficial: true },
      { id: "s4", name: "GOG", price: 119.90, url: "#", isOfficial: true }
    ],
    tags: ["Cyberpunk", "RPG", "Sci-fi"]
  },
  {
    id: "g3",
    name: "Baldur's Gate 3",
    coverImageUrl: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1086940/header.jpg",
    priceHistory: [
      { date: "2023-12-01", price: 199.90, score: 65 },
      { date: "2024-01-05", price: 179.90, score: 72 }
    ],
    allTimeLow: { price: 179.90, date: "2024-01-05" },
    stores: [
      { id: "s1", name: "Steam", price: 179.90, url: "#", isOfficial: true },
      { id: "s4", name: "GOG", price: 179.90, url: "#", isOfficial: true }
    ],
    tags: ["CRPG", "D&D", "Story Rich"]
  },
  {
    id: "g4",
    name: "Red Dead Redemption 2",
    coverImageUrl: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1174180/header.jpg",
    priceHistory: [
      { date: "2023-11-01", price: 299.90, score: 40 },
      { date: "2023-12-20", price: 98.96, score: 95 }
    ],
    allTimeLow: { price: 98.96, date: "2023-12-20" },
    stores: [
      { id: "s1", name: "Steam", price: 98.96, url: "#", isOfficial: true },
      { id: "s5", name: "Epic Games", price: 98.96, url: "#", isOfficial: true }
    ],
    tags: ["Open World", "Western", "Masterpiece"]
  }
];

export const mockFreeGames: FreeGame[] = [
  {
    id: "f1",
    title: "Marvel's Midnight Suns",
    provider: "Epic Games",
    image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/368260/header.jpg",
    claimUrl: "#",
    expiresAt: "2024-02-15T15:00:00Z"
  },
  {
    id: "f2",
    title: "Fallout",
    provider: "Prime Gaming",
    image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/38400/header.jpg",
    claimUrl: "#",
    expiresAt: "2024-02-28T23:59:59Z"
  }
];

export const mockNotifications: Notification[] = [
  {
    id: "n1",
    title: "Alerta de Preço Atingido!",
    message: "Cyberpunk 2077 chegou ao seu preço alvo de R$ 99,90 na GOG.",
    time: "2 horas atrás",
    read: false,
    type: "alert"
  },
  {
    id: "n2",
    title: "Jogo Grátis Disponível",
    message: "Marvel's Midnight Suns está de graça na Epic Games Store.",
    time: "5 horas atrás",
    read: false,
    type: "promo"
  },
  {
    id: "n3",
    title: "Atualização do Sistema",
    message: "Nova funcionalidade de importação da Steam adicionada.",
    time: "2 dias atrás",
    read: true,
    type: "system"
  }
];

export const mockAlerts: WishlistAlert[] = [
  {
    id: "a1",
    gameId: "g2",
    gameName: "Cyberpunk 2077",
    targetPrice: 100.00,
    currentPrice: 119.90,
    store: "Qualquer",
    image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg",
    active: true
  },
  {
    id: "a2",
    gameId: "g3",
    gameName: "Baldur's Gate 3",
    targetPrice: 150.00,
    currentPrice: 179.90,
    store: "Steam",
    image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1086940/header.jpg",
    active: true
  }
];
