'use client';
import React from 'react';
import Link from 'next/link';
import { MessageCircle, Heart, Globe, Share2 } from 'lucide-react';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border bg-background mt-auto">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2 group w-fit">
              <Logo size={36} />
              <span className="text-2xl font-black tracking-tight text-foreground">
                Game<span className="text-primary">Hunter</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Plataforma gamer para rastrear preços, detectar menores valores históricos e receber alertas quando o preço ideal for atingido.
            </p>
            <div className="flex gap-4 pt-2">
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-muted-foreground hover:text-primary transition-colors p-1"
                aria-label="Twitter / X da GameHunter"
              >
                <Share2 size={19} />
              </a>
              <a 
                href="https://discord.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-muted-foreground hover:text-primary transition-colors p-1"
                aria-label="Discord da Comunidade GameHunter"
              >
                <MessageCircle size={19} />
              </a>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-muted-foreground hover:text-primary transition-colors p-1"
                aria-label="Comunidade Aberta"
              >
                <Globe size={19} />
              </a>
            </div>
          </div>

          {/* Links de Plataforma */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground text-sm uppercase tracking-wider">Explorar</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-primary transition-colors">Painel de Ofertas</Link></li>
              <li><Link href="/wishlist" className="hover:text-primary transition-colors">Alertas & Wishlist</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">Como Funciona o Score</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">Lojas Monitoradas</Link></li>
            </ul>
          </div>
          
          {/* Suporte */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground text-sm uppercase tracking-wider">Suporte</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/contact" className="hover:text-primary transition-colors">Fale Conosco</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacidade e Dados</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Sugerir Nova Loja</Link></li>
            </ul>
          </div>

          {/* Recursos Gamer */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground text-sm uppercase tracking-wider">Recursos</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="text-foreground font-medium">Steam Import</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-primary/20 text-primary font-bold">ATIVO</span>
              </li>
              <li className="text-xs text-muted-foreground">
                Atualização em tempo real de Steam, GOG, Nuuvem e Green Man Gaming.
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} GameHunter. Preços sujeitos a alteração pelos lojistas.</p>
          <p className="flex items-center gap-1.5 font-medium">
            Desenvolvido para caçadores de ofertas <Heart size={14} className="text-primary fill-primary" />
          </p>
        </div>
      </div>
    </footer>
  );
};
