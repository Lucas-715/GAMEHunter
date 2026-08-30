'use client';
import React from 'react';
import { X, TrendingDown, PiggyBank, Share2 } from 'lucide-react';

interface SavingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SavingsModal: React.FC<SavingsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-sm bg-card border border-border rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden text-center">
        
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-md text-muted-foreground hover:bg-secondary transition-colors z-10">
          <X size={20} />
        </button>

        <div className="bg-gradient-to-b from-success/20 to-transparent p-8 pb-4">
          <div className="w-20 h-20 mx-auto bg-success/20 rounded-full flex items-center justify-center mb-4 relative">
            <div className="absolute inset-0 border-4 border-success rounded-full animate-ping opacity-20"></div>
            <PiggyBank size={40} className="text-success" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Economia Total!</h2>
          <p className="text-muted-foreground text-sm mt-2">Através dos nossos alertas, você economizou:</p>
        </div>

        <div className="px-8 pb-8 space-y-6">
          <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-success to-emerald-700 py-2">
            R$ 845,90
          </div>
          
          <div className="bg-secondary/50 rounded-lg p-4 flex items-center justify-around">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Jogos Comprados</div>
              <div className="font-bold text-lg">12</div>
            </div>
            <div className="w-px h-8 bg-border"></div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Desconto Médio</div>
              <div className="font-bold text-lg text-success flex items-center gap-1 justify-center">
                <TrendingDown size={16} /> 64%
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="flex-1 btn-outline flex items-center justify-center gap-2">
              <Share2 size={16} /> Compartilhar
            </button>
            <button onClick={onClose} className="flex-1 btn-primary">
              Incrível
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
