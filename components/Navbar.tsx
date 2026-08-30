'use client';
import React from 'react';
import { Search, Bell, User, Gamepad2, Heart, TrendingUp, Grid } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onSearch: (query: string) => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  unreadNotifications: number;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentView, 
  onNavigate, 
  onSearch,
  onOpenNotifications,
  onOpenProfile,
  unreadNotifications
}) => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 transition-all duration-300">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        
        {/* Logo */}
        <div 
          className="flex items-center gap-2 text-primary cursor-pointer group shrink-0"
          onClick={() => onNavigate('dashboard')}
        >
          <Gamepad2 size={28} strokeWidth={2.5} className="group-hover:rotate-12 transition-transform duration-300" />
          <span className="text-xl font-black tracking-tight text-foreground hidden sm:block">
            Game<span className="text-primary">Hunter</span>
          </span>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl px-4 relative">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Buscar jogos..."
              onChange={(e) => onSearch(e.target.value)}
              className="w-full bg-secondary/50 border border-border rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50 focus:bg-background focus:ring-1 focus:ring-primary/50 transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 hidden md:flex">
              <kbd className="px-1.5 py-0.5 rounded border border-border bg-background text-[10px] text-muted-foreground font-mono">⌘</kbd>
              <kbd className="px-1.5 py-0.5 rounded border border-border bg-background text-[10px] text-muted-foreground font-mono">K</kbd>
            </div>
          </div>
        </div>

        {/* Navigation & Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          
          <button 
            onClick={() => onNavigate('dashboard')}
            className={`p-2 sm:px-3 sm:py-2 rounded-md flex items-center gap-2 transition-colors ${currentView === 'dashboard' ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-primary hover:bg-primary/10'}`}
            aria-label="Descobrir"
          >
            <Grid size={20} />
            <span className="text-sm font-medium hidden lg:block">Descobrir</span>
          </button>

          <button 
            onClick={() => onNavigate('wishlist')}
            className={`p-2 sm:px-3 sm:py-2 rounded-md flex items-center gap-2 transition-colors ${currentView === 'wishlist' ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-primary hover:bg-primary/10'}`}
            aria-label="Alertas"
          >
            <Heart size={20} />
            <span className="text-sm font-medium hidden lg:block">Alertas</span>
          </button>

          <div className="w-px h-6 bg-border mx-1 sm:mx-2 hidden sm:block"></div>

          {/* Notifications */}
          <button 
            onClick={onOpenNotifications}
            className={`p-2 rounded-full relative transition-colors ${unreadNotifications > 0 ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-primary hover:bg-primary/10'}`}
            aria-label="Notificações"
          >
            <Bell size={20} />
            {unreadNotifications > 0 && (
              <span className="absolute top-1 right-1.5 w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
            )}
          </button>

          {/* Profile */}
          <button 
            onClick={onOpenProfile}
            className="p-1 rounded-full border border-border hover:border-primary transition-colors ml-1 w-9 h-9 overflow-hidden"
            aria-label="Perfil"
          >
            <img src="/mascot.jpg" alt="Mascote" className="w-full h-full object-cover" />
          </button>
        </div>

      </div>
    </nav>
  );
};
