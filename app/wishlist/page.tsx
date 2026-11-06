'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { WishlistAlertsView } from '@/components/WishlistAlertsView';
import { Footer } from '@/components/Footer';
import { ProfileModal } from '@/components/ProfileModal';
import { NotificationModal } from '@/components/NotificationModal';
import { NewAlertModal } from '@/components/NewAlertModal';
import { SteamImportModal } from '@/components/SteamImportModal';
import { mockNotifications } from '@/lib/gamesData';
import { WishlistAlert } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function WishlistPage() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<WishlistAlert[]>([]);
  const [loading, setLoading] = useState(true);

  // Modais
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isNewAlertOpen, setIsNewAlertOpen] = useState(false);
  const [isSteamImportOpen, setIsSteamImportOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/alerts');
      if (res.ok) {
        const data = await res.json();
        const mapped = (data.alerts || []).map((alert: any) => {
          const latestPrice = alert.game?.priceHistory?.[0]?.price || 0;
          const storeName = alert.game?.priceHistory?.[0]?.store?.name || 'Várias Lojas';
          
          return {
            id: alert.id,
            gameId: alert.gameId,
            gameName: alert.game?.name || 'Desconhecido',
            targetPrice: alert.conditionValue,
            currentPrice: latestPrice,
            store: storeName,
            image: alert.game?.coverImageUrl || '',
            active: alert.status === 'ACTIVE'
          };
        });

        // Junta com alertas locais se houver
        const local = JSON.parse(localStorage.getItem('gamehunter_local_alerts') || '[]');
        const combined = [...mapped, ...local];
        const unique = Array.from(new Map(combined.map(item => [item.id, item])).values()) as WishlistAlert[];
        setAlerts(unique);
      } else {
        const local = JSON.parse(localStorage.getItem('gamehunter_local_alerts') || '[]');
        setAlerts(local);
      }
    } catch (e) {
      console.warn("Failed to load alerts from API, reading local storage", e);
      const local = JSON.parse(localStorage.getItem('gamehunter_local_alerts') || '[]');
      setAlerts(local);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleAlertCreated = (newAlert: any) => {
    setAlerts(prev => [newAlert, ...prev]);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/30">
      <Navbar 
        currentView="wishlist"
        onNavigate={(view) => {
          if (view === 'dashboard') router.push('/');
        }}
        onSearch={(q) => {
          if (q.trim()) router.push(`/?q=${encodeURIComponent(q)}`);
        }}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        unreadNotifications={notifications.filter(n => !n.read).length}
      />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <WishlistAlertsView 
          alerts={alerts}
          onNewAlert={() => setIsNewAlertOpen(true)}
          onImportSteam={() => setIsSteamImportOpen(true)}
          onRefreshAlerts={fetchAlerts}
        />
      </main>

      <Footer />

      {/* Modais */}
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <NotificationModal 
        isOpen={isNotificationsOpen} 
        onClose={() => setIsNotificationsOpen(false)} 
        notifications={notifications} 
        onMarkAllAsRead={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
        onClearAll={() => setNotifications([])}
        onDelete={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
      />
      <NewAlertModal 
        isOpen={isNewAlertOpen} 
        onClose={() => setIsNewAlertOpen(false)} 
        onAlertCreated={handleAlertCreated}
      />
      <SteamImportModal 
        isOpen={isSteamImportOpen} 
        onClose={() => setIsSteamImportOpen(false)} 
        onImportSuccess={() => fetchAlerts()}
      />
    </div>
  );
}
