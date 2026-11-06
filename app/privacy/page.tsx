'use client';
import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useRouter } from 'next/navigation';

export default function PrivacyPage() {
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
      <main className="flex-1 container mx-auto px-4 py-16 max-w-4xl space-y-8">
        <div>
          <h1 className="text-4xl font-black mb-2 tracking-tight">Privacidade e Diretrizes</h1>
          <p className="text-sm text-muted-foreground">Transparência total sobre como tratamos seus dados no GameHunter.</p>
        </div>

        <div className="glass-panel p-8 rounded-2xl border border-border space-y-6 text-xs text-muted-foreground leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">1. Dados Coletados</h2>
            <p>
              Coletamos estritamente os dados necessários para entregar o serviço de alerta de preço: seu endereço de e-mail (usado para envio das notificações de preço), nome de exibição e os identificadores dos jogos favoritados.
            </p>
          </section>
          
          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">2. Sincronização com Steam</h2>
            <p>
              Ao utilizar o importador da Steam, o GameHunter consome exclusivamente informações públicas disponibilizadas através das APIs e páginas abertas da Steam Community. Não solicitamos sua senha da Steam nem temos acesso às suas credenciais de compra.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">3. Segurança e Criptografia</h2>
            <p>
              Todas as senhas de usuários cadastrados são criptografadas com hash salted (bcrypt). O tráfego entre seu navegador e nossos servidores é protegido por TLS/HTTPS.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">4. Lojas de Terceiros e Afiliados</h2>
            <p>
              O GameHunter pode conter links que direcionam para lojas oficiais. Os termos de compra, entrega e pagamento são regidos exclusivamente pelas políticas de cada lojista parceiro.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
