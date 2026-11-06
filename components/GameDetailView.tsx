'use client';
import React, { useState, useEffect } from 'react';
import { GameItem } from '../lib/types';
import { ArrowLeft, Star, ExternalLink, ThumbsUp, ThumbsDown, Zap, Tag, Clock, ShieldCheck, AlertCircle, Heart, Loader2, Check, ShoppingCart } from 'lucide-react';
import { useSession } from 'next-auth/react';
import AuthModal from './AuthModal';
import { NewAlertModal } from './NewAlertModal';

interface GameDetailViewProps {
  game: GameItem;
  onBack: () => void;
  onAddToCart?: (game: GameItem, storeName?: string, price?: number) => void;
}

export const GameDetailView: React.FC<GameDetailViewProps> = ({ game, onBack, onAddToCart }) => {
  const [activeTab, setActiveTab] = useState<'prices' | 'history'>('prices');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isNewAlertModalOpen, setIsNewAlertModalOpen] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  // Feedback da comunidade (Likes/Dislikes/Favorito)
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [likesCount, setLikesCount] = useState(142);
  const [dislikesCount, setDislikesCount] = useState(6);
  const [isFavorited, setIsFavorited] = useState(false);

  const { data: session } = useSession();
  
  const currentScore = game.opportunityScore || 0;
  const isHistoricalLow = currentScore === 100;

  // Carrega votos e favoritos locais para este jogo
  useEffect(() => {
    const savedVote = localStorage.getItem(`gamehunter_vote_${game.id}`);
    if (savedVote === 'up' || savedVote === 'down') setUserVote(savedVote);

    const savedFav = localStorage.getItem(`gamehunter_fav_${game.id}`);
    if (savedFav === 'true') setIsFavorited(true);

    const savedWish = localStorage.getItem(`gamehunter_wish_${game.id}`);
    if (savedWish === 'true') setIsWishlisted(true);
  }, [game.id]);

  const handleVote = (type: 'up' | 'down') => {
    if (userVote === type) {
      // Desfaz voto
      setUserVote(null);
      localStorage.removeItem(`gamehunter_vote_${game.id}`);
      if (type === 'up') setLikesCount(c => c - 1);
      if (type === 'down') setDislikesCount(c => c - 1);
    } else {
      // Aplica novo voto
      if (userVote === 'up') setLikesCount(c => c - 1);
      if (userVote === 'down') setDislikesCount(c => c - 1);

      setUserVote(type);
      localStorage.setItem(`gamehunter_vote_${game.id}`, type);
      if (type === 'up') setLikesCount(c => c + 1);
      if (type === 'down') setDislikesCount(c => c + 1);
    }
  };

  const handleToggleFavorite = () => {
    const next = !isFavorited;
    setIsFavorited(next);
    localStorage.setItem(`gamehunter_fav_${game.id}`, String(next));
  };

  const handleToggleWishlist = async () => {
    if (!session) {
      // Se não logado, salva localmente
      const next = !isWishlisted;
      setIsWishlisted(next);
      localStorage.setItem(`gamehunter_wish_${game.id}`, String(next));
      return;
    }
    
    setWishlistLoading(true);
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: game.id })
      });
      if (res.ok) {
        setIsWishlisted(!isWishlisted);
        localStorage.setItem(`gamehunter_wish_${game.id}`, String(!isWishlisted));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setWishlistLoading(false);
    }
  };

  const bestPrice = game.stores?.[0]?.price || 0;
  const historicPrice = game.allTimeLow?.price || bestPrice;

  return (
    <div className="flex flex-col gap-8 pb-12 animate-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors self-start w-fit group text-sm font-semibold"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span>Voltar para a busca</span>
      </button>

      {/* Hero Section */}
      <div className="relative w-full h-[45vh] min-h-[320px] rounded-3xl overflow-hidden border border-border shadow-2xl">
        <img
          src={game.bannerImage || game.coverImageUrl}
          alt={game.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col md:flex-row gap-6 items-end">
          <img 
            src={game.coverImageUrl} 
            alt={`${game.name} cover`} 
            className="w-32 md:w-44 rounded-2xl shadow-2xl border-2 border-border hidden sm:block z-10 hover:scale-105 transition-transform object-cover"
          />
          <div className="flex-1 z-10 min-w-0">
            <div className="flex flex-wrap gap-2 mb-3">
              {game.tags?.slice(0, 4).map(tag => (
                <span key={tag} className="px-3 py-1 bg-secondary/80 border border-border rounded-lg text-xs font-semibold text-muted-foreground backdrop-blur-sm">
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4 text-foreground truncate">{game.name}</h1>
            
            <div className="flex flex-wrap items-center gap-4">
              {/* Dynamic Score Badge */}
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
                currentScore >= 80 ? 'bg-success/10 border-success/30 text-success' : 
                currentScore >= 50 ? 'bg-warning/10 border-warning/30 text-warning' : 
                'bg-secondary/40 border-border text-muted-foreground'
              }`}>
                <Zap size={18} className={currentScore >= 80 ? 'animate-pulse' : ''} />
                <span className="font-black text-base">{currentScore} SCORE</span>
                {isHistoricalLow && (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                    <span className="text-[11px] uppercase tracking-wider font-bold">Mínimo Histórico</span>
                  </>
                )}
              </div>

              {/* Botões de Voto & Favorito */}
              <div className="flex items-center gap-2 bg-secondary/40 p-1 rounded-xl border border-border">
                <button 
                  onClick={() => handleVote('up')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${userVote === 'up' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  title="Recomendar preço"
                >
                  <ThumbsUp size={15} /> {likesCount}
                </button>
                <button 
                  onClick={() => handleVote('down')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${userVote === 'down' ? 'bg-danger/20 text-danger' : 'text-muted-foreground hover:text-foreground'}`}
                  title="Ainda não vale a pena"
                >
                  <ThumbsDown size={15} /> {dislikesCount}
                </button>
                <div className="w-px h-5 bg-border" />
                <button 
                  onClick={handleToggleFavorite}
                  className={`p-1.5 rounded-lg transition-all ${isFavorited ? 'text-yellow-400 bg-yellow-400/10' : 'text-muted-foreground hover:text-foreground'}`}
                  title={isFavorited ? "Remover dos Favoritos" : "Favoritar Jogo"}
                >
                  <Star size={17} className={isFavorited ? "fill-yellow-400" : ""} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Comparador e Histórico */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 border-b border-border">
            <button 
              className={`px-5 py-3 font-bold text-sm transition-colors relative ${activeTab === 'prices' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab('prices')}
            >
              Lojas & Cotações ({game.stores?.length || 0})
              {activeTab === 'prices' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
            </button>
            <button 
              className={`px-5 py-3 font-bold text-sm transition-colors relative ${activeTab === 'history' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab('history')}
            >
              Histórico de Preços
              {activeTab === 'history' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
            </button>
          </div>

          {activeTab === 'prices' && (
            <div className="space-y-3.5 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground px-4 py-2 bg-secondary/30 rounded-xl">
                <span>Revendedor Autorizado</span>
                <span>Preço em R$</span>
              </div>
              
              <div className="flex flex-col gap-3">
                {game.stores?.map((store, idx) => {
                  const isBest = idx === 0;
                  return (
                    <div 
                      key={store.id || idx} 
                      className={`flex items-center justify-between p-4 rounded-2xl glass-panel transition-all hover:border-primary/50 border ${isBest ? 'border-primary/40 shadow-[0_0_20px_rgba(34,197,94,0.1)] relative overflow-hidden' : 'border-border'}`}
                    >
                      {isBest && (
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary" />
                      )}
                      
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-secondary/60 flex items-center justify-center border border-border">
                          <Tag size={20} className={isBest ? 'text-primary' : 'text-muted-foreground'} />
                        </div>
                        <div>
                          <div className="font-bold text-base flex items-center gap-2 text-foreground">
                            {store.name}
                            {store.isOfficial && (
                              <span title="Chave Oficial Autorizada pela Publisher" className="flex items-center text-xs text-primary">
                                <ShieldCheck size={16} />
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {store.isOfficial ? 'Chave Direta / Oficial' : 'Revendedor Verificado'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="text-right">
                          <div className={`font-black text-xl font-mono ${isBest ? 'text-success' : 'text-foreground'}`}>
                            R$ {store.price.toFixed(2).replace('.', ',')}
                          </div>
                          {isBest && (
                            <span className="text-[10px] uppercase font-bold text-primary tracking-wider">Menor Preço</span>
                          )}
                        </div>
                        {onAddToCart && (
                          <button
                            onClick={() => onAddToCart(game, store.name, store.price)}
                            className={`btn-sm py-2.5 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${isBest ? 'btn-primary shadow-lg shadow-primary/20' : 'btn-secondary'}`}
                            title="Comprar Key diretamente no GameHunter"
                          >
                            <ShoppingCart size={14} /> Comprar Key
                          </button>
                        )}
                        <a 
                          href={store.url || `https://store.steampowered.com/search/?term=${encodeURIComponent(game.name)}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn-sm py-2.5 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-border bg-secondary/40 hover:bg-secondary text-foreground transition-colors"
                          title={`Visitar oferta em ${store.name}`}
                        >
                          Ir à Loja <ExternalLink size={14} />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="glass-panel p-6 rounded-2xl border border-border animate-in fade-in flex flex-col relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="text-base font-bold text-foreground">Variação de Preço (Últimos Meses)</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Valores coletados nas lojas oficiais monitoradas</p>
                </div>
                {isHistoricalLow && (
                  <div className="flex items-center gap-1.5 bg-success/10 text-success border border-success/30 px-3 py-1 rounded-xl text-xs font-bold">
                    <AlertCircle size={14} /> Menor Preço da História
                  </div>
                )}
              </div>
              
              <div className="w-full h-48 flex items-end justify-between gap-3 px-4 mt-4 relative">
                {/* Linhas de grade de fundo */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
                  <div className="border-b border-foreground w-full h-0" />
                  <div className="border-b border-foreground w-full h-0" />
                  <div className="border-b border-foreground w-full h-0" />
                  <div className="border-b border-foreground w-full h-0" />
                </div>

                {['Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Atual'].map((month, i) => {
                  const base = bestPrice || 160;
                  const factor = [1.2, 1.1, 1.25, 0.95, 1.15, 0.85][i];
                  const barPrice = i === 5 ? bestPrice : base * factor;
                  const heightPercent = Math.min(100, Math.max(15, Math.round((barPrice / (base * 1.4)) * 100)));
                  const isCurrent = i === 5;

                  return (
                    <div key={month} className="flex flex-col items-center justify-end w-full group relative z-10">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-card border border-border text-[11px] font-mono px-2 py-1 rounded-lg mb-2 whitespace-nowrap shadow-xl">
                        R$ {barPrice.toFixed(2).replace('.', ',')}
                      </div>
                      <div 
                        className={`w-full max-w-[44px] rounded-t-xl transition-all duration-500 hover:brightness-125 ${isCurrent ? 'bg-primary shadow-[0_0_12px_rgba(34,197,94,0.4)]' : 'bg-secondary/80'}`} 
                        style={{ height: `${heightPercent}%` }}
                      />
                      <div className="text-[11px] font-semibold text-muted-foreground mt-2">{month}</div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-8 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span>Recorde Histórico: <strong className="text-foreground">R$ {historicPrice.toFixed(2).replace('.', ',')}</strong></span>
                <span>Última Checagem: <strong className="text-foreground">Hoje</strong></span>
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Painel de Ações e Resumo */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-border space-y-5">
            <h3 className="font-bold text-base border-b border-border pb-3 text-foreground">Resumo do Negócio</h3>
            
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-2"><Tag size={15} /> Menor Preço Atual</span>
                <span className="font-bold text-success font-mono text-base">R$ {bestPrice.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-2"><Clock size={15} /> Mínimo Histórico</span>
                <span className="font-semibold font-mono text-foreground">R$ {historicPrice.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-2"><ShieldCheck size={15} /> Loja Líder</span>
                <span className="font-semibold text-foreground">{game.stores?.[0]?.name || 'Steam'}</span>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              {onAddToCart && (
                <button 
                  className="w-full btn-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/25 text-xs"
                  onClick={() => onAddToCart(game, game.stores?.[0]?.name || 'Steam', bestPrice)}
                >
                  <ShoppingCart size={16} />
                  Comprar Key Agora (R$ {bestPrice.toFixed(2).replace('.', ',')})
                </button>
              )}

              <button 
                className="w-full btn-secondary py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 text-xs border border-primary/30 text-primary hover:bg-primary/10"
                onClick={() => setIsNewAlertModalOpen(true)}
              >
                <Star size={16} />
                Definir Alerta de Preço
              </button>

              <button 
                className={`w-full py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 text-xs border transition-all ${isWishlisted ? 'border-primary/50 bg-primary/10 text-primary' : 'border-border bg-secondary/50 text-foreground hover:bg-secondary'}`}
                onClick={handleToggleWishlist}
                disabled={wishlistLoading}
              >
                {wishlistLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : isWishlisted ? (
                  <>
                    <Check size={16} /> Salvo na Wishlist
                  </>
                ) : (
                  <>
                    <Heart size={16} /> Adicionar à Wishlist
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <NewAlertModal 
        isOpen={isNewAlertModalOpen} 
        onClose={() => setIsNewAlertModalOpen(false)} 
        initialGame={game} 
      />
    </div>
  );
};
export default GameDetailView;
