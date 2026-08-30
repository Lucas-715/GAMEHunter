import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function PrivacyPage() {
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
        <h1 className="text-4xl font-black mb-8">Termos e Privacidade</h1>
        <div className="glass-panel p-8 rounded-xl space-y-6 text-muted-foreground leading-relaxed">
          <h2 className="text-xl font-bold text-foreground">1. Coleta de Dados</h2>
          <p>
            Ao utilizar a GameHunter, coletamos apenas os dados essenciais para o funcionamento dos alertas de preço (e-mail, nome de usuário, jogos salvos na wishlist).
          </p>
          
          <h2 className="text-xl font-bold text-foreground mt-8">2. Segurança</h2>
          <p>
            Armazenamos suas informações em servidores seguros e criptografamos todas as senhas. Nunca compartilharemos seus dados pessoais com lojistas terceiros sem sua autorização explícita.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
