'use client';
import React, { useState, useEffect } from 'react';
import { Search, X, Bell, Loader2, ArrowLeft, CheckCircle2, TrendingDown, Sparkles } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface NewAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialGame?: any;
  onAlertCreated?: (alert: any) => void;
}

export const NewAlertModal: React.FC<NewAlertModalProps> = ({ 
  isOpen, 
  onClose, 
  initialGame,
  onAlertCreated 
}) => {
  const { data: session } = useSession();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Jogo selecionado para configurar o alerta
  const [selectedGame, setSelectedGame] = useState<any>(initialGame || null);
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [notificationChannel, setNotificationChannel] = useState<'EMAIL' | 'PUSH'>('EMAIL');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (initialGame) {
      setSelectedGame(initialGame);
      const currentPrice = initialGame.stores?.[0]?.price || 100;
      setTargetPrice((currentPrice * 0.8).toFixed(2));
    }
  }, [initialGame]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedGame(null);
      setSuccess(false);
      setErrorMessage('');
      setSearch('');
      setResults([]);
    }
  }, [isOpen]);

  // Busca debounced
  useEffect(() => {
    if (!isOpen || selectedGame) return;

    if (search.trim().length < 3) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const fetchGames = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/games/search?q=${encodeURIComponent(search.trim())}`);
        const data = await res.json();
        setResults(data.games || []);
        setHasSearched(true);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchGames, 400);
    return () => clearTimeout(debounce);
  }, [search, isOpen, selectedGame]);

  if (!isOpen) return null;

  const handleSelectGame = (game: any) => {
    setSelectedGame(game);
    const currentPrice = game.stores?.[0]?.price || 100;
    // Sugestão padrão: 20% abaixo do preço atual
    setTargetPrice((currentPrice * 0.8).toFixed(2));
    setErrorMessage('');
  };

  const handleApplyQuickDiscount = (percentage: number) => {
    const currentPrice = selectedGame?.stores?.[0]?.price || 100;
    const calculated = currentPrice * (1 - percentage / 100);
    setTargetPrice(Math.max(1, calculated).toFixed(2));
  };

  const handleApplyHistoricalLow = () => {
    if (selectedGame?.allTimeLow?.price) {
      setTargetPrice(selectedGame.allTimeLow.price.toFixed(2));
    }
  };

  const handleSaveAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    const parsedPrice = parseFloat(targetPrice.replace(',', '.'));
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setErrorMessage('Por favor, informe um preço alvo válido.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: selectedGame.id,
          conditionValue: parsedPrice,
          notificationChannel: notificationChannel,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Não foi possível salvar o alerta.');
      }

      setSuccess(true);
      if (onAlertCreated) {
        onAlertCreated({
          id: data.alert?.id || String(Date.now()),
          gameId: selectedGame.id,
          gameName: selectedGame.name,
          targetPrice: parsedPrice,
          currentPrice: selectedGame.stores?.[0]?.price || parsedPrice,
          store: selectedGame.stores?.[0]?.name || 'Todas as Lojas',
          image: selectedGame.coverImageUrl || '',
          active: true,
        });
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      // Caso não esteja logado, persistir localmente para uma experiência sem fricção
      if (!session) {
        const localAlert = {
          id: 'local-' + Date.now(),
          gameId: selectedGame.id,
          gameName: selectedGame.name,
          targetPrice: parsedPrice,
          currentPrice: selectedGame.stores?.[0]?.price || parsedPrice,
          store: selectedGame.stores?.[0]?.name || 'Steam / Nuuvem',
          image: selectedGame.coverImageUrl || '',
          active: true,
        };

        const existing = JSON.parse(localStorage.getItem('gamehunter_local_alerts') || '[]');
        localStorage.setItem('gamehunter_local_alerts', JSON.stringify([...existing, localAlert]));

        setSuccess(true);
        if (onAlertCreated) onAlertCreated(localAlert);
        setTimeout(() => onClose(), 1500);
      } else {
        setErrorMessage(err.message || 'Erro ao comunicar com o servidor.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header do Modal */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-card">
          <div className="flex items-center gap-2.5">
            {selectedGame && !initialGame && !success && (
              <button 
                onClick={() => setSelectedGame(null)} 
                className="p-1 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors mr-1"
                title="Voltar para busca"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Bell size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {success ? 'Alerta Configurado!' : selectedGame ? 'Definir Preço Alvo' : 'Criar Novo Alerta'}
              </h2>
              <p className="text-xs text-muted-foreground">
                {selectedGame ? selectedGame.name : 'Selecione um jogo para monitorar o menor preço'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 flex-1 overflow-y-auto">
          {success ? (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3 animate-in fade-in">
              <div className="w-16 h-16 bg-success/20 text-success rounded-full flex items-center justify-center mb-2">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="text-xl font-bold text-foreground">Alerta Ativo com Sucesso!</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Monitoraremos {selectedGame?.name} 24 horas por dia. Avisaremos assim que o preço cair para <strong>R$ {parseFloat(targetPrice || '0').toFixed(2).replace('.', ',')}</strong> ou menos.
              </p>
            </div>
          ) : !selectedGame ? (
            /* Passo 1: Busca de Jogo */
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input 
                  type="text"
                  placeholder="Digite o nome do jogo (ex: Cyberpunk, Resident Evil)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-secondary/60 border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                  autoFocus
                />
              </div>

              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-1">
                {loading ? 'Consultando catálogo de lojas...' : hasSearched ? `Resultados encontrados (${results.length})` : 'Digite pelo menos 3 letras para pesquisar'}
              </div>

              {loading && (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 size={32} className="text-primary animate-spin" />
                  <p className="text-xs text-muted-foreground">Buscando cotações em tempo real...</p>
                </div>
              )}

              {!loading && results.length > 0 && (
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {results.map((game) => {
                    const price = game.stores?.[0]?.price;
                    return (
                      <div 
                        key={game.id} 
                        onClick={() => handleSelectGame(game)}
                        className="flex items-center gap-3.5 p-3 rounded-xl border border-border bg-secondary/20 hover:bg-secondary/60 hover:border-primary/50 cursor-pointer transition-all group"
                      >
                        <img 
                          src={game.coverImageUrl || '/placeholder.jpg'} 
                          alt={game.name} 
                          className="w-14 h-14 bg-secondary rounded-lg object-cover flex-shrink-0 border border-border" 
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                            {game.name}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            Menor atual: <span className="font-semibold text-foreground">{price ? `R$ ${price.toFixed(2).replace('.', ',')}` : 'Consultando'}</span>
                            {game.stores?.[0]?.name && ` na ${game.stores[0].name}`}
                          </div>
                        </div>
                        <button 
                          type="button"
                          className="btn-primary text-xs py-1.5 px-3.5 rounded-lg shrink-0 pointer-events-none group-hover:bg-primary/90"
                        >
                          Configurar
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {!loading && hasSearched && results.length === 0 && (
                <div className="py-12 text-center text-muted-foreground text-sm">
                  Nenhum jogo encontrado para "{search}". Verifique a digitação ou tente outro título.
                </div>
              )}
            </div>
          ) : (
            /* Passo 2: Formulário de Configuração do Alerta */
            <form onSubmit={handleSaveAlert} className="space-y-5 animate-in fade-in">
              <div className="flex items-center gap-4 p-3.5 bg-secondary/30 rounded-xl border border-border">
                <img 
                  src={selectedGame.coverImageUrl || '/placeholder.jpg'} 
                  alt={selectedGame.name} 
                  className="w-16 h-16 rounded-lg object-cover border border-border"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-foreground">{selectedGame.name}</h4>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span>Atual: <strong className="text-foreground">R$ {(selectedGame.stores?.[0]?.price || 0).toFixed(2).replace('.', ',')}</strong></span>
                    {selectedGame.allTimeLow?.price && (
                      <span className="text-primary font-medium">Mín. Histórico: R$ {selectedGame.allTimeLow.price.toFixed(2).replace('.', ',')}</span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Preço Alvo Desejado (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-muted-foreground text-sm">R$</span>
                  <input 
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    className="w-full bg-secondary/50 border border-border rounded-xl pl-11 pr-4 py-2.5 text-lg font-bold text-foreground focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                    placeholder="50,00"
                    autoFocus
                  />
                </div>

                {/* Botões de sugestão rápida */}
                <div className="flex flex-wrap gap-2 mt-2.5">
                  <button 
                    type="button" 
                    onClick={() => handleApplyQuickDiscount(20)}
                    className="text-xs px-2.5 py-1 bg-secondary rounded-lg border border-border hover:border-primary/50 transition-colors text-muted-foreground hover:text-foreground"
                  >
                    -20% off
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleApplyQuickDiscount(30)}
                    className="text-xs px-2.5 py-1 bg-secondary rounded-lg border border-border hover:border-primary/50 transition-colors text-muted-foreground hover:text-foreground"
                  >
                    -30% off
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleApplyQuickDiscount(50)}
                    className="text-xs px-2.5 py-1 bg-secondary rounded-lg border border-border hover:border-primary/50 transition-colors text-muted-foreground hover:text-foreground"
                  >
                    -50% off
                  </button>
                  {selectedGame.allTimeLow?.price && (
                    <button 
                      type="button" 
                      onClick={handleApplyHistoricalLow}
                      className="text-xs px-2.5 py-1 bg-primary/10 text-primary rounded-lg border border-primary/20 hover:bg-primary/20 transition-colors flex items-center gap-1 font-medium"
                    >
                      <Sparkles size={12} /> Menor da História
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Canal de Notificação
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNotificationChannel('EMAIL')}
                    className={`p-3 rounded-xl border text-left transition-all ${notificationChannel === 'EMAIL' ? 'border-primary bg-primary/10 text-primary font-bold' : 'border-border bg-secondary/30 text-muted-foreground hover:bg-secondary'}`}
                  >
                    <div className="text-sm font-semibold">E-mail</div>
                    <div className="text-[11px] opacity-75 truncate">{session?.user?.email || 'hunter@notificacoes.com'}</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNotificationChannel('PUSH')}
                    className={`p-3 rounded-xl border text-left transition-all ${notificationChannel === 'PUSH' ? 'border-primary bg-primary/10 text-primary font-bold' : 'border-border bg-secondary/30 text-muted-foreground hover:bg-secondary'}`}
                  >
                    <div className="text-sm font-semibold">Navegador</div>
                    <div className="text-[11px] opacity-75">Push no GameHunter</div>
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-danger/10 border border-danger/30 text-danger rounded-xl text-xs font-semibold">
                  {errorMessage}
                </div>
              )}

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={saving}
                  className="w-full btn-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
                >
                  {saving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Ativando Alerta...
                    </>
                  ) : (
                    <>
                      <Bell size={18} />
                      Ativar Monitoramento
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
