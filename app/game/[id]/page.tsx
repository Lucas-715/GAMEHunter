'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { GameDetailView } from '@/components/GameDetailView';
import { Footer } from '@/components/Footer';
import { ProfileModal } from '@/components/ProfileModal';
import { NotificationModal } from '@/components/NotificationModal';
import { mockNotifications } from '@/lib/gamesData';
import { Loader2 } from 'lucide-react';

export default function GameDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Modais
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);

  useEffect(() => {
    async function fetchGame() {
      try {
        setLoading(true);
        const res = await fetch(`/api/games/${params.id}`);
        const data = await res.json();
        if (data.game) {
          setGame(data.game);
        } else {
          setError(true);
        }
      } catch (e) {
        console.error("Failed to load game", e);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    if (params.id) fetchGame();
  }, [params.id]);

  return (
    <div className="min-h-screen bg-transparent text-foreground flex flex-col font-sans selection:bg-primary/30">
      <Navbar 
        currentView="game-detail"
        onNavigate={(view) => {
          if (view === 'dashboard') router.push('/');
          if (view === 'wishlist') router.push('/wishlist');
        }}
        onSearch={(q) => {
          if (q.trim()) router.push(`/?q=${encodeURIComponent(q)}`);
        }}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        unreadNotifications={notifications.filter(n => !n.read).length}
      />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        {loading && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
            <Loader2 size={36} className="text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Buscando cotações atualizadas...</p>
          </div>
        )}

        {!loading && error && (
          <div className="p-12 text-center">
            <h2 className="text-2xl font-bold mb-2">Jogo não encontrado</h2>
            <p className="text-sm text-muted-foreground mb-6">Não conseguimos localizar este título na nossa base.</p>
            <button onClick={() => router.push('/')} className="btn-primary py-2.5 px-6 rounded-xl font-bold text-xs">
              Voltar ao Início
            </button>
          </div>
        )}

        {!loading && game && (
          <GameDetailView game={game} onBack={() => router.push('/')} />
        )}
      </main>

      <Footer />

      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <NotificationModal 
        isOpen={isNotificationsOpen} 
        onClose={() => setIsNotificationsOpen(false)} 
        notifications={notifications} 
        onMarkAllAsRead={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
        onClearAll={() => setNotifications([])}
        onDelete={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
      />
    </div>
  );
}
