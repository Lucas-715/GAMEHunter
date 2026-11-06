'use client';
import React, { useState } from 'react';
import { X, User, Settings, LogOut, Link2, BellRing, Loader2, Check, Globe, Shield, RefreshCw } from 'lucide-react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Logo } from './Logo';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { data: session, status } = useSession();
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Sub-abas quando logado
  const [activeTab, setActiveTab] = useState<'main' | 'settings' | 'notifications' | 'stores'>('main');

  // Estados reais de preferências do usuário
  const [currency, setCurrency] = useState('BRL');
  const [region, setRegion] = useState('BR');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [freeGamesAlerts, setFreeGamesAlerts] = useState(true);
  const [connectedStores, setConnectedStores] = useState<Record<string, boolean>>({
    steam: true,
    epic: false,
    nuuvem: true,
  });
  const [savedFeedback, setSavedFeedback] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isLoginView) {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        onClose();
      }
    } else {
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          setError(data.message || 'Erro ao criar conta');
        } else {
          const loginRes = await signIn('credentials', {
            email,
            password,
            redirect: false,
          });
          if (!loginRes?.error) {
            onClose();
          }
        }
      } catch (err) {
        setError('Erro ao criar conta');
      }
    }
    setLoading(false);
  };

  const handleSavePreferences = () => {
    setSavedFeedback(true);
    setTimeout(() => {
      setSavedFeedback(false);
      setActiveTab('main');
    }, 1200);
  };

  const toggleStore = (storeKey: string) => {
    setConnectedStores(prev => ({
      ...prev,
      [storeKey]: !prev[storeKey]
    }));
  };

  if (status === 'loading') {
    return null;
  }

  // Usuário deslogado: Login / Registro
  if (!session) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden p-8">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>

          <div className="flex flex-col items-center mb-6 text-center">
            <Logo size={52} className="mb-3" />
            <h2 className="text-2xl font-black tracking-tight text-foreground">
              {isLoginView ? 'Acessar GameHunter' : 'Criar Nova Conta'}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {isLoginView ? 'Monitore preços e sincronize seus alertas' : 'Junte-se à caçada por jogos no menor preço histórico'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLoginView && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Nome Gamer</label>
                <input 
                  type="text" 
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-secondary/60 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 text-foreground"
                  placeholder="Seu nickname ou nome"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">E-mail</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-secondary/60 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 text-foreground"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Senha</label>
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-secondary/60 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 text-foreground"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 bg-danger/10 border border-danger/30 text-danger rounded-xl text-xs font-semibold">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/25 mt-2"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : (isLoginView ? 'Entrar na Conta' : 'Concluir Cadastro')}
            </button>
          </form>

          {isLoginView && (
            <div className="mt-4 pt-4 border-t border-border space-y-2">
              <button
                type="button"
                disabled={loading}
                onClick={async () => {
                  setLoading(true);
                  setError('');
                  const res = await signIn('credentials', {
                    email: 'demo@gamehunter.com',
                    password: '123456',
                    redirect: false,
                  });
                  setLoading(false);
                  if (!res?.error) onClose();
                }}
                className="w-full btn-secondary py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-primary/30 text-primary hover:bg-primary/10"
              >
                ⚡ Entrar com Conta Demo (1 Clique)
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Continuar sem login (Modo Visitante)
              </button>
            </div>
          )}

          <div className="mt-4 text-center text-xs">
            <span className="text-muted-foreground">
              {isLoginView ? 'Não possui conta ainda?' : 'Já possui cadastro?'}
            </span>
            <button 
              onClick={() => { setIsLoginView(!isLoginView); setError(''); }} 
              className="ml-2 text-primary font-bold hover:underline"
            >
              {isLoginView ? 'Criar conta grátis' : 'Fazer login'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Usuário Logado
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        
        {/* Header com Capa */}
        <div className="h-24 bg-gradient-to-r from-primary/25 via-emerald-900/30 to-blue-900/30 relative flex items-center justify-between px-6 border-b border-border">
          <div className="flex items-center gap-2 text-primary">
            <Logo size={24} />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">Perfil do Caçador</span>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg bg-black/40 text-white hover:bg-black/60 transition-colors backdrop-blur-sm"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 pb-6 relative">
          {/* Avatar & Detalhes Principais */}
          <div className="w-16 h-16 bg-card border-2 border-primary rounded-2xl flex items-center justify-center absolute -top-8 shadow-xl text-primary font-black text-2xl">
            {session.user?.name?.[0]?.toUpperCase() || 'H'}
          </div>
          
          <div className="mt-10 flex justify-between items-start">
            <div>
              <h2 className="text-lg font-bold text-foreground">{session.user?.name || 'Caçador de Ofertas'}</h2>
              <p className="text-xs text-muted-foreground">{session.user?.email}</p>
            </div>
            <span className="px-2.5 py-1 bg-primary/10 text-primary border border-primary/25 rounded-full text-[10px] font-bold uppercase tracking-wider">
              Plano Hunter Free
            </span>
          </div>

          {/* Abas Internas */}
          {activeTab === 'main' && (
            <div className="mt-6 space-y-2 animate-in fade-in">
              <button 
                onClick={() => setActiveTab('settings')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-secondary/30 hover:bg-secondary/60 border border-border transition-colors text-sm font-medium text-foreground text-left"
              >
                <div className="flex items-center gap-3">
                  <Settings size={18} className="text-primary" />
                  <span>Configurações Regionais</span>
                </div>
                <span className="text-xs text-muted-foreground">{currency} • {region}</span>
              </button>

              <button 
                onClick={() => setActiveTab('notifications')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-secondary/30 hover:bg-secondary/60 border border-border transition-colors text-sm font-medium text-foreground text-left"
              >
                <div className="flex items-center gap-3">
                  <BellRing size={18} className="text-primary" />
                  <span>Preferências de Notificação</span>
                </div>
                <span className="text-xs text-primary font-semibold">Ativo</span>
              </button>

              <button 
                onClick={() => setActiveTab('stores')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-secondary/30 hover:bg-secondary/60 border border-border transition-colors text-sm font-medium text-foreground text-left"
              >
                <div className="flex items-center gap-3">
                  <Link2 size={18} className="text-primary" />
                  <span>Lojas Conectadas</span>
                </div>
                <span className="text-xs text-muted-foreground">Steam • Nuuvem</span>
              </button>
            </div>
          )}

          {/* Subtela: Configurações Regionais */}
          {activeTab === 'settings' && (
            <div className="mt-6 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-sm font-bold text-foreground">Região & Moeda</span>
                <button onClick={() => setActiveTab('main')} className="text-xs text-primary hover:underline">Voltar</button>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Moeda Principal</label>
                <select 
                  value={currency} 
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-secondary/60 border border-border rounded-xl p-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="BRL">R$ Real Brasileiro (BRL)</option>
                  <option value="USD">$ Dólar Americano (USD)</option>
                  <option value="EUR">€ Euro (EUR)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Região Padrão</label>
                <select 
                  value={region} 
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full bg-secondary/60 border border-border rounded-xl p-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="BR">Brasil (Lojas Nacionais)</option>
                  <option value="US">Estados Unidos</option>
                  <option value="GL">Global</option>
                </select>
              </div>

              <button 
                onClick={handleSavePreferences}
                className="w-full btn-primary py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
              >
                {savedFeedback ? <Check size={16} /> : 'Salvar Preferências'}
              </button>
            </div>
          )}

          {/* Subtela: Notificações */}
          {activeTab === 'notifications' && (
            <div className="mt-6 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-sm font-bold text-foreground">Notificações</span>
                <button onClick={() => setActiveTab('main')} className="text-xs text-primary hover:underline">Voltar</button>
              </div>

              <label className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border cursor-pointer">
                <div className="text-xs">
                  <div className="font-bold text-foreground">Alerta de Preço Alvo</div>
                  <div className="text-muted-foreground text-[11px]">Enviar e-mail imediatamente quando atingir a meta</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={emailAlerts} 
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="rounded accent-primary w-4 h-4 cursor-pointer" 
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border cursor-pointer">
                <div className="text-xs">
                  <div className="font-bold text-foreground">Mínimo Histórico</div>
                  <div className="text-muted-foreground text-[11px]">Notificar quando um jogo da wishlist bater recorde histórico</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={pushAlerts} 
                  onChange={(e) => setPushAlerts(e.target.checked)}
                  className="rounded accent-primary w-4 h-4 cursor-pointer" 
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border cursor-pointer">
                <div className="text-xs">
                  <div className="font-bold text-foreground">Jogos Grátis Semanais</div>
                  <div className="text-muted-foreground text-[11px]">Aviso semanal com os jogos grátis da Epic e Steam</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={freeGamesAlerts} 
                  onChange={(e) => setFreeGamesAlerts(e.target.checked)}
                  className="rounded accent-primary w-4 h-4 cursor-pointer" 
                />
              </label>

              <button 
                onClick={handleSavePreferences}
                className="w-full btn-primary py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 mt-2"
              >
                {savedFeedback ? <Check size={16} /> : 'Salvar Alterações'}
              </button>
            </div>
          )}

          {/* Subtela: Lojas Conectadas */}
          {activeTab === 'stores' && (
            <div className="mt-6 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-sm font-bold text-foreground">Integração com Lojas</span>
                <button onClick={() => setActiveTab('main')} className="text-xs text-primary hover:underline">Voltar</button>
              </div>

              {[
                { key: 'steam', name: 'Steam Community', desc: 'Sincronização de Wishlist' },
                { key: 'nuuvem', name: 'Nuuvem Games', desc: 'Ativação de Chaves Oficiais' },
                { key: 'epic', name: 'Epic Games Store', desc: 'Rastreador de Jogos Semanais' },
              ].map(store => (
                <div key={store.key} className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border">
                  <div>
                    <div className="text-xs font-bold text-foreground">{store.name}</div>
                    <div className="text-[11px] text-muted-foreground">{store.desc}</div>
                  </div>
                  <button 
                    onClick={() => toggleStore(store.key)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-bold border transition-all ${connectedStores[store.key] ? 'border-primary/40 text-primary bg-primary/10' : 'border-border text-muted-foreground hover:bg-secondary'}`}
                  >
                    {connectedStores[store.key] ? 'Conectado' : 'Conectar'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Logout */}
          <div className="mt-6 pt-4 border-t border-border">
            <button 
              onClick={() => {
                signOut();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-danger hover:bg-danger/10 transition-colors text-xs font-bold"
            >
              <LogOut size={16} /> Encerrar Sessão
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
