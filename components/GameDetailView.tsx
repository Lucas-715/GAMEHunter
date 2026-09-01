'use client';
import React, { useState } from 'react';
import { GameItem } from '../lib/types';
import { ArrowLeft, Star, ExternalLink, ThumbsUp, ThumbsDown, Zap, Tag, Clock, ShieldCheck, AlertCircle, TrendingDown } from 'lucide-react';

interface GameDetailViewProps {
  game: GameItem;
  onBack: () => void;
}

export const GameDetailView: React.FC<GameDetailViewProps> = ({ game, onBack }) => {
  const [activeTab, setActiveTab] = useState<'prices' | 'history'>('prices');
  
  const currentScore = game.opportunityScore || 0;
  const isHistoricalLow = currentScore === 100;

  return (
    <div className="flex flex-col gap-8 pb-12 animate-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors self-start w-fit group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span>Voltar para busca</span>
      </button>

      {/* Hero Section */}
      <div className="relative w-full h-[40vh] min-h-[300px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
        <img
          src={game.bannerImage || game.coverImageUrl}
          alt={game.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col md:flex-row gap-8 items-end">
          <img 
            src={game.coverImageUrl} 
            alt={`${game.name} cover`} 
            className="w-32 md:w-48 rounded-lg shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-white/20 hidden sm:block z-10 hover:scale-105 transition-transform"
          />
          <div className="flex-1 z-10">
            <div className="flex flex-wrap gap-2 mb-3">
              {game.tags?.map(tag => (
                <span key={tag} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded text-xs text-muted-foreground backdrop-blur-sm">
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">{game.name}</h1>
            
            <div className="flex flex-wrap items-center gap-6">
              {/* Dynamic Score Badge */}
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
                currentScore >= 80 ? 'bg-success/10 border-success/30 text-success' : 
                currentScore >= 50 ? 'bg-warning/10 border-warning/30 text-warning' : 
                'bg-danger/10 border-danger/30 text-danger'
              }`}>
                <Zap size={18} className={currentScore >= 80 ? 'animate-pulse' : ''} />
                <span className="font-bold text-lg">{currentScore} SCORE</span>
                {isHistoricalLow && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-current opacity-50" />
                    <span className="text-xs uppercase tracking-wider font-semibold">Historical Low</span>
                  </>
                )}
              </div>

              {/* Feedback Actions */}
              <div className="flex items-center gap-2">
                <button className="w-10 h-10 rounded-full bg-secondary/50 border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all">
                  <ThumbsUp size={18} />
                </button>
                <button className="w-10 h-10 rounded-full bg-secondary/50 border border-border flex items-center justify-center text-muted-foreground hover:text-danger hover:border-danger/50 transition-all">
                  <ThumbsDown size={18} />
                </button>
                <button className="w-10 h-10 rounded-full bg-secondary/50 border border-border flex items-center justify-center text-muted-foreground hover:text-warning hover:border-warning/50 transition-all ml-2" title="Adicionar aos Favoritos">
                  <Star size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Main Content (Tabs) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-1 border-b border-border">
            <button 
              className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'prices' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab('prices')}
            >
              Comparar Preços
              {activeTab === 'prices' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
            </button>
            <button 
              className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'history' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab('history')}
            >
              Histórico de Preços
              {activeTab === 'history' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
            </button>
          </div>

          {activeTab === 'prices' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between text-sm text-muted-foreground px-4 py-2 bg-secondary/30 rounded-lg">
                <span>Vendido por</span>
                <span>Preço Final</span>
              </div>
              
              <div className="flex flex-col gap-3">
                {game.stores.map((store, idx) => {
                  const isBest = idx === 0;
                  return (
                    <div key={store.id} className={`flex items-center justify-between p-4 rounded-xl glass-panel transition-all hover:-translate-y-0.5 ${isBest ? 'border-primary/50 shadow-[0_4px_20px_rgba(34,197,94,0.1)] relative overflow-hidden' : ''}`}>
                      {isBest && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                      )}
                      
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center">
                          <Tag size={20} className={isBest ? 'text-primary' : 'text-muted-foreground'} />
                        </div>
                        <div>
                          <div className="font-bold flex items-center gap-2">
                            {store.name}
                            {store.isOfficial && (
                              <span title="Loja Oficial Autorizada" className="flex items-center">
                                <ShieldCheck size={14} className="text-success" />
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {store.isOfficial ? 'Chave Direta/Oficial' : 'Revendedor de Chaves'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className={`font-bold text-xl ${isBest ? 'text-success' : 'text-foreground'}`}>
                            R$ {store.price.toFixed(2).replace('.', ',')}
                          </div>
                        </div>
                        <a 
                          href={store.url || `https://www.google.com/search?q=${encodeURIComponent(game.name + ' buy ' + store.name)}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={isBest ? 'btn-primary' : 'btn-secondary'}
                        >
                          Comprar <ExternalLink size={16} className="ml-2" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="glass-panel p-6 rounded-xl animate-in fade-in flex flex-col items-center relative overflow-hidden">
              <h4 className="text-lg font-bold mb-6 self-start">Evolução do Preço (Últimos 6 Meses)</h4>
              
              <div className="w-full h-48 flex items-end justify-between gap-2 px-2 mt-4 relative">
                {/* Chart Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
                  <div className="border-b border-white w-full h-0"></div>
                  <div className="border-b border-white w-full h-0"></div>
                  <div className="border-b border-white w-full h-0"></div>
                  <div className="border-b border-white w-full h-0"></div>
                </div>

                {/* Mock Data Bars */}
                {Array.from({ length: 6 }).map((_, i) => {
                  const basePrice = game.stores[0]?.price || 150;
                  const isCurrent = i === 5;
                  
                  // Avoid Math.random during render (ESLint purity rule)
                  // We'll use a deterministic pseudo-random based on the index to vary the price slightly
                  const variation = [0.1, -0.05, 0.15, -0.1, 0.05, 0];
                  const mockPrice = isCurrent ? basePrice : basePrice * (1 + variation[i]);
                  const heightPercentage = Math.min(100, Math.max(10, (mockPrice / (basePrice * 2)) * 100));
                  
                  return (
                    <div key={i} className="flex flex-col items-center justify-end w-full group">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-background border border-border text-xs px-2 py-1 rounded mb-2 whitespace-nowrap z-10">
                        R$ {mockPrice.toFixed(2).replace('.', ',')}
                      </div>
                      <div 
                        className={`w-full max-w-[40px] rounded-t-md transition-all duration-500 hover:brightness-125 ${isCurrent ? 'bg-primary' : 'bg-primary/40'}`} 
                        style={{ height: `${heightPercentage}%` }}
                      />
                      <div className="text-xs text-muted-foreground mt-2 font-mono">Mês {i + 1}</div>
                    </div>
                  );
                })}
              </div>
              
              <div className="text-center mt-8 pt-4 border-t border-white/5 w-full">
                <p className="text-sm">Mínimo histórico: R$ {game.allTimeLow.price.toFixed(2).replace('.', ',')} em {game.allTimeLow.date}</p>
              </div>

              {currentScore > 80 && (
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-success/10 text-success border border-success/20 px-3 py-1.5 rounded-md text-sm">
                  <AlertCircle size={16} />
                  <span>Promoção expira em breve</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Col: Sidebar info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-xl space-y-6">
            <h3 className="font-semibold text-lg border-b border-white/10 pb-4">Detalhes da Oferta</h3>
            
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-2"><Tag size={16} /> Menor Preço Atual</span>
                <span className="font-bold text-success">R$ {game.stores[0]?.price.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-2"><Clock size={16} /> Menor Histórico</span>
                <span className="font-medium">R$ {game.allTimeLow.price.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>

            <button className="w-full btn-outline border-primary/30 text-primary hover:bg-primary/10 group">
              <Star size={18} className="mr-2 group-hover:fill-primary transition-colors" />
              Criar Alerta de Preço
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
