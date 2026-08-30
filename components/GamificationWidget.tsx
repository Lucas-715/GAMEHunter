'use client';
import React from 'react';
import { Trophy, Star, Target, Zap, Shield, Crown } from 'lucide-react';

export const GamificationWidget: React.FC = () => {
  // Mock data for user progression
  const currentLevel = 14;
  const currentXP = 2450;
  const nextLevelXP = 3000;
  const progressPercent = (currentXP / nextLevelXP) * 100;

  const achievements = [
    { id: 1, title: 'Primeira Caçada', description: 'Encontrou o primeiro desconto de 50%+', icon: <Target className="text-blue-500" size={24} />, unlocked: true },
    { id: 2, title: 'Caçador Frequente', description: 'Ativou 10 alertas de preços', icon: <BellRing className="text-yellow-500" size={24} />, unlocked: true },
    { id: 3, title: 'Mestre da Economia', description: 'Economizou mais de R$ 500', icon: <Crown className="text-purple-500" size={24} />, unlocked: false },
    { id: 4, title: 'Reflexo Rápido', description: 'Comprou em menos de 10 min do alerta', icon: <Zap className="text-orange-500" size={24} />, unlocked: false },
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-5">
      {/* Level & XP Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-primary/10 border-2 border-primary rounded-full flex items-center justify-center flex-shrink-0 relative">
          <Trophy className="text-primary" size={24} />
          <div className="absolute -bottom-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
            Lv. {currentLevel}
          </div>
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-end mb-2">
            <h3 className="font-bold">Progresso do Caçador</h3>
            <span className="text-xs font-medium text-muted-foreground">
              {currentXP} / {nextLevelXP} XP
            </span>
          </div>
          <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full transition-all duration-1000 ease-out relative"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Badges / Achievements */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Star size={16} className="text-yellow-500 fill-yellow-500" />
            Conquistas Recentes
          </h4>
          <span className="text-xs text-primary font-medium cursor-pointer hover:underline">Ver todas</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {achievements.map(ach => (
            <div 
              key={ach.id} 
              className={`p-3 rounded-lg border flex gap-3 ${ach.unlocked ? 'bg-background border-primary/20' : 'bg-secondary/50 border-border opacity-60 grayscale'}`}
            >
              <div className={`p-2 rounded-md ${ach.unlocked ? 'bg-primary/10' : 'bg-background'}`}>
                {ach.icon}
              </div>
              <div>
                <h5 className="text-xs font-bold truncate" title={ach.title}>{ach.title}</h5>
                <p className="text-[10px] text-muted-foreground line-clamp-2 leading-tight mt-0.5">
                  {ach.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
// Add this import that was missing in the mocked achievements array above
import { BellRing } from 'lucide-react';
