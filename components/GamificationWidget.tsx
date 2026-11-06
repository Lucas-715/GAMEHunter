'use client';
import React, { useState } from 'react';
import { Trophy, Star, Target, Zap, Crown, BellRing, X, Award, CheckCircle2 } from 'lucide-react';

export const GamificationWidget: React.FC = () => {
  const [showAllModal, setShowAllModal] = useState(false);

  // Dados de progressão do Caçador
  const currentLevel = 14;
  const currentXP = 2450;
  const nextLevelXP = 3000;
  const progressPercent = Math.min(100, Math.round((currentXP / nextLevelXP) * 100));

  const achievements = [
    { id: 1, title: 'Primeira Caçada', description: 'Encontrou o primeiro desconto de 50% ou mais', icon: <Target className="text-blue-400" size={20} />, unlocked: true, date: '12 Out' },
    { id: 2, title: 'Vigilante Noturno', description: 'Ativou 10 alertas de preços em lojas oficiais', icon: <BellRing className="text-yellow-400" size={20} />, unlocked: true, date: '28 Out' },
    { id: 3, title: 'Mestre da Economia', description: 'Economizou mais de R$ 500 em compras rastreadas', icon: <Crown className="text-purple-400" size={20} />, unlocked: true, date: '04 Nov' },
    { id: 4, title: 'Gatilho Rápido', description: 'Aproveitou uma oferta relâmpago em menos de 1 hora', icon: <Zap className="text-orange-400" size={20} />, unlocked: false },
    { id: 5, title: 'Colecionador Grátis', description: 'Resgatou 5 jogos gratuitos promovidos na plataforma', icon: <Award className="text-emerald-400" size={20} />, unlocked: false },
  ];

  return (
    <>
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-5">
        {/* Level & XP Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary/10 border-2 border-primary rounded-2xl flex items-center justify-center flex-shrink-0 relative shadow-[0_0_15px_rgba(34,197,94,0.2)]">
            <Trophy className="text-primary" size={24} />
            <div className="absolute -bottom-2 bg-primary text-primary-foreground text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
              Nv. {currentLevel}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-end mb-1.5">
              <h3 className="font-bold text-sm text-foreground">Rank de Caçador</h3>
              <span className="text-[11px] font-mono text-muted-foreground">
                {currentXP} / {nextLevelXP} XP
              </span>
            </div>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Conquistas Recentes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Star size={14} className="text-yellow-500 fill-yellow-500" />
              Conquistas
            </h4>
            <button 
              onClick={() => setShowAllModal(true)}
              className="text-xs text-primary font-bold hover:underline"
            >
              Ver todas ({achievements.filter(a => a.unlocked).length}/{achievements.length})
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-2.5">
            {achievements.slice(0, 2).map(ach => (
              <div 
                key={ach.id} 
                className={`p-3 rounded-xl border flex gap-2.5 ${ach.unlocked ? 'bg-secondary/30 border-primary/20' : 'bg-secondary/20 border-border opacity-50 grayscale'}`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${ach.unlocked ? 'bg-primary/10' : 'bg-secondary'}`}>
                  {ach.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h5 className="text-xs font-bold truncate text-foreground" title={ach.title}>{ach.title}</h5>
                  <p className="text-[10px] text-muted-foreground line-clamp-2 leading-tight mt-0.5">
                    {ach.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal com todas as conquistas */}
      {showAllModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowAllModal(false)} />
          
          <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Trophy size={20} className="text-primary" />
                <h3 className="font-bold text-base text-foreground">Conquistas do Caçador</h3>
              </div>
              <button onClick={() => setShowAllModal(false)} className="p-1 rounded-lg text-muted-foreground hover:bg-secondary">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {achievements.map(ach => (
                <div 
                  key={ach.id} 
                  className={`p-3.5 rounded-xl border flex items-center gap-3.5 ${ach.unlocked ? 'bg-primary/5 border-primary/25' : 'bg-secondary/20 border-border opacity-60'}`}
                >
                  <div className={`p-2.5 rounded-xl shrink-0 ${ach.unlocked ? 'bg-primary/15' : 'bg-secondary'}`}>
                    {ach.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-foreground truncate">{ach.title}</h4>
                      {ach.unlocked && (
                        <span className="text-[10px] text-primary font-semibold flex items-center gap-1">
                          <CheckCircle2 size={12} /> Desbloqueada
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{ach.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default GamificationWidget;
