'use client';
import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Navbar 
        currentView="other"
        onNavigate={(view) => window.location.href = '/'}
        onSearch={() => {}}
        onOpenNotifications={() => {}}
        onOpenProfile={() => {}}
        unreadNotifications={0}
      />
      <main className="flex-1 container mx-auto px-4 py-20 max-w-4xl">
        <h1 className="text-4xl font-black mb-8">Sobre a Game<span className="text-primary">Hunter</span></h1>
        <div className="glass-panel p-8 rounded-xl space-y-6 text-muted-foreground leading-relaxed">
          <p>
            A GameHunter nasceu da necessidade de encontrar os melhores preços para jogos digitais de forma rápida,
            segura e centralizada. Sabemos o quão frustrante pode ser navegar por dezenas de lojas para encontrar 
            uma boa oferta.
          </p>
          <p>
            Nossa missão é simples: <strong>Garantir que você nunca pague o preço cheio se não precisar.</strong>
          </p>
          <p>
            Analisamos preços em diversas lojas oficiais (como Steam e Nuuvem) e marketplaces,
            alertando sobre oportunidades, preços mínimos históricos e jogos gratuitos da semana.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
