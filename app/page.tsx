'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { DashboardView } from '@/components/DashboardView';
import { SearchResultsView } from '@/components/SearchResultsView';
import { GameDetailView } from '@/components/GameDetailView';
import { WishlistAlertsView } from '@/components/WishlistAlertsView';
import { Footer } from '@/components/Footer';
import { PiggyBank } from 'lucide-react';

// Modals
import { ProfileModal } from '@/components/ProfileModal';
import { NotificationModal } from '@/components/NotificationModal';
import { NewAlertModal } from '@/components/NewAlertModal';
import { SavingsModal } from '@/components/SavingsModal';
import { SteamImportModal } from '@/components/SteamImportModal';
import { CartModal, CartItem } from '@/components/CartModal';

// Mock Data
import { mockFreeGames, mockNotifications } from '@/lib/gamesData';
import { GameItem, WishlistAlert } from '@/lib/types';

export default function Home() {
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'search', 'game-detail', 'wishlist'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState<GameItem | null>(null);

  // API State
  const [dashboardGames, setDashboardGames] = useState<GameItem[]>([]);
  const [searchResults, setSearchResults] = useState<GameItem[]>([]);
  const [userAlerts, setUserAlerts] = useState<WishlistAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Cart & Store State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartInitialTab, setCartInitialTab] = useState<'cart' | 'checkout' | 'library'>('cart');

  // Modals state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isNewAlertOpen, setIsNewAlertOpen] = useState(false);
  const [isSavingsOpen, setIsSavingsOpen] = useState(false);
  const [isSteamImportOpen, setIsSteamImportOpen] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState(mockNotifications);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Carrega carrinho salvo do localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('gamehunter_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch {
        setCart([]);
      }
    }
  }, []);

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('gamehunter_cart', JSON.stringify(newCart));
  };

  const handleAddToCart = (game: GameItem, storeName?: string, customPrice?: number) => {
    const bestStore = game.stores?.[0];
    const finalPrice = customPrice ?? bestStore?.price ?? game.allTimeLow?.price ?? 99.90;
    const finalStore = storeName ?? bestStore?.name ?? 'Steam';

    const newItem: CartItem = {
      gameId: game.id,
      name: game.name,
      price: finalPrice,
      storeName: finalStore,
      coverImageUrl: game.coverImageUrl,
      platform: finalStore.toLowerCase().includes('gog') ? 'GOG DRM-Free Key' : 'Chave Steam Oficial',
    };

    const exists = cart.some(i => i.gameId === game.id);
    if (!exists) {
      saveCart([...cart, newItem]);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('gamehunter:xp', {
            detail: { amount: 150, reason: `Key adicionada: ${game.name}`, achievementId: 'fast_trigger' },
          })
        );
      }
    }
    setCartInitialTab('cart');
    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (gameId: string) => {
    saveCart(cart.filter(i => i.gameId !== gameId));
  };

  const handleClearCart = () => {
    saveCart([]);
  };

  // Fetch Dashboard Data
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/games/dashboard');
        const data = await res.json();
        
        if (data.error) {
          setErrorMsg(data.error);
        }

        let combined: any[] = [];
        if (data.featured) combined = [...combined, ...data.featured];
        if (data.opportunities) combined = [...combined, ...data.opportunities];
        if (data.games) combined = [...combined, ...data.games];
        
        const uniqueGames = Array.from(new Map(combined.map(item => [item.id, item])).values()) as GameItem[];
        setDashboardGames(uniqueGames);
      } catch (err) {
        console.error("Failed to load dashboard", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // Fetch Alerts Data
  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch('/api/alerts');
      let apiAlerts: WishlistAlert[] = [];
      if (res.ok) {
        const data = await res.json();
        apiAlerts = (data.alerts || []).map((alert: any) => {
          const latestPrice = alert.game?.priceHistory?.[0]?.price || 0;
          const storeName = alert.game?.priceHistory?.[0]?.store?.name || 'Várias Lojas';
          
          return {
            id: alert.id,
            gameId: alert.gameId,
            gameName: alert.game?.name || 'Desconhecido',
            targetPrice: alert.conditionValue,
            currentPrice: latestPrice,
            store: storeName,
            image: alert.game?.coverImageUrl || '',
            active: alert.status === 'ACTIVE'
          };
        });
      }

      const local = JSON.parse(localStorage.getItem('gamehunter_local_alerts') || '[]');
      const combined = [...apiAlerts, ...local];
      const unique = Array.from(new Map(combined.map(item => [item.id, item])).values()) as WishlistAlert[];
      setUserAlerts(unique);
    } catch (err) {
      const local = JSON.parse(localStorage.getItem('gamehunter_local_alerts') || '[]');
      setUserAlerts(local);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch search results
  useEffect(() => {
    const fetchSearch = async () => {
      if (debouncedQuery.trim().length > 0) {
        try {
          const res = await fetch(`/api/games/search?q=${encodeURIComponent(debouncedQuery)}&t=${Date.now()}`);
          const data = await res.json();
          setSearchResults(data.games || []);
        } catch (err) {
          console.error("Search failed", err);
        }
      }
    };
    fetchSearch();
  }, [debouncedQuery]);

  // Handlers
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim().length > 0) {
      setCurrentView('search');
    } else {
      setCurrentView('dashboard');
    }
  };

  const handleSelectGame = (gameId: string) => {
    const localMatch = dashboardGames.find(g => g.id === gameId) || searchResults.find(g => g.id === gameId);
    
    // Abre imediatamente com os dados locais se já tivermos para resposta instantânea, e atualiza em seguida
    if (localMatch) {
      setSelectedGame(localMatch);
      setCurrentView('game-detail');
    }

    fetch(`/api/games/${encodeURIComponent(gameId)}`)
      .then(res => res.json())
      .then(data => {
        if (data.game) {
          setSelectedGame(data.game);
          setCurrentView('game-detail');
        }
      })
      .catch(err => {
        console.warn("Using local game details fallback", err);
      });
  };

  const handleAlertCreated = (newAlert: any) => {
    setUserAlerts(prev => [newAlert, ...prev]);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('gamehunter:xp', {
          detail: { amount: 200, reason: 'Novo Alerta Ativado', achievementId: 'night_watcher' },
        })
      );
    }
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-transparent text-foreground flex flex-col font-sans selection:bg-primary/30">
      
      <Navbar 
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          if (view !== 'search') setSearchQuery('');
        }}
        onSearch={handleSearch}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        unreadNotifications={unreadNotificationsCount}
        cartCount={cart.length}
        onOpenCart={() => {
          setCartInitialTab('cart');
          setIsCartOpen(true);
        }}
        onOpenLibrary={() => {
          setCartInitialTab('library');
          setIsCartOpen(true);
        }}
      />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        {currentView === 'dashboard' && (
          <DashboardView 
            games={dashboardGames}
            freeGames={mockFreeGames}
            onSelectGame={handleSelectGame}
            onClaimFreeGame={(id) => {
              const game = mockFreeGames.find(g => g.id === id);
              if (typeof window !== 'undefined') {
                window.dispatchEvent(
                  new CustomEvent('gamehunter:xp', {
                    detail: { amount: 250, reason: `Resgate Grátis: ${game?.title || 'Jogo'}`, achievementId: 'free_collector' },
                  })
                );
              }
              if (game && game.claimUrl && game.claimUrl !== '#') {
                window.open(game.claimUrl, '_blank');
              } else {
                window.open('https://store.epicgames.com/pt-BR/free-games', '_blank');
              }
            }}
            onQuickBuy={(game) => handleAddToCart(game)}
            isLoading={isLoading}
            errorMsg={errorMsg}
          />
        )}

        {currentView === 'search' && (
          <SearchResultsView 
            query={searchQuery}
            games={searchResults}
            onSelectGame={handleSelectGame}
            onAddToCart={(game) => handleAddToCart(game)}
          />
        )}

        {currentView === 'game-detail' && selectedGame && (
          <GameDetailView 
            game={selectedGame}
            onBack={() => setCurrentView(searchQuery ? 'search' : 'dashboard')}
            onAddToCart={handleAddToCart}
          />
        )}

        {currentView === 'wishlist' && (
          <WishlistAlertsView 
            alerts={userAlerts}
            onNewAlert={() => setIsNewAlertOpen(true)}
            onImportSteam={() => setIsSteamImportOpen(true)}
            onRefreshAlerts={fetchAlerts}
          />
        )}
      </main>

      <Footer />

      {/* Botão Flutuante de Economia */}
      <button 
        onClick={() => setIsSavingsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-card border border-primary/40 text-foreground px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 hover:border-primary hover:bg-primary/10 transition-all group backdrop-blur-md"
        title="Ver métricas de economia acumulada"
      >
        <div className="p-1.5 bg-primary/20 text-primary rounded-full group-hover:scale-110 transition-transform">
          <PiggyBank size={16} />
        </div>
        <span className="text-xs font-bold font-mono">Economia</span>
      </button>

      {/* Modais */}
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <NotificationModal 
        isOpen={isNotificationsOpen} 
        onClose={() => setIsNotificationsOpen(false)} 
        notifications={notifications} 
        onMarkAllAsRead={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
        onClearAll={() => setNotifications([])}
        onDelete={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
      />
      <NewAlertModal 
        isOpen={isNewAlertOpen} 
        onClose={() => setIsNewAlertOpen(false)} 
        onAlertCreated={handleAlertCreated}
      />
      <SavingsModal 
        isOpen={isSavingsOpen} 
        onClose={() => setIsSavingsOpen(false)} 
        gamesTracked={userAlerts.length || 8}
      />
      <SteamImportModal 
        isOpen={isSteamImportOpen} 
        onClose={() => setIsSteamImportOpen(false)} 
        onImportSuccess={() => fetchAlerts()}
      />
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onRemoveFromCart={handleRemoveFromCart}
        onClearCart={handleClearCart}
        initialTab={cartInitialTab}
      />
    </div>
  );
}
