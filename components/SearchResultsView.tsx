'use client';
import React, { useState } from 'react';
import { GameItem } from '../lib/types';
import { Search, SlidersHorizontal, Zap, Check, ArrowUpDown, Tag, ShoppingCart } from 'lucide-react';

interface SearchResultsViewProps {
  query: string;
  games: GameItem[];
  onSelectGame: (gameId: string) => void;
  onAddToCart?: (game: GameItem) => void;
}

export const SearchResultsView: React.FC<SearchResultsViewProps> = ({ query, games, onSelectGame, onAddToCart }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<number>(350);
  const allPlatforms = ['Steam', 'GOG', 'Nuuvem', 'Green Man Gaming'];
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(allPlatforms);
  const [storeType, setStoreType] = useState<'all' | 'official' | 'keys'>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'price_asc' | 'price_desc' | 'score'>('relevance');

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  // 1. Filtros
  const filteredGames = games.map(g => {
    const validStores = (g.stores || []).filter(store => {
      const matchesPlatform = selectedPlatforms.some(p => store.name.toLowerCase().includes(p.toLowerCase()));
      const matchesStoreType = 
        storeType === 'all' ? true : 
        storeType === 'official' ? store.isOfficial === true : 
        store.isOfficial === false;
      const matchesPrice = store.price <= priceRange;
      
      return matchesPlatform && matchesStoreType && matchesPrice;
    }).sort((a, b) => a.price - b.price);

    return { ...g, stores: validStores, originalStoreCount: (g.stores || []).length };
  }).filter(g => {
    const matchesQuery = query.trim() === '' || g.name.toLowerCase().includes(query.toLowerCase());
    if (!matchesQuery) return false;

    if ((g as any).originalStoreCount === 0) return true;
    return g.stores.length > 0;
  });

  // 2. Ordenação
  const sortedGames = [...filteredGames].sort((a, b) => {
    const priceA = a.stores?.[0]?.price ?? 9999;
    const priceB = b.stores?.[0]?.price ?? 9999;
    const scoreA = a.opportunityScore || 0;
    const scoreB = b.opportunityScore || 0;

    if (sortBy === 'price_asc') return priceA - priceB;
    if (sortBy === 'price_desc') return priceB - priceA;
    if (sortBy === 'score') return scoreB - scoreA;
    return 0; // relevance / padrão
  });

  return (
    <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-500 pb-12">
      
      {/* Header dos Resultados */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-1 text-foreground">
            {query.trim() ? `Cotações para "${query}"` : 'Todos os Jogos'}
          </h1>
          <p className="text-xs text-muted-foreground">
            {sortedGames.length} {sortedGames.length === 1 ? 'jogo localizado' : 'jogos localizados em lojas oficiais'}
          </p>
        </div>
        
        <div className="flex gap-2.5 w-full md:w-auto items-center">
          <div className="flex items-center gap-2 bg-secondary/50 border border-border rounded-xl px-3 py-1.5 flex-1 md:flex-none">
            <ArrowUpDown size={15} className="text-muted-foreground" />
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-bold text-foreground outline-none cursor-pointer pr-2"
            >
              <option value="relevance" className="bg-card">Relevância</option>
              <option value="price_asc" className="bg-card">Menor Preço (R$)</option>
              <option value="price_desc" className="bg-card">Maior Preço (R$)</option>
              <option value="score" className="bg-card">Maior Score de Oferta</option>
            </select>
          </div>

          <button 
            className={`btn-outline md:hidden flex items-center gap-2 text-xs py-2 px-3 rounded-xl font-bold ${showFilters ? 'bg-primary/10 text-primary border-primary/50' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal size={15} /> Filtros
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Barra Lateral de Filtros */}
        <aside className={`w-full md:w-64 space-y-6 ${showFilters ? 'block' : 'hidden md:block'} shrink-0`}>
          <div className="glass-panel p-5 rounded-2xl border border-border space-y-5">
            <div className="space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Preço Máximo</h3>
              <div className="space-y-3">
                <input 
                  type="range" 
                  min="0" 
                  max="400" 
                  step="10"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-primary bg-secondary h-2 rounded-lg appearance-none cursor-pointer" 
                />
                <div className="flex justify-between text-xs font-mono font-bold">
                  <span className="text-muted-foreground">R$ 0</span>
                  <span className="text-primary">Até R$ {priceRange},00</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Lojas Verificadas</h3>
              <div className="space-y-2">
                {allPlatforms.map((platform) => {
                  const isSelected = selectedPlatforms.includes(platform);
                  return (
                    <label 
                      key={platform} 
                      className="flex items-center gap-2.5 cursor-pointer group" 
                      onClick={(e) => { e.preventDefault(); togglePlatform(platform); }}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-primary border-primary' : 'border-border bg-secondary group-hover:border-primary/50'}`}>
                        {isSelected && <Check size={12} className="text-black font-bold" />}
                      </div>
                      <span className="text-xs text-foreground font-medium">{platform}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-border space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Tipo de Origem</h3>
              <div className="space-y-2">
                <label 
                  className="flex items-center gap-2.5 cursor-pointer group" 
                  onClick={(e) => { e.preventDefault(); setStoreType(storeType === 'official' ? 'all' : 'official'); }}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${storeType === 'official' ? 'bg-primary border-primary' : 'border-border bg-secondary group-hover:border-primary/50'}`}>
                    {storeType === 'official' && <Check size={12} className="text-black font-bold" />}
                  </div>
                  <span className="text-xs text-foreground font-medium">Lojas Oficiais (Diretas)</span>
                </label>
                <label 
                  className="flex items-center gap-2.5 cursor-pointer group" 
                  onClick={(e) => { e.preventDefault(); setStoreType(storeType === 'keys' ? 'all' : 'keys'); }}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${storeType === 'keys' ? 'bg-primary border-primary' : 'border-border bg-secondary group-hover:border-primary/50'}`}>
                    {storeType === 'keys' && <Check size={12} className="text-black font-bold" />}
                  </div>
                  <span className="text-xs text-foreground font-medium">Revendedores Autorizados</span>
                </label>
              </div>
            </div>
          </div>
        </aside>

        {/* Lista de Resultados */}
        <div className="flex-1 space-y-3.5">
          {sortedGames.length === 0 ? (
            <div className="glass-panel rounded-2xl p-12 text-center flex flex-col items-center border border-border">
              <Search size={40} className="text-muted-foreground/30 mb-3" />
              <h3 className="text-lg font-bold mb-1 text-foreground">Nenhum resultado corresponde aos filtros</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Tente aumentar o teto de preço ou selecionar todas as lojas na barra lateral.
              </p>
            </div>
          ) : (
            sortedGames.map((game) => {
              const score = game.opportunityScore || 0;
              const bestStore = game.stores?.[0];
              const price = bestStore?.price;
              const historic = game.allTimeLow?.price;
              const discount = price && historic && price > historic ? Math.round((1 - historic / price) * 100) : 0;

              return (
                <div 
                  key={game.id} 
                  className="glass-panel rounded-2xl p-4 flex flex-col sm:flex-row gap-5 hover-card cursor-pointer group border border-border hover:border-primary/40 transition-all"
                  onClick={() => onSelectGame(game.id)}
                >
                  <div className="w-full sm:w-44 h-28 sm:h-auto rounded-xl overflow-hidden flex-shrink-0 relative border border-border">
                    <img 
                      src={game.coverImageUrl || '/placeholder.jpg'} 
                      alt={game.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {score >= 80 && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-primary text-black font-black text-[10px] rounded-md shadow-md uppercase tracking-wider">
                        Score {score}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                    <div>
                      <h3 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors text-foreground truncate">
                        {game.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {game.tags?.slice(0, 3).join(' • ') || 'Ação • Aventura'}
                      </p>
                    </div>
                    
                    <div className="flex items-end justify-between mt-3 pt-3 border-t border-border/50">
                      <div>
                        {game.isFree ? (
                          <span className="text-lg font-black text-success">Grátis para Jogar</span>
                        ) : price !== undefined ? (
                          <div className="flex flex-col">
                            <div className="flex items-baseline gap-2">
                              <span className="text-xl font-black font-mono text-foreground">
                                R$ {price.toFixed(2).replace('.', ',')}
                              </span>
                              {discount > 0 && (
                                <span className="px-1.5 py-0.5 bg-success/20 text-success text-[10px] font-bold rounded">
                                  -{discount}% Histórico
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-muted-foreground mt-0.5">
                              na <strong>{bestStore?.name || 'Steam'}</strong>
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Cotação em andamento</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {onAddToCart && !game.isFree && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); onAddToCart(game); }}
                            className="btn-primary py-2 px-3.5 rounded-xl text-xs font-bold shadow-md shadow-primary/20 flex items-center gap-1.5"
                            title="Comprar Key"
                          >
                            <ShoppingCart size={14} /> Comprar
                          </button>
                        )}
                        <button 
                          onClick={(e) => { e.stopPropagation(); onSelectGame(game.id); }}
                          className="btn-secondary py-2 px-4 rounded-xl text-xs font-bold border border-border hover:border-primary/50"
                        >
                          Comparar Lojas
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
export default SearchResultsView;
