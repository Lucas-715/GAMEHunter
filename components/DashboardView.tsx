'use client';
import React, { useState } from 'react';
import { GameItem, FreeGame } from '../lib/types';
import { ChevronLeft, ChevronRight, Gift, TrendingDown, Star, ExternalLink, Zap } from 'lucide-react';
import { GamificationWidget } from './GamificationWidget';

interface DashboardViewProps {
  games: GameItem[];
  freeGames: FreeGame[];
  onSelectGame: (gameId: string) => void;
  onClaimFreeGame: (gameId: string) => void;
  onQuickBuy: (game: GameItem, storeUrl?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  games,
  freeGames,
  onSelectGame,
  onClaimFreeGame,
  onQuickBuy,
  isLoading,
  errorMsg,
}) => {
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [sortCriteria, setSortCriteria] = useState<'score' | 'price' | 'discount'>('score');

  // Featured games for the top carousel (must have stores, fallback to coverImageUrl if bannerImage missing)
  const featuredGames = games.filter((g) => (g.bannerImage || g.coverImageUrl) && g.stores.length > 0);
  const activeHero = featuredGames[currentHeroIndex] || games[0];

  const handleNextHero = () => {
    setCurrentHeroIndex((prev) => (prev + 1) % featuredGames.length);
  };

  const handlePrevHero = () => {
    setCurrentHeroIndex((prev) => (prev - 1 + featuredGames.length) % featuredGames.length);
  };

  React.useEffect(() => {
    if (featuredGames.length <= 1) return;
    const interval = setInterval(handleNextHero, 5000);
    return () => clearInterval(interval);
  }, [featuredGames.length]);

  const getOpportunityScore = (game: GameItem) => {
    return game.opportunityScore || 0;
  };

  const sortedGames = [...games].sort((a, b) => {
    if (sortCriteria === 'score') {
      return getOpportunityScore(b) - getOpportunityScore(a);
    }
    if (sortCriteria === 'price') {
      return (a.stores[0]?.price || 0) - (b.stores[0]?.price || 0);
    }
    return 0; // Simplified discount sort
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-8 h-8 animate-spin rounded-full border-b-2 border-primary" />
        <p className="text-muted-foreground animate-pulse">Carregando as melhores ofertas...</p>
      </div>
    )
  }

  if (errorMsg) {
    return <div className="p-8 text-center text-red-500 font-bold whitespace-pre-wrap">Erro na API: {errorMsg}</div>
  }

  if (!activeHero) return <div className="p-8 text-center text-muted-foreground">Nenhum jogo encontrado.</div>;

  return (
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in duration-500">
      {/* Hero Section */}
      <div className="relative w-full h-[50vh] min-h-[400px] max-h-[600px] rounded-2xl overflow-hidden group">
        <img
          src={activeHero.bannerImage || activeHero.coverImageUrl}
          alt={activeHero.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
          <div className="flex justify-between items-end gap-6 relative z-10">
            <div className="max-w-2xl">
              <span className="inline-block px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-xs font-semibold tracking-wider mb-4 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                OFERTA EM DESTAQUE
              </span>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 drop-shadow-lg">
                {activeHero.name}
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-1">
                  <Star size={16} className="text-warning fill-warning" />
                  <Star size={16} className="text-warning fill-warning" />
                  <Star size={16} className="text-warning fill-warning" />
                  <Star size={16} className="text-warning fill-warning" />
                  <Star size={16} className="text-warning fill-warning" />
                  <span className="ml-1 text-foreground">Obra-prima</span>
                </div>
                <span>•</span>
                <span>{activeHero.tags?.slice(0, 3).join(', ')}</span>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground line-through decoration-danger">
                    R$ {activeHero.stores[0]?.price.toFixed(2).replace('.', ',')}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-success">
                      R$ {activeHero.allTimeLow.price.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-sm font-medium px-2 py-0.5 bg-success/20 text-success rounded">
                      -{Math.round((1 - activeHero.allTimeLow.price / activeHero.stores[0]?.price) * 100)}%
                    </span>
                  </div>
                </div>
                
                <button 
                  onClick={() => onSelectGame(activeHero.id)}
                  className="btn-primary py-3 px-6 shadow-lg shadow-primary/20 hover:shadow-primary/40 text-lg flex items-center gap-2 transition-all hover:translate-x-1"
                >
                  <ExternalLink size={20} />
                  Ver Ofertas
                </button>
              </div>
            </div>

            {/* Opportunity Score Badge */}
            {(() => {
              const score = getOpportunityScore(activeHero);
              const isGreen = score >= 80;
              const isAmber = score >= 50 && score < 80;
              const colorPrefix = isGreen ? 'success' : isAmber ? 'warning' : 'danger';
              const textGradient = isGreen ? 'from-success to-emerald-700' : isAmber ? 'from-warning to-amber-700' : 'from-danger to-red-700';
              
              return (
                <div className="hidden md:flex flex-col items-center justify-center p-6 rounded-2xl glass-panel relative overflow-hidden group/score">
                  <div className={`absolute inset-0 bg-${colorPrefix}/10 group-hover/score:bg-${colorPrefix}/20 transition-colors`} />
                  <div className="relative z-10 flex flex-col items-center">
                    <Zap size={24} className={`text-${colorPrefix} mb-2 ${isGreen ? 'animate-pulse' : ''}`} />
                    <span className={`text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b ${textGradient}`}>
                      {score}
                    </span>
                    <span className="text-xs font-semibold tracking-widest text-muted-foreground mt-1">SCORE</span>
                    {score === 100 && (
                      <span className="text-[10px] uppercase mt-2 text-success border border-success/30 px-2 py-0.5 rounded-full">
                        Historical Low
                      </span>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Carousel Controls */}
        <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 flex justify-between pointer-events-none">
          <button 
            onClick={handlePrevHero}
            className="w-10 h-10 rounded-full glass-panel flex items-center justify-center pointer-events-auto hover:bg-white/10 transition-colors text-white"
            aria-label="Anterior"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={handleNextHero}
            className="w-10 h-10 rounded-full glass-panel flex items-center justify-center pointer-events-auto hover:bg-white/10 transition-colors text-white"
            aria-label="Próximo"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Carousel Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {featuredGames.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentHeroIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentHeroIndex ? 'w-8 bg-primary' : 'w-2 bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`Ir para slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Gamification & Free Games */}
        <div className="lg:col-span-1 space-y-8">
          
          <GamificationWidget />
          
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Gift size={20} className="text-primary" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">Jogos Grátis</h2>
          </div>
          
          <div className="flex flex-col gap-3">
            {freeGames.map(game => (
              <div key={game.id} className="glass-panel rounded-xl p-3 flex gap-4 hover-card group">
                <img 
                  src={game.image} 
                  alt={game.title} 
                  className="w-20 h-20 object-cover rounded-md group-hover:scale-105 transition-transform"
                />
                <div className="flex flex-col justify-between flex-1 py-1">
                  <div>
                    <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">{game.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{game.provider}</p>
                  </div>
                  <button 
                    onClick={() => onClaimFreeGame(game.id)}
                    className="text-xs font-medium text-primary hover:text-primary/80 self-start"
                  >
                    Resgatar agora →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>

        {/* Right Column: Opportunities Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-success/10 rounded-lg">
                <TrendingDown size={20} className="text-success" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">Melhores Oportunidades</h2>
            </div>
            <select 
              className="bg-secondary border border-border rounded-md px-3 py-1.5 text-sm outline-none focus:border-primary transition-colors"
              value={sortCriteria}
              onChange={(e) => setSortCriteria(e.target.value as any)}
            >
              <option value="score">Score (Alta)</option>
              <option value="price">Menor Preço</option>
            </select>
          </div>

          <div className="glass-panel rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5">
                    <th className="px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Jogo</th>
                    <th className="px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider text-center">Score ↓</th>
                    <th className="px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">Melhor Preço</th>
                    <th className="px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sortedGames.map((game, idx) => {
                    const score = getOpportunityScore(game);
                    const bestStore = game.stores[0];
                    const isGreen = score >= 80;
                    const isAmber = score >= 50 && score < 80;
                    const badgeClass = isGreen 
                      ? 'text-success bg-success/10 border-success/20' 
                      : isAmber 
                        ? 'text-warning bg-warning/10 border-warning/20' 
                        : 'text-danger bg-danger/10 border-danger/20';
                    
                    return (
                      <tr key={game.id} className="hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => onSelectGame(game.id)}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <img src={game.coverImageUrl} alt={game.name} className="w-12 h-12 rounded object-cover shadow-sm group-hover:shadow-md transition-shadow" />
                            <div className="font-medium group-hover:text-primary transition-colors">{game.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold border ${badgeClass}`}>
                            {score}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className="text-xs text-muted-foreground line-through">R$ {game.stores[0]?.price.toFixed(2).replace('.', ',')}</span>
                            <span className="font-bold text-lg">R$ {game.allTimeLow.price.toFixed(2).replace('.', ',')}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <span className="text-xs text-muted-foreground hidden sm:inline-block">{bestStore?.name}</span>
                            <button 
                              onClick={(e) => { e.stopPropagation(); onSelectGame(game.id); }}
                              className={`btn-sm px-4 py-2 text-sm ${idx === 0 ? 'btn-primary shadow-lg shadow-primary/20' : 'btn-secondary hover:bg-white/10'}`}
                            >
                              Ver Opções
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
