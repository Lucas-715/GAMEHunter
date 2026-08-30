'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './wishlist.module.css'
import Image from 'next/image'
import { CloudDownload, Plus, Edit, MoreVertical, Eye, Check, Mail, Smartphone, MessageSquare } from 'lucide-react'

const MOCK_ACTIVE_ALERTS = [
  { id: 1, title: 'Cyberpunk 2077: Phantom Liberty', targetPrice: 99.00, currentPrice: 89.90, platforms: 'Steam • GOG • Epic', hit: true, image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg' },
  { id: 2, title: 'Elden Ring: Shadow of the Erdtree', targetPrice: 150.00, currentPrice: 199.90, platforms: 'Steam • Nuuvem', hit: false, image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg' },
]

export default function WishlistPage() {
  const [activeTab, setActiveTab] = useState('ativos')
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const handleImageError = (id: number) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>Monitoramento Estratégico</h1>
          <p className={styles.subtitle}>Gerencie seus alvos de aquisição e configurações de alerta.</p>
        </div>
        
        <div className={styles.headerActions}>
          <div className={styles.savingsCard}>
            <span className={styles.savingsLabel}>Economia Total</span>
            <span className={styles.savingsValue}>R$ 345,50</span>
          </div>
          <button className={styles.btnOutline} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CloudDownload size={18} /> Importar Steam Wishlist
          </button>
          <button className={styles.btnPrimary} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} /> Novo Alerta
          </button>
        </div>
      </header>

      <nav className={styles.tabs} aria-label="Navegação da Wishlist">
        <button className={`${styles.tabBtn} ${activeTab === 'ativos' ? styles.activeTab : ''}`} onClick={() => setActiveTab('ativos')}>Ativos (12)</button>
        <button className={`${styles.tabBtn} ${activeTab === 'atingidos' ? styles.activeTab : ''}`} onClick={() => setActiveTab('atingidos')}>Atingidos (3)</button>
        <button className={`${styles.tabBtn} ${activeTab === 'historico' ? styles.activeTab : ''}`} onClick={() => setActiveTab('historico')}>Histórico</button>
        <button className={`${styles.tabBtn} ${activeTab === 'canais' ? styles.activeTab : ''}`} onClick={() => setActiveTab('canais')}>⚙️ Canais de Notificação</button>
      </nav>

      {activeTab === 'ativos' && (
        <div className={styles.contentLayout}>
          <div className={styles.grid}>
            {MOCK_ACTIVE_ALERTS.map(alert => (
              <div key={alert.id} className={styles.gameCard}>
                <div className={styles.cardImageContainer}>
                  {imageErrors[alert.id] ? (
                    <div style={{ width: '100%', height: '100%', backgroundColor: '#18181b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>
                      Sem Imagem
                    </div>
                  ) : (
                    <Image 
                      src={alert.image} 
                      alt={alert.title} 
                      fill 
                      style={{ objectFit: 'cover' }} 
                      onError={() => handleImageError(alert.id)}
                    />
                  )}
                  <div className={styles.cardOverlay}></div>
                  {alert.hit ? (
                    <div className={styles.hitBadge}><Check size={12} style={{ display: 'inline', marginRight: '4px' }} /> Alvo Atingido</div>
                  ) : (
                    <div className={styles.monitoringBadge}><Eye size={12} style={{ display: 'inline', marginRight: '4px' }} /> Monitorando</div>
                  )}
                </div>
                
                <div className={styles.cardContent}>
                  <h3 className={styles.gameTitle}>{alert.title}</h3>
                  <p className={styles.platforms}>{alert.platforms}</p>

                  <div className={styles.priceRow}>
                    <span className={styles.priceLabel}>Preço Alvo:</span>
                    <span className={styles.priceValue}>R$ {alert.targetPrice.toFixed(2).replace('.', ',')}</span>
                  </div>
                  
                  <div className={styles.priceRow}>
                    <span className={styles.priceLabel}>Preço Atual:</span>
                    <span className={`${styles.priceValue} ${alert.hit ? styles.priceHit : styles.priceWarning}`}>
                      R$ {alert.currentPrice.toFixed(2).replace('.', ',')} {alert.hit && '⬇'} {alert.hit === false && '—'}
                    </span>
                  </div>
                  
                  {/* Sparkline mockup */}
                  <div className={styles.sparklineContainer}>
                     <svg width="100%" height="30" preserveAspectRatio="none" viewBox="0 0 100 30">
                        <path d={alert.hit ? "M0,15 L20,10 L40,25 L60,15 L80,20 L100,28" : "M0,25 L20,20 L40,15 L60,25 L80,10 L100,5"} fill="none" stroke={alert.hit ? "#22C55E" : "#EAB308"} strokeWidth="2" />
                     </svg>
                  </div>

                  <div className={styles.cardActions}>
                    {alert.hit ? (
                      <button className={styles.btnBuy}>Comprar Agora</button>
                    ) : (
                      <button className={styles.btnEdit} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <Edit size={16} /> Editar
                      </button>
                    )}
                    <button className={styles.btnOptions}><MoreVertical size={16} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <aside className={styles.sidebar}>
            <div className={styles.sidebarCard}>
              <h3 className={styles.sidebarTitle}>⇌ Canais Ativos</h3>
              
              <div className={styles.channelItem}>
                <div className={styles.channelInfo}>
                  <span className={styles.channelIcon}><Mail size={20} /></span>
                  <div>
                    <div className={styles.channelName}>E-mail</div>
                    <div className={styles.channelDesc}>hunter@exemplo.com</div>
                  </div>
                </div>
                <div className={styles.toggleActive}>
                  <div className={styles.toggleKnobRight}></div>
                </div>
              </div>

              <div className={styles.channelItem}>
                <div className={styles.channelInfo}>
                  <span className={styles.channelIcon}><Smartphone size={20} /></span>
                  <div>
                    <div className={styles.channelName}>Push Mobile</div>
                    <div className={styles.channelDesc}>App GameHunter</div>
                  </div>
                </div>
                <div className={styles.toggleInactive}>
                  <div className={styles.toggleKnobLeft}></div>
                </div>
              </div>

              <div className={styles.channelItem}>
                <div className={styles.channelInfo}>
                  <span className={styles.channelIcon}><MessageSquare size={20} /></span>
                  <div>
                    <div className={styles.channelName}>Discord Webhook</div>
                    <div className={styles.channelDesc}>#alertas-games</div>
                  </div>
                </div>
                <div className={styles.toggleActive}>
                  <div className={styles.toggleKnobRight}></div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </main>
  )
}
