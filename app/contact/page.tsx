'use client';
import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Mail, MessageCircle, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ContactPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !subject || !message) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
      setName('');
      setSubject('');
      setMessage('');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-transparent text-foreground flex flex-col font-sans selection:bg-primary/30">
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

      <main className="flex-1 container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-black mb-2 tracking-tight">Fale com o QG GameHunter</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Sugestões de novas lojas, relatos de discrepância de preços ou dúvidas sobre a plataforma.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-panel p-8 rounded-2xl border border-border space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-foreground">Canais Diretos</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Nossa equipe audita os bots de rastreamento diariamente. Se encontrou um preço desatualizado em alguma loja parceira, avise-nos para recalibrar o coletor.
              </p>
              
              <div className="space-y-3 pt-2">
                <a 
                  href="mailto:contato@gamehunter.com.br" 
                  className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border hover:border-primary/40 text-xs font-semibold text-foreground transition-all"
                >
                  <Mail size={18} className="text-primary" />
                  <span>contato@gamehunter.com.br</span>
                </a>

                <a 
                  href="https://discord.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border hover:border-primary/40 text-xs font-semibold text-foreground transition-all"
                >
                  <MessageCircle size={18} className="text-primary" />
                  <span>Discord da Comunidade</span>
                </a>
              </div>
            </div>

            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl text-[11px] text-muted-foreground leading-relaxed">
              💡 <strong>Lojistas e Distribuidores:</strong> Deseja integrar o catálogo da sua loja autorizada? Envie o feed XML/JSON para análise técnica.
            </div>
          </div>
          
          <div className="glass-panel p-8 rounded-2xl border border-border">
            <h2 className="text-lg font-bold mb-4 text-foreground">Enviar Mensagem</h2>

            {sent ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 animate-in fade-in">
                <div className="w-14 h-14 bg-success/20 text-success rounded-2xl flex items-center justify-center mb-1">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="font-bold text-base text-foreground">Mensagem Enviada!</h3>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Recebemos seu contato e retornaremos em breve no seu canal de e-mail.
                </p>
                <button 
                  onClick={() => setSent(false)} 
                  className="btn-secondary text-xs px-4 py-2 font-bold rounded-xl mt-4"
                >
                  Enviar Outra Mensagem
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Seu Nome / Nick</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-secondary/60 border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all" 
                    placeholder="Ex: GhostHunter" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Motivo do Contato</label>
                  <input 
                    type="text" 
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-secondary/60 border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all" 
                    placeholder="Ex: Sugestão de Loja / Erro de Preço" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Mensagem</label>
                  <textarea 
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-secondary/60 border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all min-h-[110px]" 
                    placeholder="Descreva detalhes ou informe o link da loja..."
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full btn-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/25 text-xs mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Enviando...
                    </>
                  ) : (
                    <>
                      <Send size={15} /> Transmitir Mensagem
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
