'use client';
import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Star,
  Target,
  Zap,
  Crown,
  BellRing,
  X,
  Award,
  CheckCircle2,
  Sparkles,
  Flame,
  Gift,
  Copy,
  Check,
  ChevronRight,
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  unlocked: boolean;
  claimed: boolean;
  progress: number;
  maxProgress: number;
  date?: string;
  iconType: 'target' | 'bell' | 'crown' | 'zap' | 'award' | 'flame';
}

interface DailyMission {
  id: string;
  title: string;
  xp: number;
  completed: boolean;
}

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_hunt',
    title: 'Primeira Caçada',
    description: 'Encontrou o primeiro desconto de 50% ou mais no radar',
    xpReward: 200,
    unlocked: true,
    claimed: false,
    progress: 1,
    maxProgress: 1,
    date: 'Desbloqueada',
    iconType: 'target',
  },
  {
    id: 'night_watcher',
    title: 'Vigilante Noturno',
    description: 'Ativou alertas de preços em lojas oficiais',
    xpReward: 250,
    unlocked: true,
    claimed: false,
    progress: 10,
    maxProgress: 10,
    date: 'Desbloqueada',
    iconType: 'bell',
  },
  {
    id: 'economy_master',
    title: 'Mestre da Economia',
    description: 'Economizou mais de R$ 500 em ofertas rastreadas',
    xpReward: 300,
    unlocked: true,
    claimed: false,
    progress: 500,
    maxProgress: 500,
    date: 'Desbloqueada',
    iconType: 'crown',
  },
  {
    id: 'fast_trigger',
    title: 'Gatilho Rápido',
    description: 'Adicionou uma Key em oferta ao carrinho ou comparou lojas',
    xpReward: 350,
    unlocked: false,
    claimed: false,
    progress: 0,
    maxProgress: 1,
    iconType: 'zap',
  },
  {
    id: 'free_collector',
    title: 'Colecionador Grátis',
    description: 'Resgatou jogos gratuitos da semana promovidos na plataforma',
    xpReward: 400,
    unlocked: false,
    claimed: false,
    progress: 1,
    maxProgress: 2,
    iconType: 'award',
  },
];

const DEFAULT_MISSIONS: DailyMission[] = [
  { id: 'daily_checkin', title: 'Check-in Diário no Radar GameHunter', xp: 150, completed: false },
  { id: 'inspect_deal', title: 'Analisar 1 oferta com Score Hunter 80+', xp: 200, completed: false },
  { id: 'test_alert', title: 'Configurar ou revisar um Alerta de Preço', xp: 250, completed: false },
];

