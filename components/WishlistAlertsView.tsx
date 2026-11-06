'use client';
import React, { useState } from 'react';
import { WishlistAlert } from '../lib/types';
import { Bell, Search, Plus, Trash2, Edit2, Play, Pause, Import, CheckCircle2, TrendingDown, ExternalLink, Loader2 } from 'lucide-react';

interface WishlistAlertsViewProps {
  alerts: WishlistAlert[];
  onNewAlert: () => void;
  onImportSteam: () => void;
  onRefreshAlerts?: () => void;
}

export const WishlistAlertsView: React.FC<WishlistAlertsViewProps> = ({ 
  alerts: initialAlerts, 
  onNewAlert, 
  onImportSteam,
  onRefreshAlerts 
}) => {
  const [alerts, setAlerts] = useState<WishlistAlert[]>(initialAlerts);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'reached'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Estado para edição rápida de preço alvo
  const [editingAlertId, setEditingAlertId] = useState<string | null>(null);
  const [newTargetPrice, setNewTargetPrice] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Sincroniza se o pai enviar nova lista
  React.useEffect(() => {
    setAlerts(initialAlerts);
  }, [initialAlerts]);

  // Contadores dinâmicos
  const activeCount = alerts.filter(a => a.active).length;
  const reachedCount = alerts.filter(a => a.currentPrice > 0 && a.currentPrice <= a.targetPrice).length;

  // Filtragem da lista
  const filteredAlerts = alerts.filter(alert => {
    // Filtro de busca
    if (searchQuery.trim() && !alert.gameName.toLowerCase().includes(searchQuery.toLowerCase().trim())) {
      return false;
    }

    // Filtro por tab
    if (activeTab === 'active') return alert.active;
    if (activeTab === 'reached') return alert.currentPrice > 0 && alert.currentPrice <= alert.targetPrice;
    return true;
  });

  // Ação: Pausar / Retomar Alerta
  const handleToggleAlert = async (alert: WishlistAlert) => {
    const nextStatus = alert.active ? 'PAUSED' : 'ACTIVE';
    setActionLoading(alert.id);

    // Otimista
    setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, active: !a.active } : a));

    try {
      if (alert.id.startsWith('local-')) {
        const local = JSON.parse(localStorage.getItem('gamehunter_local_alerts') || '[]');
        const updated = local.map((a: any) => a.id === alert.id ? { ...a, active: !a.active } : a);
        localStorage.setItem('gamehunter_local_alerts', JSON.stringify(updated));
      } else {
        await fetch('/api/alerts', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: alert.id, status: nextStatus })
        });
      }
    } catch (err) {
      console.error("Failed to toggle alert", err);
      // Reverter se falhar
      setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, active: alert.active } : a));
    } finally {
      setActionLoading(null);
    }
  };

  // Ação: Excluir Alerta
  const handleDeleteAlert = async (alertId: string) => {
    if (!window.confirm('Tem certeza que deseja remover este alerta de monitoramento?')) return;
    
    setActionLoading(alertId);
    // Otimista
    setAlerts(prev => prev.filter(a => a.id !== alertId));

    try {
      if (alertId.startsWith('local-')) {
        const local = JSON.parse(localStorage.getItem('gamehunter_local_alerts') || '[]');
        localStorage.setItem('gamehunter_local_alerts', JSON.stringify(local.filter((a: any) => a.id !== alertId)));
      } else {
        await fetch(`/api/alerts?id=${encodeURIComponent(alertId)}`, {
          method: 'DELETE'
        });
      }
      if (onRefreshAlerts) onRefreshAlerts();
    } catch (err) {
      console.error("Failed to delete alert", err);
    } finally {
      setActionLoading(null);
    }
  };

  // Ação: Salvar Edição do Preço Alvo
  const handleSaveEdit = async (alertId: string) => {
    const parsed = parseFloat(newTargetPrice.replace(',', '.'));
    if (isNaN(parsed) || parsed <= 0) return;

    setActionLoading(alertId);
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, targetPrice: parsed } : a));
    setEditingAlertId(null);

    try {
      if (alertId.startsWith('local-')) {
        const local = JSON.parse(localStorage.getItem('gamehunter_local_alerts') || '[]');
        const updated = local.map((a: any) => a.id === alertId ? { ...a, targetPrice: parsed } : a);
        localStorage.setItem('gamehunter_local_alerts', JSON.stringify(updated));
      } else {
        await fetch('/api/alerts', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: alertId, conditionValue: parsed })
        });
      }
    } catch (err) {
      console.error("Failed to update target price", err);
    } finally {
      setActionLoading(null);
    }
  };

  // Estatística: Economia acumulada potencial
  const estimatedSavings = alerts.reduce((acc, a) => {
    if (a.currentPrice > a.targetPrice) {
      return acc + (a.currentPrice - a.targetPrice);
    }
    return acc;
  }, 0);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2 flex items-center gap-3">
            <Bell className="text-primary" size={30} /> Meus Alertas de Preço
          </h1>
          <p className="text-muted-foreground text-sm">
            O GameHunter monitora lojas oficiais 24 horas por dia e notifica quando o preço atingir sua meta.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <button 
            onClick={onImportSteam} 
            className="btn-secondary flex-1 md:flex-none flex items-center justify-center gap-2 text-xs py-2.5 px-4 font-bold rounded-xl"
          >
            <Import size={16} /> Importar Steam
          </button>
          <button 
            onClick={onNewAlert} 
            className="btn-primary flex-1 md:flex-none shadow-lg shadow-primary/25 flex items-center justify-center gap-2 text-xs py-2.5 px-4 font-bold rounded-xl"
          >
            <Plus size={16} /> Criar Novo Alerta
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Coluna Principal: Lista de Alertas */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Barra de Filtros e Busca */}
          <div className="glass-panel p-2.5 rounded-2xl flex flex-col sm:flex-row justify-between gap-4 border border-border">
            <div className="flex p-1 bg-secondary/50 rounded-xl">
              <button 
                onClick={() => setActiveTab('all')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'all' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Todos ({alerts.length})
              </button>
              <button 
                onClick={() => setActiveTab('active')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'active' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Ativos ({activeCount})
              </button>
              <button 
                onClick={() => setActiveTab('reached')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'reached' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Atingidos ({reachedCount})
              </button>
            </div>

            <div className="relative sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
              <input 
                type="text"
                placeholder="Filtrar por nome do jogo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-secondary/50 border border-border rounded-xl pl-9 pr-4 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Lista de Alertas */}
          <div className="space-y-3.5">
            {filteredAlerts.length === 0 ? (
              <div className="glass-panel rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[340px] border border-border bg-gradient-to-b from-secondary/10 to-transparent">
                <div className="w-16 h-16 bg-primary/10 border border-primary/25 rounded-2xl flex items-center justify-center mb-4 text-primary shadow-[0_0_20px_rgba(34,197,94,0.15)]">
                  <Bell size={28} />
                </div>
                <h3 className="text-xl font-bold mb-1 text-foreground">
                  {searchQuery ? 'Nenhum alerta encontrado para a busca' : 'Nenhum alerta cadastrado nesta categoria'}
                </h3>
                <p className="text-muted-foreground text-xs max-w-sm mx-auto mb-6">
                  {searchQuery ? 'Tente pesquisar por outro termo ou limpe o campo.' : 'Cadastre jogos que você deseja comprar para ser avisado assim que o valor despencar.'}
                </p>
                <div className="flex gap-3">
                  <button onClick={onImportSteam} className="btn-secondary text-xs px-4 py-2 font-bold rounded-xl">
                    Importar da Steam
                  </button>
                  <button onClick={onNewAlert} className="btn-primary text-xs px-4 py-2 font-bold rounded-xl">
                    Criar Primeiro Alerta
                  </button>
                </div>
              </div>
            ) : (
              filteredAlerts.map(alert => {
                const isReached = alert.currentPrice > 0 && alert.currentPrice <= alert.targetPrice;
                const isEditing = editingAlertId === alert.id;
                const isLoadingThis = actionLoading === alert.id;

                return (
                  <div 
                    key={alert.id} 
                    className={`glass-panel rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-5 transition-all border ${isReached ? 'border-primary/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'border-border hover:border-primary/30'} ${!alert.active ? 'opacity-50 grayscale-[0.4]' : ''}`}
                  >
                    <div className="w-full sm:w-28 h-20 bg-secondary rounded-xl overflow-hidden flex-shrink-0 border border-border">
                      <img 
                        src={alert.image || '/placeholder.jpg'} 
                        alt={alert.gameName} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    
                    <div className="flex-1 w-full text-center sm:text-left min-w-0">
                      <h3 className="font-bold text-base text-foreground mb-1 truncate">{alert.gameName}</h3>
                      <div className="flex items-center justify-center sm:justify-start gap-3 text-xs">
                        <span className="text-muted-foreground">Melhor loja: <strong className="text-foreground">{alert.store || 'Steam / Nuuvem'}</strong></span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isReached ? 'bg-success/20 text-success border border-success/30' : alert.active ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-secondary text-muted-foreground border border-border'}`}>
                          {isReached ? 'META ATINGIDA!' : alert.active ? 'MONITORANDO' : 'PAUSADO'}
                        </span>
                      </div>
                    </div>

                    {/* Preços */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto px-2 sm:px-0">
                      <div className="text-center sm:text-right">
                        <div className="text-[11px] font-semibold text-muted-foreground mb-0.5">Preço Alvo</div>
                        {isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <input 
                              type="number"
                              step="0.01"
                              value={newTargetPrice}
                              onChange={(e) => setNewTargetPrice(e.target.value)}
                              className="w-20 bg-secondary border border-primary rounded-lg px-2 py-1 text-xs font-bold text-foreground focus:outline-none"
                              autoFocus
                            />
                            <button 
                              onClick={() => handleSaveEdit(alert.id)}
                              className="btn-primary text-[10px] px-2 py-1 rounded-md font-bold"
                            >
                              OK
                            </button>
                            <button 
                              onClick={() => setEditingAlertId(null)}
                              className="text-[10px] text-muted-foreground hover:text-foreground"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="font-bold text-primary font-mono text-sm">
                            R$ {alert.targetPrice.toFixed(2).replace('.', ',')}
                          </div>
                        )}
                      </div>
                      
                      <div className="w-px h-8 bg-border hidden sm:block" />
                      
                      <div className="text-center sm:text-right">
                        <div className="text-[11px] font-semibold text-muted-foreground mb-0.5">Menor Atual</div>
                        <div className={`font-bold font-mono text-sm ${isReached ? 'text-success' : 'text-foreground'}`}>
                          {alert.currentPrice > 0 ? `R$ ${alert.currentPrice.toFixed(2).replace('.', ',')}` : 'Consultando'}
                        </div>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex sm:flex-col gap-1.5 w-full sm:w-auto justify-center pt-3 sm:pt-0 border-t sm:border-t-0 border-border">
                      <button 
                        onClick={() => {
                          setEditingAlertId(alert.id);
                          setNewTargetPrice(alert.targetPrice.toFixed(2));
                        }}
                        className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" 
                        title="Ajustar Preço Alvo"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleToggleAlert(alert)}
                        disabled={isLoadingThis}
                        className={`p-2 rounded-lg transition-colors ${alert.active ? 'text-muted-foreground hover:text-warning hover:bg-warning/10' : 'text-primary hover:bg-primary/10'}`} 
                        title={alert.active ? "Pausar Alerta" : "Retomar Monitoramento"}
                      >
                        {isLoadingThis ? <Loader2 size={16} className="animate-spin" /> : alert.active ? <Pause size={16} /> : <Play size={16} />}
                      </button>
                      <button 
                        onClick={() => handleDeleteAlert(alert.id)}
                        disabled={isLoadingThis}
                        className="p-2 rounded-lg hover:bg-danger/10 hover:text-danger text-muted-foreground transition-colors" 
                        title="Excluir Alerta"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Sidebar com Estatísticas Dinâmicas */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-border text-center">
            <div className="p-3 bg-primary/10 rounded-2xl w-fit mx-auto text-primary mb-3">
              <Import size={24} />
            </div>
            <h3 className="font-bold text-base mb-1 text-foreground">Importar Wishlist</h3>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              Puxe seus jogos da Steam e monitore automaticamente sem cadastrar manualmente.
            </p>
            <button 
              onClick={onImportSteam} 
              className="w-full btn-outline text-xs py-2.5 rounded-xl font-bold"
            >
              Conectar com a Steam
            </button>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-border">
            <h3 className="font-bold mb-4 text-xs uppercase tracking-wider text-muted-foreground">
              Métricas dos Seus Alertas
            </h3>
            <div className="space-y-3.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Alertas Ativos</span>
                <span className="font-bold font-mono text-foreground">{activeCount} de {alerts.length}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Metas Atingidas</span>
                <span className="font-bold font-mono text-success flex items-center gap-1">
                  <CheckCircle2 size={13} /> {reachedCount}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs pt-2 border-t border-border">
                <span className="text-muted-foreground">Economia Prevista</span>
                <span className="font-bold font-mono text-primary text-sm">
                  R$ {estimatedSavings.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
export default WishlistAlertsView;
