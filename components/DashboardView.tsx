'use client';
import React, { useState } from 'react';
import { GameItem, FreeGame } from '../lib/types';
import { ChevronLeft, ChevronRight, Gift, TrendingDown, Star, ExternalLink, Zap, ShoppingCart } from 'lucide-react';
import { GamificationWidget } from './GamificationWidget';

interface DashboardViewProps {
  games: GameItem[];
  freeGames: FreeGame[];
  onSelectGame: (gameId: string) => void;
  onClaimFreeGame: (gameId: string) => void;
  onQuickBuy: (game: GameItem, storeUrl?: string) => void;
  isLoading?: boolean;
  errorMsg?: string | null;
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
  const [sortCriteria, setSortCriteria] = useState<'score' | 'price'>('score');

  // Jogos em destaque com lojas válidas
  const featuredGames = games.filter((g) => (g.bannerImage || g.coverImageUrl) && (g.stores || []).length > 0);
  const activeHero = featuredGames[currentHeroIndex] || games[0];

  const handleNextHero = () => {
    if (featuredGames.length > 0) {
      setCurrentHeroIndex((prev) => (prev + 1) % featuredGames.length);
    }
  };

  const handlePrevHero = () => {
    if (featuredGames.length > 0) {
      setCurrentHeroIndex((prev) => (prev - 1 + featuredGames.length) % featuredGames.length);
    }
  };

