'use client';
import React, { useState } from 'react';
import { WishlistAlert } from '../lib/types';
import { Bell, Search, Filter, Plus, Trash2, Edit2, Play, Pause, Import } from 'lucide-react';

interface WishlistAlertsViewProps {
  alerts: WishlistAlert[];
  onNewAlert: () => void;
  onImportSteam: () => void;
}

export const WishlistAlertsView: React.FC<WishlistAlertsViewProps> = ({ alerts, onNewAlert, onImportSteam }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'reached'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
            <Bell className="text-primary" size={32} /> Meus Alertas
          </h1>
          <p className="text-muted-foreground">Acompanhe preços e seja notificado quando chegarem ao seu alvo.</p>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <button onClick={onImportSteam} className="btn-secondary flex-1 md:flex-none flex items-center justify-center gap-2">
            <Import size={18} /> Importar Steam
          </button>
          <button onClick={onNewAlert} className="btn-primary flex-1 md:flex-none shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
            <Plus size={18} /> Novo Alerta
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Controls Bar */}
          <div className="glass-panel p-2 rounded-xl flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex p-1 bg-secondary/50 rounded-lg">
              <button 
                onClick={() => setActiveTab('all')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'all' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Todos ({alerts.length})
              </button>
              <button 
                onClick={() => setActiveTab('active')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'active' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Ativos (2)
              </button>
              <button 
                onClick={() => setActiveTab('reached')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'reached' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Atingidos (0)
              </button>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <input 
                  type="text"
                  placeholder="Filtrar alertas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <button className="p-2 border border-border rounded-lg bg-background hover:bg-secondary transition-colors text-muted-foreground">
                <Filter size={18} />
              </button>
            </div>
          </div>

          {/* Alerts List */}
          <div className="space-y-4">
            {alerts.length === 0 ? (
              <div className="glass-panel rounded-2xl p-16 text-center flex flex-col items-center justify-center min-h-[400px] border border-white/5 bg-gradient-to-b from-white/5 to-transparent relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background/0 to-background/0" />
                
                <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
                  <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-50" />
                  <div className="relative w-20 h-20 bg-background border border-white/10 rounded-full flex items-center justify-center shadow-2xl shadow-primary/20">
                    <Bell size={40} className="text-primary" />
                  </div>
                </div>

                <h3 className="text-2xl font-bold mb-3 tracking-tight">Sua lista está vazia</h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto text-lg">
                  Crie alertas para seus jogos favoritos e avisaremos imediatamente quando o preço cair para o valor desejado.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                  <button onClick={onImportSteam} className="btn-secondary px-6 py-3 flex items-center justify-center gap-2">
                    <Import size={18} /> Importar da Steam
                  </button>
                  <button onClick={onNewAlert} className="btn-primary px-6 py-3 shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-transform hover:scale-105">
                    <Plus size={18} /> Criar Primeiro Alerta
                  </button>
                </div>
              </div>
            ) : (
              alerts.map(alert => {
                const diff = alert.currentPrice - alert.targetPrice;
                const isClose = diff > 0 && diff <= 20;

                return (
                  <div key={alert.id} className={`glass-panel rounded-xl p-4 flex flex-col sm:flex-row items-center gap-6 transition-all hover:border-primary/30 ${!alert.active ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                    <div className="w-full sm:w-32 h-20 bg-secondary rounded-lg overflow-hidden flex-shrink-0">
                      <img src={alert.image} alt={alert.gameName} className="w-full h-full object-cover" />
                    </div>
                    
                    <div className="flex-1 w-full text-center sm:text-left">
                      <h3 className="font-bold text-lg mb-1">{alert.gameName}</h3>
                      <div className="flex items-center justify-center sm:justify-start gap-4 text-sm">
                        <span className="text-muted-foreground">Loja: <strong className="text-foreground">{alert.store}</strong></span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${alert.active ? 'bg-success/10 text-success border border-success/20' : 'bg-secondary text-muted-foreground border border-border'}`}>
                          {alert.active ? 'Monitorando' : 'Pausado'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-8 w-full sm:w-auto px-4 sm:px-0">
                      <div className="text-center sm:text-right">
                        <div className="text-xs text-muted-foreground mb-1">Preço Alvo</div>
                        <div className="font-bold text-primary">R$ {alert.targetPrice.toFixed(2).replace('.', ',')}</div>
                      </div>
                      
                      <div className="w-px h-10 bg-border hidden sm:block"></div>
                      
                      <div className="text-center sm:text-right">
                        <div className="text-xs text-muted-foreground mb-1">Atual</div>
                        <div className={`font-bold ${isClose ? 'text-warning' : ''}`}>R$ {alert.currentPrice.toFixed(2).replace('.', ',')}</div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col gap-2 w-full sm:w-auto justify-center mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-border">
                      <button className="p-2 rounded-md hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground" title="Editar">
                        <Edit2 size={18} />
                      </button>
                      <button className="p-2 rounded-md hover:bg-secondary transition-colors text-muted-foreground" title={alert.active ? "Pausar" : "Retomar"}>
                        {alert.active ? <Pause size={18} /> : <Play size={18} />}
                      </button>
                      <button className="p-2 rounded-md hover:bg-danger/10 hover:text-danger transition-colors text-muted-foreground" title="Excluir">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-xl text-center">
            <h3 className="font-semibold mb-2">Importação Fácil</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Sincronize sua Wishlist da Steam e nós criamos os alertas automaticamente.
            </p>
            <button onClick={onImportSteam} className="w-full btn-outline text-sm">
              Conectar Steam
            </button>
          </div>

          <div className="glass-panel p-6 rounded-xl">
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Estatísticas</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Alertas Criados</span>
                <span className="font-bold">{alerts.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Promoções Atingidas</span>
                <span className="font-bold text-success">14</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Economia Estimada</span>
                <span className="font-bold text-primary">R$ 450,00</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
