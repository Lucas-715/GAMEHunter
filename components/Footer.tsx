'use client';
import React from 'react';
import { Gamepad2, MessageCircle, AtSign, Share2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border bg-background mt-auto">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Gamepad2 size={32} strokeWidth={2.5} />
              <span className="text-2xl font-black tracking-tight text-foreground">Game<span className="text-primary">Hunter</span></span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Sua plataforma definitiva para comparar preços, monitorar descontos e descobrir as melhores ofertas de jogos em lojas oficiais.
            </p>
            <div className="flex gap-4 pt-2">
              <button className="text-muted-foreground hover:text-primary transition-colors" aria-label="Twitter">
                <AtSign size={20} />
              </button>
              <button className="text-muted-foreground hover:text-primary transition-colors" aria-label="Discord">
                <MessageCircle size={20} />
              </button>
              <button className="text-muted-foreground hover:text-primary transition-colors" aria-label="GitHub">
                <Share2 size={20} />
              </button>
            </div>
          </div>

          {/* Links Cols */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Plataforma</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="/about" className="hover:text-primary transition-colors">Sobre Nós</a></li>
              <li><a href="/about" className="hover:text-primary transition-colors">Como funciona</a></li>
              <li><a href="/about" className="hover:text-primary transition-colors">Lojas Parceiras</a></li>
              <li><a href="/about" className="hover:text-primary transition-colors">Blog</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Suporte</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="/contact" className="hover:text-primary transition-colors">Central de Ajuda</a></li>
              <li><a href="/privacy" className="hover:text-primary transition-colors">Termos de Uso</a></li>
              <li><a href="/privacy" className="hover:text-primary transition-colors">Política de Privacidade</a></li>
              <li><a href="/contact" className="hover:text-primary transition-colors">Contato</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">Ferramentas</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="/about" className="hover:text-primary transition-colors flex items-center gap-2">Extensão Chrome <span className="px-1.5 py-0.5 rounded text-[10px] bg-primary/20 text-primary font-medium">NOVO</span></a></li>
              <li><a href="/about" className="hover:text-primary transition-colors">Importador Steam</a></li>
              <li><a href="/about" className="hover:text-primary transition-colors">API para Desenvolvedores</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} GameHunter. Todos os direitos reservados.</p>
          <p className="flex items-center gap-1">
            Feito com <span className="text-danger">♥</span> para gamers.
          </p>
        </div>
      </div>
    </footer>
  );
};