export const GamificationWidget: React.FC = () => {
  const [showAllModal, setShowAllModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'achievements' | 'missions' | 'rewards'>('achievements');
  const [totalXP, setTotalXP] = useState(2450);
  const [achievements, setAchievements] = useState<Achievement[]>(DEFAULT_ACHIEVEMENTS);
  const [missions, setMissions] = useState<DailyMission[]>(DEFAULT_MISSIONS);
  const [xpToast, setXpToast] = useState<string | null>(null);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  // Carrega progresso salvo do usuário
  useEffect(() => {
    try {
      const savedXP = localStorage.getItem('gh_hunter_xp');
      const savedAch = localStorage.getItem('gh_hunter_achievements');
      const savedMissions = localStorage.getItem('gh_hunter_missions');

      if (savedXP) setTotalXP(Number(savedXP));
      if (savedAch) setAchievements(JSON.parse(savedAch));
      if (savedMissions) setMissions(JSON.parse(savedMissions));
    } catch {
      // fallback padrão
    }
  }, []);

  const triggerXpGain = (amount: number, label: string) => {
    setTotalXP((prev) => {
      const updated = prev + amount;
      localStorage.setItem('gh_hunter_xp', String(updated));
      return updated;
    });
    setXpToast(`+${amount} XP • ${label}`);
    setTimeout(() => setXpToast(null), 3200);
  };

  // Escuta eventos globais do sistema (ex: adicionar ao carrinho, resgatar jogo grátis, criar alerta)
  useEffect(() => {
    const handleGlobalXp = (event: Event) => {
      const custom = event as CustomEvent<{ amount?: number; reason?: string; achievementId?: string }>;
      const amount = custom.detail?.amount || 100;
      const reason = custom.detail?.reason || 'Ação de Caçador';
      const achId = custom.detail?.achievementId;

      triggerXpGain(amount, reason);

      if (achId) {
        setAchievements((prev) => {
          const updated = prev.map((a) =>
            a.id === achId
              ? { ...a, unlocked: true, progress: a.maxProgress, date: 'Hoje' }
              : a
          );
          localStorage.setItem('gh_hunter_achievements', JSON.stringify(updated));
          return updated;
        });
      }
    };

    window.addEventListener('gamehunter:xp', handleGlobalXp);
    return () => window.removeEventListener('gamehunter:xp', handleGlobalXp);
  }, []);

  // Cálculo dinâmico de Nível (500 XP por nível a partir da base)
  const currentLevel = Math.floor(totalXP / 200) + 2;
  const levelStartXP = (currentLevel - 2) * 200;
  const nextLevelXP = (currentLevel - 1) * 200;
  const xpInCurrentLevel = totalXP - levelStartXP;
  const xpRequiredForLevel = nextLevelXP - levelStartXP;
  const progressPercent = Math.min(100, Math.max(8, Math.round((xpInCurrentLevel / xpRequiredForLevel) * 100)));

  const getRankTitle = (lvl: number) => {
    if (lvl >= 18) return 'Lenda Cósmica';
    if (lvl >= 15) return 'Predador Esmeralda';
    if (lvl >= 12) return 'Caçador de Elite';
    return 'Rastreador de Ofertas';
  };

  const renderIcon = (type: Achievement['iconType']) => {
    switch (type) {
      case 'target':
        return <Target className="text-blue-400" size={20} />;
      case 'bell':
        return <BellRing className="text-yellow-400" size={20} />;
      case 'crown':
        return <Crown className="text-purple-400" size={20} />;
      case 'zap':
        return <Zap className="text-orange-400" size={20} />;
      case 'award':
        return <Award className="text-emerald-400" size={20} />;
      default:
        return <Flame className="text-primary" size={20} />;
    }
  };

  const handleClaimAchievement = (id: string) => {
    const target = achievements.find((a) => a.id === id);
    if (!target) return;

    if (!target.unlocked) {
      // Permite desbloquear/progredir interativamente
      const updated = achievements.map((a) =>
        a.id === id
          ? { ...a, unlocked: true, progress: a.maxProgress, date: 'Agora' }
          : a
      );
      setAchievements(updated);
      localStorage.setItem('gh_hunter_achievements', JSON.stringify(updated));
      triggerXpGain(target.xpReward, `Conquista: ${target.title}`);
      return;
    }

    if (!target.claimed) {
      const updated = achievements.map((a) =>
        a.id === id ? { ...a, claimed: true } : a
      );
      setAchievements(updated);
      localStorage.setItem('gh_hunter_achievements', JSON.stringify(updated));
      triggerXpGain(target.xpReward, `Bônus: ${target.title}`);
    }
  };

  const handleCompleteMission = (id: string) => {
    const mission = missions.find((m) => m.id === id);
    if (!mission || mission.completed) return;

    const updated = missions.map((m) =>
      m.id === id ? { ...m, completed: true } : m
    );
    setMissions(updated);
    localStorage.setItem('gh_hunter_missions', JSON.stringify(updated));
    triggerXpGain(mission.xp, mission.title);
  };

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2000);
  };

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const unclaimedCount = achievements.filter((a) => a.unlocked && !a.claimed).length;
  const pendingMissionsCount = missions.filter((m) => !m.completed).length;

  return (
    <>
      <div className="glass-panel border border-border rounded-2xl p-5 shadow-sm space-y-5 relative overflow-hidden">
        {/* Notificação flutuante de ganho de XP */}
        {xpToast && (
          <div className="bg-primary/20 border border-primary/40 text-primary px-3 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200">
            <span className="flex items-center gap-1.5">
              <Sparkles size={14} /> {xpToast}
            </span>
            <span className="font-mono text-[10px] uppercase">Subindo Rank!</span>
          </div>
        )}

        {/* Level & XP Header (Clicável para abrir painel do Rank) */}
        <div
          onClick={() => {
            setActiveTab('missions');
            setShowAllModal(true);
          }}
          className="flex items-center gap-4 cursor-pointer group"
          title="Clique para abrir Missões, Conquistas e Recompensas do Caçador"
        >
          <div className="w-14 h-14 bg-primary/10 border-2 border-primary rounded-2xl flex items-center justify-center flex-shrink-0 relative shadow-[0_0_15px_rgba(34,197,94,0.25)] group-hover:scale-105 transition-transform">
            <Trophy className="text-primary" size={24} />
            <div className="absolute -bottom-2 bg-primary text-primary-foreground text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
              Nv. {currentLevel}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-end mb-1">
              <div>
                <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                  Rank de Caçador
                  <ChevronRight size={14} className="text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </h3>
                <p className="text-[10px] text-primary font-semibold">{getRankTitle(currentLevel)}</p>
              </div>
              <span className="text-[11px] font-mono text-muted-foreground">
                {totalXP} / {nextLevelXP} XP
              </span>
            </div>
            <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(34,197,94,0.6)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Botão Rápido de Check-in / Missão Diária */}
        {pendingMissionsCount > 0 && (
          <div className="flex items-center justify-between bg-secondary/40 border border-primary/20 rounded-xl px-3.5 py-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <Flame size={16} className="text-primary shrink-0 animate-pulse" />
              <span className="text-xs font-medium text-foreground truncate">
                {missions.find((m) => !m.completed)?.title}
              </span>
            </div>
            <button
              onClick={() => {
                const nextMission = missions.find((m) => !m.completed);
                if (nextMission) handleCompleteMission(nextMission.id);
              }}
              className="ml-2 shrink-0 px-2.5 py-1 rounded-lg bg-primary text-primary-foreground font-bold text-[11px] hover:bg-primary/90 transition-all shadow-sm"
            >
              +{missions.find((m) => !m.completed)?.xp} XP
            </button>
          </div>
        )}

        {/* Conquistas Recentes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Star size={14} className="text-yellow-500 fill-yellow-500" />
              Conquistas
              {unclaimedCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-primary/20 text-primary rounded-full text-[10px] font-mono">
                  {unclaimedCount} bônus
                </span>
              )}
            </h4>
            <button
              onClick={() => {
                setActiveTab('achievements');
                setShowAllModal(true);
              }}
              className="text-xs text-primary font-bold hover:underline cursor-pointer"
            >
              Ver todas ({unlockedCount}/{achievements.length})
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {achievements.slice(0, 2).map((ach) => (
              <button
                key={ach.id}
                type="button"
                onClick={() => {
                  if (!ach.claimed) {
                    handleClaimAchievement(ach.id);
                  } else {
                    setActiveTab('achievements');
                    setShowAllModal(true);
                  }
                }}
                className={`p-3 rounded-xl border flex gap-2.5 text-left transition-all cursor-pointer hover:border-primary/50 hover:bg-secondary/50 ${
                  ach.unlocked
                    ? 'bg-secondary/30 border-primary/20'
                    : 'bg-secondary/20 border-border opacity-60'
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 h-fit ${ach.unlocked ? 'bg-primary/10' : 'bg-secondary'}`}>
                  {renderIcon(ach.iconType)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h5 className="text-xs font-bold truncate text-foreground" title={ach.title}>
                      {ach.title}
                    </h5>
                  </div>
                  <p className="text-[10px] text-muted-foreground line-clamp-2 leading-tight mt-0.5">
                    {ach.description}
                  </p>
                  <span className="inline-block mt-1.5 text-[10px] font-bold text-primary">
                    {ach.claimed ? '✓ Resgatado' : `Resgatar +${ach.xpReward} XP`}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Completo do Rank de Caçador (Conquistas, Missões e Recompensas) */}
      {showAllModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowAllModal(false)}
          />

          <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200 space-y-5">
            {/* Cabeçalho do Modal */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/15 text-primary border border-primary/30">
                  <Trophy size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-foreground">Central do Rank de Caçador</h3>
                    <span className="px-2 py-0.5 text-[10px] font-black bg-primary text-primary-foreground rounded-full">
                      NV. {currentLevel}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Patente atual: <strong className="text-primary">{getRankTitle(currentLevel)}</strong> ({totalXP} XP acumulados)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAllModal(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Navegação de Abas */}
            <div className="grid grid-cols-3 gap-2 bg-secondary/40 p-1 rounded-xl border border-border">
              <button
                onClick={() => setActiveTab('achievements')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'achievements'
                    ? 'bg-primary text-primary-foreground shadow'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Conquistas ({unlockedCount}/{achievements.length})
              </button>
              <button
                onClick={() => setActiveTab('missions')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'missions'
                    ? 'bg-primary text-primary-foreground shadow'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Missões (+XP)
              </button>
              <button
                onClick={() => setActiveTab('rewards')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'rewards'
                    ? 'bg-primary text-primary-foreground shadow'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Recompensas VIP
              </button>
            </div>

            {/* ABA 1: CONQUISTAS */}
            {activeTab === 'achievements' && (
              <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
                {achievements.map((ach) => (
                  <div
                    key={ach.id}
                    className={`p-3.5 rounded-xl border flex items-center gap-3.5 transition-all ${
                      ach.unlocked
                        ? 'bg-primary/5 border-primary/25'
                        : 'bg-secondary/20 border-border'
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-xl shrink-0 ${
                        ach.unlocked ? 'bg-primary/15' : 'bg-secondary'
                      }`}
                    >
                      {renderIcon(ach.iconType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-xs text-foreground truncate">{ach.title}</h4>
                        {ach.unlocked ? (
                          <span className="text-[10px] text-primary font-semibold flex items-center gap-1 shrink-0">
                            <CheckCircle2 size={12} /> Desbloqueada
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                            {ach.progress}/{ach.maxProgress}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                        {ach.description}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-primary font-bold">
                          Recompensa: +{ach.xpReward} XP
                        </span>
                        {ach.unlocked ? (
                          <button
                            disabled={ach.claimed}
                            onClick={() => handleClaimAchievement(ach.id)}
                            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                              ach.claimed
                                ? 'bg-secondary text-muted-foreground cursor-default'
                                : 'bg-primary text-primary-foreground hover:bg-primary/90'
                            }`}
                          >
                            {ach.claimed ? 'XP Resgatado ✓' : `Resgatar +${ach.xpReward} XP`}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleClaimAchievement(ach.id)}
                            className="px-3 py-1 rounded-lg text-[11px] font-bold bg-secondary hover:bg-primary hover:text-primary-foreground text-foreground transition-all"
                          >
                            Completar Agora (+{ach.xpReward} XP)
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ABA 2: MISSÕES DIÁRIAS */}
            {activeTab === 'missions' && (
              <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
                <p className="text-xs text-muted-foreground">
                  Complete as tarefas de monitoramento para subir seu nível de Caçador e liberar cupons maiores na loja de Keys:
                </p>
                {missions.map((m) => (
                  <div
                    key={m.id}
                    className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
                      m.completed
                        ? 'bg-primary/5 border-primary/25'
                        : 'bg-secondary/30 border-border'
                    }`}
                  >
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-foreground">{m.title}</h4>
                      <span className="inline-block text-[11px] font-mono text-primary font-bold">
                        +{m.xp} XP de Caçador
                      </span>
                    </div>
                    <button
                      disabled={m.completed}
                      onClick={() => handleCompleteMission(m.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                        m.completed
                          ? 'bg-primary/20 text-primary cursor-default'
                          : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md'
                      }`}
                    >
                      {m.completed ? 'Concluída ✓' : 'Concluir Missão'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* ABA 3: RECOMPENSAS & CUPONS VIP */}
            {activeTab === 'rewards' && (
              <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
                <p className="text-xs text-muted-foreground">
                  Seu nível de Caçador libera cupons exclusivos para usar no Carrinho de Keys do GameHunter:
                </p>

                {[
                  {
                    code: 'HUNTER10',
                    discount: '10% OFF em qualquer Key',
                    reqLevel: 5,
                    desc: 'Liberado para Rastreadores Nv. 5+',
                  },
                  {
                    code: 'HUNTER20',
                    discount: '20% OFF em qualquer Key',
                    reqLevel: 12,
                    desc: 'Liberado para Caçadores de Elite Nv. 12+',
                  },
                  {
                    code: 'HUNTER25',
                    discount: '25% OFF VIP Predador Esmeralda',
                    reqLevel: 15,
                    desc: 'Liberado ao atingir o Nível 15 no Rank de Caçador',
                  },
                ].map((reward) => {
                  const isUnlocked = currentLevel >= reward.reqLevel;
                  return (
                    <div
                      key={reward.code}
                      className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
                        isUnlocked
                          ? 'bg-primary/10 border-primary/30'
                          : 'bg-secondary/20 border-border opacity-60'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Gift size={15} className="text-primary" />
                          <span className="font-bold text-xs text-foreground">{reward.discount}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">{reward.desc}</p>
                      </div>

                      {isUnlocked ? (
                        <button
                          onClick={() => handleCopyCoupon(reward.code)}
                          className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-mono text-xs font-bold flex items-center gap-1.5 hover:bg-primary/90 transition-all shrink-0"
                        >
                          {copiedCoupon === reward.code ? (
                            <>
                              <Check size={13} /> Copiado!
                            </>
                          ) : (
                            <>
                              <Copy size={13} /> {reward.code}
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg bg-secondary text-muted-foreground text-[11px] font-mono shrink-0">
                          Requer Nv. {reward.reqLevel}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
export default GamificationWidget;
