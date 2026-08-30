'use client';
import React, { useState } from 'react';
import { X, User, Settings, LogOut, Link2, CreditCard, BellRing, Gamepad2, Loader2 } from 'lucide-react';
import { useSession, signIn, signOut } from 'next-auth/react';

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
          // Após registro, faz o login
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

  if (status === 'loading') {
    return null; // ou um spinner
  }

  // Se não estiver logado, exibe a tela de Login/Cadastro
  if (!session) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative w-full max-w-md bg-card border border-border rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden p-8">
          <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-md text-muted-foreground hover:bg-secondary transition-colors">
            <X size={20} />
          </button>

          <div className="flex flex-col items-center mb-8">
            <Gamepad2 size={40} className="text-primary mb-4" />
            <h2 className="text-2xl font-black tracking-tight">{isLoginView ? 'Acessar Conta' : 'Criar Conta'}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isLoginView ? 'Faça login para gerenciar seus alertas' : 'Junte-se à caçada por preços menores'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLoginView && (
              <div>
                <label className="block text-sm font-medium mb-1">Nome</label>
                <input 
                  type="text" 
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                  placeholder="Seu nome"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">E-mail</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Senha</label>
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-danger text-sm">{error}</p>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn-primary mt-2 flex justify-center"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (isLoginView ? 'Entrar' : 'Cadastrar')}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              {isLoginView ? 'Não tem uma conta?' : 'Já possui uma conta?'}
            </span>
            <button 
              onClick={() => { setIsLoginView(!isLoginView); setError(''); }} 
              className="ml-2 text-primary font-medium hover:underline"
            >
              {isLoginView ? 'Cadastre-se' : 'Entrar'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Se logado, exibe o perfil real
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-card border border-border rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        
        {/* Header/Cover */}
        <div className="h-24 bg-gradient-to-r from-primary/20 to-blue-500/20 relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-md bg-black/20 text-white hover:bg-black/40 transition-colors backdrop-blur-sm">
            <X size={18} />
          </button>
        </div>

        {/* Avatar & Info */}
        <div className="px-6 pb-6 relative">
          <div className="w-20 h-20 bg-secondary border-4 border-card rounded-xl flex items-center justify-center absolute -top-10 shadow-lg overflow-hidden">
            <img src="/mascot.jpg" alt="Mascote" className="w-full h-full object-cover" />
          </div>
          
          <div className="mt-12 flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold">{session.user?.name || 'Usuário'}</h2>
              <p className="text-sm text-muted-foreground">{session.user?.email}</p>
            </div>
            <span className="px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded text-xs font-medium uppercase tracking-wider">
              {/* @ts-ignore */}
              Plano {session.user?.plan || 'Free'}
            </span>
          </div>

          {/* Menu */}
          <div className="mt-6 space-y-1">
            <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-colors text-sm">
              <div className="flex items-center gap-3">
                <Settings size={18} className="text-muted-foreground" /> Configurações da Conta
              </div>
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-colors text-sm">
              <div className="flex items-center gap-3">
                <BellRing size={18} className="text-muted-foreground" /> Preferências de Notificação
              </div>
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-colors text-sm">
              <div className="flex items-center gap-3">
                <Link2 size={18} className="text-muted-foreground" /> Conexões de Lojas
              </div>
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <button 
              onClick={() => {
                signOut();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 p-2 rounded-lg text-danger hover:bg-danger/10 transition-colors text-sm font-medium"
            >
              <LogOut size={18} /> Sair da conta
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
