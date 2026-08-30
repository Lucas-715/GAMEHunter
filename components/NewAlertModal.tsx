'use client';
import React, { useState, useEffect } from 'react';
import { Search, X, Bell, Loader2 } from 'lucide-react';

interface NewAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewAlertModal: React.FC<NewAlertModalProps> = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const fetchGames = async () => {
      if (search.trim().length < 3) {
        setResults([]);
        setHasSearched(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/games/search?q=${encodeURIComponent(search)}`);
        const data = await res.json();
        setResults(data.games || []);
        setHasSearched(true);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchGames, 500);
    return () => clearTimeout(debounce);
  }, [search]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-card border border-border rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Bell size={20} className="text-primary" /> Criar Novo Alerta
          </h2>
          <button onClick={onClose} className="p-1 rounded-md text-muted-foreground hover:bg-secondary transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              type="text"
              placeholder="Buscar jogo na base..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-secondary border border-border rounded-md pl-10 pr-4 py-2 focus:outline-none focus:border-primary transition-colors"
              autoFocus
            />
          </div>

          <div className="space-y-4">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              {loading ? 'Buscando...' : hasSearched ? `Resultados da busca (${results.length})` : 'Digite pelo menos 3 letras'}
            </div>
            
            {loading && (
              <div className="flex justify-center p-8">
                <Loader2 size={32} className="text-primary animate-spin" />
              </div>
            )}

            {!loading && results.map((game) => (
              <div key={game.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-colors group">
                <img src={game.coverImageUrl} alt={game.name} className="w-12 h-12 bg-secondary rounded object-cover flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium text-sm group-hover:text-primary transition-colors">{game.name}</div>
                  <div className="text-xs text-muted-foreground">Preço base: R$ {game.stores[0]?.price?.toFixed(2).replace('.', ',')}</div>
                </div>
                <button className="btn-primary text-xs py-1.5 px-3">
                  Configurar
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
