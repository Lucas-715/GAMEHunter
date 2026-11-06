'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './Header.module.css';
import { Search, Star, Bell, User, LogOut, Heart } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { Logo } from './Logo';
import AuthModal from './AuthModal';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      router.push(`/?q=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        <Link href="/" className={styles.logoLink}>
          <Logo size={32} />
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
          <form onSubmit={handleSearchSubmit} className={styles.searchBar}>
            <input 
              type="text" 
              placeholder="Buscar jogos..." 
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className={styles.searchInput} 
            />
            <button type="submit" className={styles.searchIcon} aria-label="Buscar">
              <Search size={18} />
            </button>
          </form>
        )}
        <Link href="/wishlist" className={styles.iconBtn} aria-label="Wishlist e Alertas">
          <Heart size={20} />
        </Link>
        <button 
          className={styles.iconBtn} 
          aria-label="Notificações"
          onClick={() => router.push('/wishlist?tab=alertas')}
        >
          <div style={{ position: 'relative' }}>
            <Bell size={20} />
            <span className={styles.notificationDot}></span>
          </div>
        </button>
        
        <div className={styles.profileContainer}>
          {session ? (
            <div style={{ position: 'relative' }}>
              <button 
                className={styles.iconBtn} 
                aria-label="Perfil"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                  {session.user?.name?.[0]?.toUpperCase() || <User size={16} />}
                </div>
              </button>
              
              {isDropdownOpen && (
                <div className={styles.dropdown}>
                  <div className={styles.dropdownHeader}>
                    <p className={styles.dropdownName}>{session.user?.name}</p>
                    <p className={styles.dropdownEmail}>{session.user?.email}</p>
                  </div>
                  <Link 
                    href="/wishlist" 
                    className={styles.dropdownItem} 
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Meus Alertas
                  </Link>
                  <button 
                    className={styles.dropdownItem}
                    onClick={() => { setIsDropdownOpen(false); signOut(); }}
                  >
                    <LogOut size={16} />
                    Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              className={styles.iconBtn} 
              aria-label="Login"
              onClick={() => setIsAuthModalOpen(true)}
            >
              <User size={20} />
            </button>
          )}
        </div>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </header>
  );
}
