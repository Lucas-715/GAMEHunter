export interface PriceHistory {
  date: string;
  price: number;
  score: number;
}

export interface Store {
  id: string;
  name: string;
  price: number;
  url: string;
  isOfficial: boolean;
}

export interface GameItem {
  id: string;
  steamAppId?: string;
  name: string;
  coverImageUrl: string;
  bannerImage?: string;
  isFree?: boolean;
  priceHistory: PriceHistory[];
  allTimeLow: {
    price: number;
    date: string;
  };
  stores: Store[];
  tags: string[];
  opportunityScore?: number;
}

export interface FreeGame {
  id: string;
  title: string;
  provider: string;
  image: string;
  claimUrl: string;
  expiresAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'alert' | 'system' | 'promo';
}

export interface WishlistAlert {
  id: string;
  gameId: string;
  gameName: string;
  targetPrice: number;
  currentPrice: number;
  store: string;
  image: string;
  active: boolean;
}
