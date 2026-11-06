'use client';
import React, { useState } from 'react';
import { X, TrendingDown, PiggyBank, Share2, Check, ArrowRight } from 'lucide-react';

interface SavingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalSaved?: number;
  gamesTracked?: number;
  averageDiscount?: number;
}

export const SavingsModal: React.FC<SavingsModalProps> = ({ 
  isOpen, 
  onClose,
  totalSaved = 428.50,
  gamesTracked = 8,
  averageDiscount = 58
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleShare = async () => {
    const textToShare = `🎮 Economizei mais de R$ ${totalSaved.toFixed(2).replace('.', ',')} em jogos usando o GameHunter! Monitore preços e não pague o valor cheio: ${window.location.origin}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Minha Economia no GameHunter',
          text: textToShare,
          url: window.location.origin,
        });
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(textToShare);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.warn("Clipboard access denied");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden text-center">
        
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors z-10"
        >
          <X size={18} />
        </button>

        <div className="bg-gradient-to-b from-primary/20 via-primary/5 to-transparent p-8 pb-4">
          <div className="w-16 h-16 mx-auto bg-primary/20 text-primary border border-primary/30 rounded-2xl flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
            <PiggyBank size={32} />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Relatório de Economia</h2>
          <p className="text-muted-foreground text-xs mt-1">Estimativa de economia com base nos preços monitorados</p>
        </div>

        <div className="px-6 pb-6 space-y-5">
          <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-primary to-emerald-600 py-1 font-mono tracking-tight">
            R$ {totalSaved.toFixed(2).replace('.', ',')}
          </div>
          
          <div className="bg-secondary/40 border border-border rounded-xl p-3.5 flex items-center justify-around text-center">
            <div>
              <div className="text-[11px] font-semibold text-muted-foreground mb-0.5">Jogos Vigiados</div>
              <div className="font-bold text-base text-foreground">{gamesTracked}</div>
            </div>
            <div className="w-px h-8 bg-border"></div>
            <div>
              <div className="text-[11px] font-semibold text-muted-foreground mb-0.5">Desconto Médio</div>
              <div className="font-bold text-base text-primary flex items-center gap-1 justify-center">
                <TrendingDown size={14} /> {averageDiscount}%
              </div>
            </div>
          </div>

          <div className="flex gap-2.5">
            <button 
              onClick={handleShare}
              className={`flex-1 btn-outline py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${copied ? 'border-primary text-primary bg-primary/10' : ''}`}
            >
              {copied ? (
                <>
                  <Check size={15} /> Link Copiado!
                </>
              ) : (
                <>
                  <Share2 size={15} /> Compartilhar
                </>
              )}
            </button>
            <button 
              onClick={onClose} 
              className="flex-1 btn-primary py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
            >
              Continuar Caçando <ArrowRight size={14} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
