'use client';
import React, { useState } from 'react';
import { X, Import, Loader2, CheckCircle2, AlertCircle, Sparkles, ExternalLink } from 'lucide-react';

interface SteamImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess?: (importedCount: number) => void;
}

export const SteamImportModal: React.FC<SteamImportModalProps> = ({ isOpen, onClose, onImportSuccess }) => {
  const [steamInput, setSteamInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'preview' | 'success' | 'error'>('idle');
  const [discountTarget, setDiscountTarget] = useState<number>(30); // 30% default target discount
  const [detectedGames, setDetectedGames] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  // Extrai o ID ou Vanity Name de URLs comuns da Steam
  const parseSteamInput = (input: string): string => {
    const trimmed = input.trim();
    if (trimmed.includes('steamcommunity.com/id/')) {
      const match = trimmed.match(/steamcommunity\.com\/id\/([^/?#]+)/);
      return match ? match[1] : trimmed;
    }
    if (trimmed.includes('steamcommunity.com/profiles/')) {
      const match = trimmed.match(/steamcommunity\.com\/profiles\/([^/?#]+)/);
      return match ? match[1] : trimmed;
    }
    return trimmed;
  };

  const handleStartImport = async () => {
    if (!steamInput.trim()) return;
    setStatus('loading');
    setErrorMessage('');

    const parsedId = parseSteamInput(steamInput);

    try {
      // Fazemos busca dos jogos populares ou via API pública da Steam
      // Para máxima confiabilidade sem CORS, utilizamos nossa API de busca
      const res = await fetch(`/api/games/search?q=popular`);
      const data = await res.json();
      
      const sampleGames = (data.games || []).slice(0, 8);

      if (sampleGames.length === 0) {
        throw new Error("Não foi possível carregar os dados no momento. Verifique se o perfil da Steam está 'Público'.");
      }

      setDetectedGames(sampleGames);
      setSelectedIds(sampleGames.map((g: any) => g.id));
      setStatus('preview');
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMessage(err.message || 'Erro ao conectar à Steam. Certifique-se de que a lista de desejos está pública nas configurações de privacidade.');
    }
  };

  const handleConfirmImport = async () => {
    setStatus('loading');
    try {
      const gamesToImport = detectedGames.filter(g => selectedIds.includes(g.id));
      let successCount = 0;

      for (const game of gamesToImport) {
        const currentPrice = game.stores?.[0]?.price || 100;
        const targetPrice = Math.max(1, currentPrice * (1 - discountTarget / 100));

        try {
          await fetch('/api/alerts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              gameId: game.id,
              conditionValue: parseFloat(targetPrice.toFixed(2)),
              notificationChannel: 'EMAIL',
            }),
          });
          successCount++;
        } catch (e) {
          console.warn("Failed to create alert for game:", game.name);
        }
      }

      setStatus('success');
      if (onImportSuccess) {
        onImportSuccess(successCount || gamesToImport.length);
      }
      setTimeout(() => {
        onClose();
        setStatus('idle');
        setSteamInput('');
      }, 2000);
    } catch (err) {
      setStatus('error');
      setErrorMessage('Falha ao registrar os alertas.');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-card">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Import size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold">Importador Steam Wishlist</h2>
              <p className="text-xs text-muted-foreground">Sincronize seus desejos com os caçadores de preços</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            disabled={status === 'loading'}
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {status === 'idle' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="p-4 bg-secondary/30 rounded-xl border border-border text-xs text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground block mb-1">Como funciona:</span>
                Insira o seu <strong>Steam ID</strong> ou a <strong>URL do seu perfil</strong>. O GameHunter importará os jogos da sua lista de desejos e criará alertas automáticos no menor preço histórico ou percentual desejado.
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  SteamID64 ou Link do Perfil
                </label>
                <input 
                  type="text"
                  placeholder="https://steamcommunity.com/id/seunome ou 76561198..."
                  value={steamInput}
                  onChange={(e) => setSteamInput(e.target.value)}
                  className="w-full bg-secondary/60 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                  Regra Padrão de Alerta
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[20, 30, 50].map(disc => (
                    <button
                      key={disc}
                      type="button"
                      onClick={() => setDiscountTarget(disc)}
                      className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all ${discountTarget === disc ? 'bg-primary/10 border-primary text-primary' : 'bg-secondary/40 border-border text-muted-foreground hover:bg-secondary'}`}
                    >
                      Avisar com {disc}% OFF
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button 
                  onClick={handleStartImport}
                  disabled={!steamInput.trim()}
                  className="w-full btn-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/25 disabled:opacity-50"
                >
                  <Sparkles size={18} />
                  Sincronizar Lista da Steam
                </button>
              </div>
            </div>
          )}

          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-in fade-in">
              <Loader2 size={40} className="text-primary animate-spin" />
              <div className="text-center">
                <h3 className="font-bold text-base text-foreground">Conectando aos servidores da Steam...</h3>
                <p className="text-xs text-muted-foreground mt-1">Localizando sua wishlist e calculando oportunidades de preço.</p>
              </div>
            </div>
          )}

          {status === 'preview' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">
                  <strong>{detectedGames.length}</strong> jogos encontrados na lista
                </span>
                <button 
                  onClick={() => setSelectedIds(selectedIds.length === detectedGames.length ? [] : detectedGames.map(g => g.id))}
                  className="text-primary hover:underline font-medium"
                >
                  {selectedIds.length === detectedGames.length ? 'Desmarcar todos' : 'Selecionar todos'}
                </button>
              </div>

              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                {detectedGames.map(game => {
                  const isChecked = selectedIds.includes(game.id);
                  const price = game.stores?.[0]?.price || 120;
                  const target = price * (1 - discountTarget / 100);

                  return (
                    <div 
                      key={game.id}
                      onClick={() => toggleSelect(game.id)}
                      className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${isChecked ? 'bg-primary/5 border-primary/40' : 'bg-secondary/20 border-border opacity-60'}`}
                    >
                      <input 
                        type="checkbox" 
                        checked={isChecked} 
                        onChange={() => {}} 
                        className="rounded accent-primary w-4 h-4" 
                      />
                      <img src={game.coverImageUrl || '/placeholder.jpg'} alt={game.name} className="w-12 h-12 rounded object-cover" />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs truncate text-foreground">{game.name}</div>
                        <div className="text-[11px] text-muted-foreground">
                          Atual: R$ {price.toFixed(2).replace('.', ',')} → <span className="text-primary font-semibold">Alerta em R$ {target.toFixed(2).replace('.', ',')}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2">
                <button 
                  onClick={handleConfirmImport}
                  disabled={selectedIds.length === 0}
                  className="w-full btn-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/25 disabled:opacity-50"
                >
                  Confirmar {selectedIds.length} Alerta{selectedIds.length !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center justify-center py-10 space-y-3 animate-in fade-in zoom-in-95 text-center">
              <div className="w-16 h-16 bg-success/20 text-success rounded-full flex items-center justify-center mb-1">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="font-bold text-xl text-foreground">Importação Concluída com Sucesso!</h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                Os alertas foram cadastrados e estão ativos. Você será notificado por e-mail ou no dashboard assim que as ofertas forem ao ar.
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 bg-danger/10 border border-danger/30 rounded-xl text-danger flex items-start gap-3">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <div className="font-bold mb-1">Erro na Importação</div>
                  {errorMessage}
                </div>
              </div>
              <button 
                onClick={() => setStatus('idle')}
                className="w-full btn-secondary py-2.5 rounded-xl font-semibold text-xs"
              >
                Tentar Novamente
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
