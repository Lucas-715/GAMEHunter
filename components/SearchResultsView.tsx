'use client';
import React, { useState } from 'react';
import { GameItem } from '../lib/types';
import { Search, SlidersHorizontal, ShoppingCart, Zap, Check } from 'lucide-react';

interface SearchResultsViewProps {
  query: string;
  games: GameItem[];
  onSelectGame: (gameId: string) => void;
}

export const SearchResultsView: React.FC<SearchResultsViewProps> = ({ query, games, onSelectGame }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<number>(300);
  const allPlatforms = ['Steam', 'GOG', 'Nuuvem', 'Green Man Gaming'];
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(allPlatforms);
  const [storeType, setStoreType] = useState<'all' | 'official' | 'keys'>('all');

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const filteredGames = games.map(g => {
    // Filter the game's stores based on criteria
    const validStores = g.stores.filter(store => {
      const matchesPlatform = selectedPlatforms.some(p => store.name.toLowerCase().includes(p.toLowerCase()));
      const matchesStoreType = 
        storeType === 'all' ? true : 
        storeType === 'official' ? store.isOfficial === true : 
        store.isOfficial === false;
      const matchesPrice = store.price <= priceRange;
      
      return matchesPlatform && matchesStoreType && matchesPrice;
    }).sort((a, b) => a.price - b.price);

    return { ...g, stores: validStores, originalStoreCount: g.stores.length };
  }).filter(g => {
    // 1. Query matching
    const matchesQuery = g.name.toLowerCase().includes(query.toLowerCase());
    if (!matchesQuery) return false;

    // If the game has no stores yet (newly discovered), always show it
    if ((g as any).originalStoreCount === 0) return true;

    // If it originally had stores, but they were filtered out, hide the game
    return g.stores.length > 0;
  });

  const getOpportunityScore = (game: GameItem) => {
    return game.opportunityScore || 0;
  };

  return (
    <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-500 pb-12">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Resultados para "{query}"</h1>
          <p className="text-muted-foreground">{filteredGames.length} {filteredGames.length === 1 ? 'jogo encontrado' : 'jogos encontrados'}</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <select className="bg-secondary border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-primary flex-1 md:flex-none">
            <option>Relevância</option>
            <option>Menor Preço</option>
            <option>Maior Desconto</option>
          </select>
          <button 
            className={`btn-outline md:hidden flex items-center gap-2 ${showFilters ? 'bg-primary/10 text-primary border-primary/50' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal size={18} /> Filtros
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Filters Sidebar */}
        <aside className={`w-full md:w-64 space-y-8 ${showFilters ? 'block' : 'hidden md:block'}`}>
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Preço Máximo</h3>
            <div className="space-y-4">
              <input 
                type="range" 
                min="0" 
                max="300" 
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-primary bg-secondary h-2 rounded-lg appearance-none cursor-pointer" 
              />
              <div className="flex justify-between text-sm font-medium">
                <span>Grátis</span>
                <span className="text-primary">R$ {priceRange},00</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Plataforma</h3>
            <div className="space-y-3">
              {allPlatforms.map((platform) => {
                const isSelected = selectedPlatforms.includes(platform);
                return (
                  <label key={platform} className="flex items-center gap-3 cursor-pointer group" onClick={(e) => { e.preventDefault(); togglePlatform(platform); }}>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-primary border-primary' : 'border-input bg-background group-hover:border-primary/50'}`}>
                      {isSelected && <Check size={14} className="text-primary-foreground" />}
                    </div>
                    <span className="text-sm">{platform}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Tipo de Loja</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer group" onClick={(e) => { e.preventDefault(); setStoreType(storeType === 'official' ? 'all' : 'official'); }}>
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${storeType === 'official' ? 'bg-primary border-primary' : 'border-input bg-background group-hover:border-primary/50'}`}>
                  {storeType === 'official' && <Check size={14} className="text-primary-foreground" />}
                </div>
                <span className="text-sm">Lojas Oficiais</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group" onClick={(e) => { e.preventDefault(); setStoreType(storeType === 'keys' ? 'all' : 'keys'); }}>
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${storeType === 'keys' ? 'bg-primary border-primary' : 'border-input bg-background group-hover:border-primary/50'}`}>
                  {storeType === 'keys' && <Check size={14} className="text-primary-foreground" />}
                </div>
                <span className="text-sm">Revendedores (Keys)</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Results List */}
        <div className="flex-1 space-y-4">
          {filteredGames.length === 0 ? (
            <div className="glass-panel rounded-xl p-12 text-center flex flex-col items-center">
              <Search size={48} className="text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-bold mb-2">Nenhum jogo encontrado</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Não conseguimos encontrar resultados para sua busca. Tente termos diferentes ou remova alguns filtros.
              </p>
            </div>
          ) : (
            filteredGames.map((game, idx) => {
              const score = getOpportunityScore(game);
              
              return (
                <div 
                  key={game.id} 
                  className="glass-panel rounded-xl p-4 flex flex-col sm:flex-row gap-6 hover-card cursor-pointer group"
                  onClick={() => onSelectGame(game.id)}
                >
                  <div className="w-full sm:w-48 h-32 sm:h-auto rounded-lg overflow-hidden flex-shrink-0 relative">
                    <img 
                      src={game.coverImageUrl} 
                      alt={game.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">{game.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {game.tags?.slice(0, 3).join(' • ')}
                      </p>
                    </div>
                    
                    <div className="flex items-end justify-between">
                      <div className="flex flex-col">
                        {game.isFree ? (
                          <div className="flex items-center gap-2 mt-4">
                            <span className="text-2xl font-bold text-success">Grátis para jogar</span>
                          </div>
                        ) : (
                          <>
                            {game.stores && game.stores.length > 0 && game.stores[0].price !== undefined ? (
                              <>
                                <span className="text-xs text-muted-foreground line-through">
                                  R$ {game.stores[0].price.toFixed(2).replace('.', ',')}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-2xl font-bold">
                                    R$ {game.allTimeLow?.price?.toFixed(2).replace('.', ',')}
                                  </span>
                                  {game.stores[0].price > 0 && game.allTimeLow?.price < game.stores[0].price && (
                                    <span className="px-1.5 py-0.5 bg-success/20 text-success text-xs font-bold rounded">
                                      -{Math.round((1 - game.allTimeLow.price / game.stores[0].price) * 100)}%
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs text-muted-foreground mt-1">na {game.stores[0].name}</span>
                              </>
                            ) : (
                              <div className="flex items-center gap-2 mt-4">
                                <span className="text-lg font-bold text-muted-foreground">Preço Indisponível</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-end gap-3">
                        {game.isFree ? (
                           <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded border text-success bg-success/10 border-success/20`}>
                             <Zap size={14} /> FREE TO PLAY
                           </div>
                        ) : (
                          (() => {
                            const isGreen = score >= 80;
                            const isAmber = score >= 50 && score < 80;
                            const badgeClass = isGreen 
                              ? 'text-success bg-success/10 border-success/20' 
                              : isAmber 
                                ? 'text-warning bg-warning/10 border-warning/20' 
                                : 'text-danger bg-danger/10 border-danger/20';
                            return (
                              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded border ${badgeClass}`}>
                                <Zap size={14} /> {score} SCORE
                              </div>
                            );
                          })()
                        )}
                        <button 
                          className={`btn-sm px-4 py-2 flex items-center gap-2 ${idx % 2 === 0 ? 'btn-primary' : 'btn-secondary group-hover:bg-primary/20 group-hover:text-primary'}`}
                          onClick={(e) => { e.stopPropagation(); onSelectGame(game.id); }}
                        >
                          <ShoppingCart size={16} /> {game.isFree ? 'Ver Página' : 'Ver Opções'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
