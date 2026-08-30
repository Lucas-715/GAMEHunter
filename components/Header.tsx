'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Header.module.css';
import Image from 'next/image';
import { Search, Star, LayoutGrid, Bell, User } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        <Link href="/" className={styles.logoLink}>
          <div className={styles.logoImage}>
            <Image src="/logo.jpg" alt="GameHunter Logo" width={32} height={32} style={{ borderRadius: '50%', objectFit: 'cover' }} />
          </div>
          <span className={styles.logoText}>Game<span className={styles.logoAccent}>Hunter</span></span>
        </Link>
      </div>

      <nav className={styles.navigation}>
        <Link href="/" className={`${styles.navLink} ${pathname === '/' ? styles.active : ''}`}>
          Dashboard
        </Link>
        <Link href="/?q=ofertas" className={`${styles.navLink} ${pathname.includes('?q=ofertas') ? styles.active : ''}`}>
          Ofertas
        </Link>
        <Link href="/wishlist" className={`${styles.navLink} ${pathname === '/wishlist' ? styles.active : ''}`}>
          Wishlist
        </Link>
        <Link href="/wishlist?tab=alertas" className={`${styles.navLink} ${pathname.includes('?tab=alertas') ? styles.active : ''}`}>
          Alertas
        </Link>
      </nav>

      <div className={styles.actions}>
        {pathname !== '/' && (
          <div className={styles.searchBar}>
            <input type="text" placeholder="Buscar jogos..." className={styles.searchInput} />
            <button className={styles.searchIcon} aria-label="Buscar"><Search size={18} /></button>
          </div>
        )}
        <button className={styles.iconBtn} aria-label="Favoritos"><Star size={20} /></button>
        <button className={styles.iconBtn} aria-label="Comparar"><LayoutGrid size={20} /></button>
        <button className={styles.iconBtn} aria-label="Notificações">
          <div style={{ position: 'relative' }}>
            <Bell size={20} />
            <span className={styles.notificationDot}></span>
          </div>
        </button>
        <button className={styles.iconBtn} aria-label="Perfil"><User size={20} /></button>
      </div>
    </header>
  );
}
