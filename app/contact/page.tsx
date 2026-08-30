import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Mail, MessageCircle } from 'lucide-react';

export default function ContactPage() {
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
        <h1 className="text-4xl font-black mb-8">Fale Conosco</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-panel p-8 rounded-xl space-y-6">
            <h2 className="text-xl font-bold">Entre em contato</h2>
            <p className="text-muted-foreground">
              Achou algum bug? Quer sugerir uma funcionalidade ou uma nova loja para integração? Estamos sempre ouvindo a comunidade.
            </p>
            
            <div className="flex items-center gap-4 text-primary">
              <Mail size={24} />
              <span>suporte@gamehunter.com.br</span>
            </div>
            <div className="flex items-center gap-4 text-primary">
              <MessageCircle size={24} />
              <span>Discord Oficial</span>
            </div>
          </div>
          
          <div className="glass-panel p-8 rounded-xl space-y-4">
            <h2 className="text-xl font-bold mb-4">Envie uma Mensagem</h2>
            <div>
              <label className="block text-sm font-medium mb-1 text-muted-foreground">Nome</label>
              <input type="text" className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-sm focus:outline-none" placeholder="Seu nome" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-muted-foreground">Assunto</label>
              <input type="text" className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-sm focus:outline-none" placeholder="Motivo do contato" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-muted-foreground">Mensagem</label>
              <textarea className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-sm focus:outline-none min-h-[100px]" placeholder="Como podemos ajudar?"></textarea>
            </div>
            <button className="w-full btn-primary mt-2">Enviar Mensagem</button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
