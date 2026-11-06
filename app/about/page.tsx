'use client';
import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ShieldCheck, Zap, Bell, Database } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/30">
      <Navbar 
        currentView="other"
        onNavigate={(view) => {
          if (view === 'dashboard') router.push('/');
          if (view === 'wishlist') router.push('/wishlist');
        }}
        onSearch={(q) => {
          if (q.trim()) router.push(`/?q=${encodeURIComponent(q)}`);
        }}
        onOpenNotifications={() => {}}
        onOpenProfile={() => {}}
        unreadNotifications={0}
      />
      <main className="flex-1 container mx-auto px-4 py-16 max-w-4xl space-y-10">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">
            Sobre o Game<span className="text-primary">Hunter</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Engenharia de monitoramento de preços para quem joga no PC e quer comprar no melhor momento.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-border space-y-3">
            <div className="p-3 bg-primary/10 rounded-xl text-primary w-fit">
              <Zap size={22} />
            </div>
            <h3 className="font-bold text-base text-foreground">Score Hunter (0 a 100)</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Nosso índice compara o preço atual contra o menor histórico registrado nos últimos 24 meses. Se o score for 100, significa que o jogo está no menor preço absoluto já visto.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-border space-y-3">
            <div className="p-3 bg-primary/10 rounded-xl text-primary w-fit">
              <ShieldCheck size={22} />
            </div>
            <h3 className="font-bold text-base text-foreground">Apenas Lojas Verificadas</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Priorizamos Steam, Nuuvem, GOG, Epic Games e revendedores diretos autorizados pelas publishers. Nada de chaves de procedência duvidosa ou contas compartilhadas.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-border space-y-3">
            <div className="p-3 bg-primary/10 rounded-xl text-primary w-fit">
              <Bell size={22} />
            </div>
            <h3 className="font-bold text-base text-foreground">Alertas Sem Spam</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Você define o valor alvo. Não mandamos e-mails de promoções irrelevantes de 5%; você só é avisado quando o desconto atingir o gatilho configurado.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-border space-y-3">
            <div className="p-3 bg-primary/10 rounded-xl text-primary w-fit">
              <Database size={22} />
            </div>
            <h3 className="font-bold text-base text-foreground">Sincronização com Steam</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Conecte sua lista de desejos pública da Steam para importar dezenas de jogos com um clique e definir descontos percentuais automáticos.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
