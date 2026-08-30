'use client';
import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { DashboardView } from '@/components/DashboardView';
import { SearchResultsView } from '@/components/SearchResultsView';
import { GameDetailView } from '@/components/GameDetailView';
import { WishlistAlertsView } from '@/components/WishlistAlertsView';
import { Footer } from '@/components/Footer';

// Modals
import { ProfileModal } from '@/components/ProfileModal';
import { NotificationModal } from '@/components/NotificationModal';
import { NewAlertModal } from '@/components/NewAlertModal';
import { SavingsModal } from '@/components/SavingsModal';
import { SteamImportModal } from '@/components/SteamImportModal';

// Mock Data (temporary for missing features)
import { mockFreeGames, mockNotifications, mockAlerts } from '@/lib/gamesData';
import { GameItem } from '@/lib/types';

export default function Home() {
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'search', 'game-detail', 'wishlist'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState<GameItem | null>(null);

  // API State
  const [dashboardGames, setDashboardGames] = useState<GameItem[]>([]);
  const [searchResults, setSearchResults] = useState<GameItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

        // As featured e opportunities vêm da API já mapeadas para GameItem
        let combined: any[] = [];
        if (data.featured) combined = [...combined, ...data.featured];
        if (data.opportunities) combined = [...combined, ...data.opportunities];
        if (data.games) combined = [...data.games]; // Caso a API retorne 'games'
        
        // Remove duplicates by ID
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

  // Modals state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isNewAlertOpen, setIsNewAlertOpen] = useState(false);
  const [isSavingsOpen, setIsSavingsOpen] = useState(false);
  const [isSteamImportOpen, setIsSteamImportOpen] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState(mockNotifications);

  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch when debounced query changes
  useEffect(() => {
    const fetchSearch = async () => {
      if (debouncedQuery.trim().length > 0) {
        try {
          const res = await fetch(`/api/games/search?q=${encodeURIComponent(debouncedQuery)}`);
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
    // Find game in dashboard, search, or mock
    const game = dashboardGames.find(g => g.id === gameId) || searchResults.find(g => g.id === gameId);
    
    // We always want to fetch fresh full details from /api/games/[id] 
    // because dashboard/search only have 1 store and no full priceHistory
    fetch(`/api/games/${gameId}`)
      .then(res => res.json())
      .then(data => {
        if (data.game) {
          setSelectedGame(data.game);
          setCurrentView('game-detail');
        } else if (game) {
          // Fallback to basic info if details fetch fails but we have it locally
          setSelectedGame(game);
          setCurrentView('game-detail');
        }
      })
      .catch(err => {
        console.error("Failed to load game details", err);
        if (game) {
          setSelectedGame(game);
          setCurrentView('game-detail');
        }
      });
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/30">
      
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
      />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        {currentView === 'dashboard' && (
          <DashboardView 
            games={dashboardGames}
            freeGames={mockFreeGames}
            onSelectGame={handleSelectGame}
            onClaimFreeGame={(id) => {
              const game = mockFreeGames.find(g => g.id === id);
              if (game && game.claimUrl) {
                window.open(game.claimUrl, '_blank');
              }
            }}
            onQuickBuy={(game) => console.log('Buy', game.name)}
            isLoading={isLoading}
            errorMsg={errorMsg}
          />
        )}

        {currentView === 'search' && (
          <SearchResultsView 
            query={searchQuery}
            games={searchResults}
            onSelectGame={handleSelectGame}
          />
        )}

        {currentView === 'game-detail' && selectedGame && (
          <GameDetailView 
            game={selectedGame}
            onBack={() => setCurrentView(searchQuery ? 'search' : 'dashboard')}
          />
        )}

        {currentView === 'wishlist' && (
          <WishlistAlertsView 
            alerts={mockAlerts}
            onNewAlert={() => setIsNewAlertOpen(true)}
            onImportSteam={() => setIsSteamImportOpen(true)}
          />
        )}
      </main>

      <Footer />

      {/* Modals */}
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <NotificationModal 
        isOpen={isNotificationsOpen} 
        onClose={() => setIsNotificationsOpen(false)} 
        notifications={notifications} 
        onMarkAllAsRead={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
        onClearAll={() => setNotifications([])}
        onDelete={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
      />
      <NewAlertModal isOpen={isNewAlertOpen} onClose={() => setIsNewAlertOpen(false)} />
      <SavingsModal isOpen={isSavingsOpen} onClose={() => setIsSavingsOpen(false)} />
      <SteamImportModal isOpen={isSteamImportOpen} onClose={() => setIsSteamImportOpen(false)} />
      
      {/* Easter Egg / Quick trigger for savings modal for demo purposes */}
      <button 
        onClick={() => setIsSavingsOpen(true)}
        className="fixed bottom-4 right-4 w-10 h-10 bg-success/20 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
        aria-label="Ver Economia"
      />
    </div>
  );
}
