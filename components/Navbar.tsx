'use client';
import React, { useState, useEffect } from 'react';
import { Search, Bell, Grid, Heart, ShoppingCart, Key, User } from 'lucide-react';
import { Logo } from './Logo';
import { useSession } from 'next-auth/react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onSearch: (query: string) => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  unreadNotifications: number;
  cartCount?: number;
  onOpenCart?: () => void;
  onOpenLibrary?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentView, 
  onNavigate, 
  onSearch,
  onOpenNotifications,
  onOpenProfile,
  unreadNotifications,
  cartCount = 0,
  onOpenCart,
  onOpenLibrary
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: session } = useSession();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('global-search-input');
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    onSearch(val);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 transition-all duration-300">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-3">
        
        {/* Logo GameHunter com duas espadas e controle */}
        <div 
          className="flex items-center gap-2 cursor-pointer group shrink-0"
          onClick={() => {
            setSearchTerm('');
            onNavigate('dashboard');
          }}
          title="Ir para a página inicial"
        >
          <Logo size={36} />
          <span className="text-xl font-black tracking-tight text-foreground hidden sm:block">
            Game<span className="text-primary">Hunter</span>
          </span>
        </div>

        {/* Barra de Busca com atalho */}
        <div className="flex-1 max-w-xl px-2 relative">
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
            <input 
              id="global-search-input"
              type="text"
              placeholder="Buscar jogos na loja (ex: Elden Ring, Cyberpunk, GTA)..."
              value={searchTerm}
              onChange={handleInputChange}
              className="w-full bg-secondary/50 border border-border rounded-full pl-10 pr-16 py-2 text-sm focus:outline-none focus:border-primary/60 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all text-foreground placeholder:text-muted-foreground"
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex gap-1 hidden md:flex items-center pointer-events-none">
              <kbd className="px-1.5 py-0.5 rounded border border-border bg-background/80 text-[10px] text-muted-foreground font-mono">Ctrl</kbd>
              <kbd className="px-1.5 py-0.5 rounded border border-border bg-background/80 text-[10px] text-muted-foreground font-mono">K</kbd>
            </div>
          </div>
        </div>

        {/* Navegação e Ações */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          
          <button 
            onClick={() => {
              setSearchTerm('');
              onNavigate('dashboard');
            }}
            className={`p-2 sm:px-3 sm:py-2 rounded-lg flex items-center gap-1.5 transition-all font-medium text-xs ${currentView === 'dashboard' ? 'text-primary bg-primary/10 border border-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'}`}
            title="Descobrir Melhores Ofertas"
          >
            <Grid size={17} />
            <span className="hidden lg:block">Loja & Ofertas</span>
          </button>

          <button 
            onClick={() => onNavigate('wishlist')}
            className={`p-2 sm:px-3 sm:py-2 rounded-lg flex items-center gap-1.5 transition-all font-medium text-xs ${currentView === 'wishlist' ? 'text-primary bg-primary/10 border border-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'}`}
            title="Meus Alertas de Preço"
          >
            <Heart size={17} />
            <span className="hidden lg:block">Alertas</span>
          </button>

          {onOpenLibrary && (
            <button 
              onClick={onOpenLibrary}
              className="p-2 sm:px-3 sm:py-2 rounded-lg flex items-center gap-1.5 transition-all font-medium text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              title="Minhas Keys Compradas"
            >
              <Key size={17} />
              <span className="hidden xl:block">Minhas Keys</span>
            </button>
          )}

          <div className="w-px h-6 bg-border mx-1 hidden sm:block" />

          {/* Carrinho de Compras */}
          {onOpenCart && (
            <button 
              onClick={onOpenCart}
              className={`p-2 rounded-full relative transition-all ${cartCount > 0 ? 'text-primary bg-primary/10 border border-primary/30' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'}`}
              title="Carrinho de Compras"
            >
              <ShoppingCart size={19} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-primary text-black text-[10px] font-black rounded-full flex items-center justify-center shadow-md">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* Notificações */}
          <button 
            onClick={onOpenNotifications}
            className={`p-2 rounded-full relative transition-all ${unreadNotifications > 0 ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'}`}
            title={unreadNotifications > 0 ? `${unreadNotifications} nova(s) notificação(ões)` : 'Notificações'}
          >
            <Bell size={19} />
            {unreadNotifications > 0 && (
              <span className="absolute top-1 right-1.5 w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.9)]" />
            )}
          </button>

          {/* Perfil / Login / Visitante */}
          <button 
            onClick={onOpenProfile}
            className="px-2.5 py-1.5 rounded-full border border-border hover:border-primary/60 transition-all ml-1 flex items-center gap-1.5 bg-secondary/80 text-xs font-bold"
            title={session?.user ? `Logado como ${session.user.name || session.user.email}` : "Modo Visitante (Clique para Entrar ou Criar Conta)"}
          >
            {session?.user ? (
              <>
                <div className="w-5 h-5 rounded-full bg-primary text-black font-black text-[10px] flex items-center justify-center">
                  {session.user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="hidden md:inline text-foreground max-w-[90px] truncate">{session.user.name}</span>
              </>
            ) : (
              <>
                <User size={15} className="text-primary" />
                <span className="hidden md:inline text-foreground">Entrar</span>
              </>
            )}
          </button>
        </div>

      </div>
    </nav>
  );
};