  React.useEffect(() => {
    if (featuredGames.length <= 1) return;
    const interval = setInterval(handleNextHero, 6000);
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
      return (a.stores?.[0]?.price || 0) - (b.stores?.[0]?.price || 0);
    }
    return 0;
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-muted-foreground text-sm font-medium animate-pulse">
          Rastreando menores preços em lojas oficiais...
        </p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="p-8 text-center text-danger font-bold bg-danger/10 border border-danger/20 rounded-2xl">
        Erro ao comunicar com a base: {errorMsg}
      </div>
    );
  }

  if (!activeHero) {
    return (
      <div className="p-12 text-center text-muted-foreground glass-panel rounded-2xl border border-border">
        Nenhum jogo cadastrado no momento. Tente pesquisar por um título acima.
      </div>
    );
  }

  const heroPrice = activeHero.stores?.[0]?.price || 120;
  const heroHistoric = activeHero.allTimeLow?.price || heroPrice;
  const heroDiscount = heroPrice > heroHistoric ? Math.round((1 - heroHistoric / heroPrice) * 100) : 0;

  return (
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in duration-500">
      
      {/* Hero Section */}
      <div className="relative w-full h-[52vh] min-h-[420px] max-h-[600px] rounded-3xl overflow-hidden group border border-border shadow-2xl">
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
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-xs font-black tracking-wider mb-4 shadow-[0_0_15px_rgba(34,197,94,0.3)] uppercase">
                <Zap size={14} /> Oferta em Destaque
              </span>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-3 text-foreground drop-shadow-md">
                {activeHero.name}
              </h1>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-6">
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-yellow-500 fill-yellow-500" />
                  <span className="font-bold text-foreground">Recomendado</span>
                </div>
                <span>•</span>
                <span>{activeHero.tags?.slice(0, 3).join(', ') || 'Ação'}</span>
                <span>•</span>
                <span>Disponível na {activeHero.stores?.[0]?.name || 'Steam'}</span>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="flex flex-col">
                  {heroDiscount > 0 && (
                    <span className="text-xs text-muted-foreground line-through decoration-danger font-mono">
                      R$ {heroPrice.toFixed(2).replace('.', ',')}
                    </span>
                  )}
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-success font-mono">
                      R$ {heroHistoric.toFixed(2).replace('.', ',')}
                    </span>
                    {heroDiscount > 0 && (
                      <span className="text-xs font-bold px-2 py-0.5 bg-success/20 text-success rounded-md">
                        -{heroDiscount}%
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <button 
                    onClick={() => onQuickBuy(activeHero)}
                    className="btn-primary py-3 px-6 rounded-xl shadow-lg shadow-primary/25 font-bold text-sm flex items-center gap-2 transition-all hover:scale-105"
                  >
                    <ShoppingCart size={18} />
                    Comprar Key
                  </button>
                  <button 
                    onClick={() => onSelectGame(activeHero.id)}
                    className="btn-secondary py-3 px-5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all border border-border hover:border-primary/50"
                  >
                    <ExternalLink size={17} />
                    Comparar Lojas
                  </button>
                </div>
              </div>
            </div>

            {/* Opportunity Score Badge */}
            <div className="hidden md:flex flex-col items-center justify-center p-6 rounded-2xl glass-panel relative overflow-hidden border border-border">
              <Zap size={24} className="text-primary mb-2 animate-pulse" />
              <span className="text-5xl font-black text-foreground font-mono">
                {getOpportunityScore(activeHero)}
              </span>
              <span className="text-[10px] font-bold tracking-widest text-muted-foreground mt-1">SCORE HUNTER</span>
              {getOpportunityScore(activeHero) === 100 && (
                <span className="text-[10px] font-black uppercase mt-2 text-success border border-success/30 px-2.5 py-0.5 rounded-full bg-success/10">
                  Mínimo Histórico
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Controles do Carrossel */}
        {featuredGames.length > 1 && (
          <>
            <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 flex justify-between pointer-events-none">
              <button 
                onClick={handlePrevHero}
                className="w-10 h-10 rounded-full glass-panel flex items-center justify-center pointer-events-auto hover:bg-white/10 transition-colors text-white"
                aria-label="Anterior"
              >
                <ChevronLeft size={22} />
              </button>
              <button 
                onClick={handleNextHero}
                className="w-10 h-10 rounded-full glass-panel flex items-center justify-center pointer-events-auto hover:bg-white/10 transition-colors text-white"
                aria-label="Próximo"
              >
                <ChevronRight size={22} />
              </button>
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {featuredGames.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentHeroIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentHeroIndex ? 'w-8 bg-primary' : 'w-2 bg-white/30 hover:bg-white/50'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Coluna Esquerda: Gamificação & Jogos Grátis */}
        <div className="lg:col-span-1 space-y-6">
          <GamificationWidget />
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-xl text-primary">
                <Gift size={20} />
              </div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">Jogos Grátis da Semana</h2>
            </div>
            
            <div className="flex flex-col gap-3">
              {freeGames.map(game => (
                <div key={game.id} className="glass-panel rounded-2xl p-3 flex gap-3.5 hover-card group border border-border">
                  <img 
                    src={game.image} 
                    alt={game.title} 
                    className="w-20 h-20 object-cover rounded-xl group-hover:scale-105 transition-transform border border-border"
                  />
                  <div className="flex flex-col justify-between flex-1 py-0.5 min-w-0">
                    <div>
                      <h3 className="font-bold text-xs truncate group-hover:text-primary transition-colors text-foreground">{game.title}</h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{game.provider}</p>
                    </div>
                    <button 
                      onClick={() => onClaimFreeGame(game.id)}
                      className="text-xs font-bold text-primary hover:text-primary/80 self-start flex items-center gap-1"
                    >
                      Resgatar na loja →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Coluna Direita: Melhores Oportunidades */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-success/10 rounded-xl text-success">
                <TrendingDown size={20} />
              </div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">Melhores Oportunidades</h2>
            </div>
            <select 
              className="bg-secondary/60 border border-border rounded-xl px-3 py-1.5 text-xs font-bold outline-none focus:border-primary text-foreground cursor-pointer"
              value={sortCriteria}
              onChange={(e) => setSortCriteria(e.target.value as any)}
            >
              <option value="score">Maior Score</option>
              <option value="price">Menor Preço</option>
            </select>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden border border-border">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="px-5 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Jogo</th>
                    <th className="px-5 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-center">Score</th>
                    <th className="px-5 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-right">Menor Preço</th>
                    <th className="px-5 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-right">Opções</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sortedGames.map((game) => {
                    const score = getOpportunityScore(game);
                    const bestStore = game.stores?.[0];
                    const price = bestStore?.price || 0;
                    const historic = game.allTimeLow?.price || price;

                    return (
                      <tr 
                        key={game.id} 
                        className="hover:bg-secondary/30 transition-colors group cursor-pointer" 
                        onClick={() => onSelectGame(game.id)}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3.5">
                            <img 
                              src={game.coverImageUrl || '/placeholder.jpg'} 
                              alt={game.name} 
                              className="w-11 h-11 rounded-lg object-cover border border-border" 
                            />
                            <div className="font-bold text-xs text-foreground group-hover:text-primary transition-colors max-w-[200px] truncate">
                              {game.name}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold font-mono text-xs border border-primary/30 bg-primary/10 text-primary">
                            {score}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex flex-col items-end">
                            {price > historic && (
                              <span className="text-[10px] text-muted-foreground line-through font-mono">
                                R$ {price.toFixed(2).replace('.', ',')}
                              </span>
                            )}
                            <span className="font-black font-mono text-sm text-foreground">
                              R$ {historic.toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={(e) => { e.stopPropagation(); onQuickBuy(game); }}
                              className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-black transition-all"
                              title="Adicionar Key ao Carrinho"
                            >
                              <ShoppingCart size={15} />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); onSelectGame(game.id); }}
                              className="btn-sm py-1.5 px-3 rounded-lg text-xs font-bold btn-secondary hover:btn-primary"
                            >
                              Ver Lojas
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
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
export default DashboardView;
