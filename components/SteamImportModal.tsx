'use client';
import React, { useState } from 'react';
import { X, Import, Loader2, CheckCircle2 } from 'lucide-react';

interface SteamImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SteamImportModal: React.FC<SteamImportModalProps> = ({ isOpen, onClose }) => {
  const [steamId, setSteamId] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  if (!isOpen) return null;

  const handleImport = () => {
    if (!steamId) return;
    setStatus('loading');
    setTimeout(() => {
      setStatus('success');
      setTimeout(() => {
        onClose();
        setStatus('idle');
        setSteamId('');
      }, 2000);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-card border border-border rounded-xl shadow-2xl animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Import size={20} className="text-primary" /> Importar da Steam
          </h2>
          <button onClick={onClose} className="p-1 rounded-md text-muted-foreground hover:bg-secondary transition-colors" disabled={status === 'loading'}>
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {status === 'idle' && (
            <div className="space-y-4 animate-in fade-in">
              <p className="text-sm text-muted-foreground">
                Importe sua Wishlist da Steam automaticamente. Certifique-se de que o seu perfil e a sua lista de desejos estejam definidos como <strong>Públicos</strong> nas configurações de privacidade da Steam.
              </p>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Steam ID ou URL do Perfil</label>
                <input 
                  type="text"
                  placeholder="Ex: 765611980... ou /id/seunome"
                  value={steamId}
                  onChange={(e) => setSteamId(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-md px-4 py-2 focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="pt-2">
                <button 
                  onClick={handleImport}
                  disabled={!steamId}
                  className="w-full btn-primary py-2.5"
                >
                  Iniciar Importação
                </button>
              </div>
            </div>
          )}

          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-in fade-in">
              <Loader2 size={48} className="text-primary animate-spin" />
              <div className="text-center">
                <h3 className="font-semibold">Buscando dados da Steam...</h3>
                <p className="text-sm text-muted-foreground mt-1">Isso pode levar alguns segundos.</p>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-in fade-in zoom-in">
              <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mb-2">
                <CheckCircle2 size={32} className="text-success" />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-lg text-success">Importação Concluída!</h3>
                <p className="text-sm text-muted-foreground mt-1">24 jogos foram adicionados aos seus Alertas.</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
