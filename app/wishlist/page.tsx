'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './wishlist.module.css'

const MOCK_WISHLIST = [
  { id: 1, name: 'Hogwarts Legacy', targetPrice: 120, currentPrice: 150, history: [199, 180, 160, 150, 150] },
  { id: 2, name: 'Spider-Man Remastered', targetPrice: 99, currentPrice: 120, history: [199, 199, 150, 140, 120] },
  { id: 3, name: 'God of War', targetPrice: 70, currentPrice: 65, history: [100, 90, 80, 75, 65], reached: true },
]

export default function Wishlist() {
  const [activeTab, setActiveTab] = useState('ativos')

  const activeAlerts = MOCK_WISHLIST.filter(item => !item.reached)
  const reachedAlerts = MOCK_WISHLIST.filter(item => item.reached)

  return (
    <main className={styles.container}>
      <Link href="/" style={{ color: 'var(--text-secondary)', marginBottom: '2rem', display: 'inline-block' }} aria-label="Voltar para a Home">
        ← Voltar
      </Link>
      
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Monitoramento Estratégico</h1>
          <p className={styles.subtitle}>Gerencie seus alertas e veja quanto você economizou.</p>
        </div>
        <div className={styles.savingsCard}>
          <div className={styles.savingsTitle}>Economia Total</div>
          <div className={styles.savingsValue}>R$ 345,50</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            <span className={styles.badge} style={{ background: 'var(--tertiary)', color: '#000', marginRight: '5px' }}>🏆 Hunter Ouro</span>
            Baseado em 5 compras
          </div>
        </div>
      </header>

      <div className={styles.tabs}>
        <div className={`${styles.tab} ${activeTab === 'ativos' ? styles.active : ''}`} onClick={() => setActiveTab('ativos')}>
          Alertas Ativos ({activeAlerts.length})
        </div>
        <div className={`${styles.tab} ${activeTab === 'atingidos' ? styles.active : ''}`} onClick={() => setActiveTab('atingidos')}>
          Atingidos ({reachedAlerts.length})
        </div>
        <div className={`${styles.tab} ${activeTab === 'notificacoes' ? styles.active : ''}`} onClick={() => setActiveTab('notificacoes')}>
          Canais de Notificação
        </div>
      </div>

      {activeTab === 'ativos' && (
        <div className={styles.grid}>
          {activeAlerts.map(item => (
            <div key={item.id} className={styles.wishlistCard}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.gameName}>{item.name}</h3>
                  <div className={styles.targetPrice}>Alvo: R$ {item.targetPrice}</div>
                </div>
                <button className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '0.2rem 0.5rem' }}>
                  Cancelar
                </button>
              </div>
              
              <div aria-label="Gráfico Sparkline da tendência de preço">
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Tendência (30d)</span>
                <div className={styles.sparklineContainer}>
                  {item.history.map((val, i) => (
                    <div key={i} className={styles.sparklineBar} style={{ height: `${(val / 200) * 100}%` }}></div>
                  ))}
                </div>
              </div>

              <div className={styles.currentPrice}>
                <span>R$ {item.currentPrice}</span>
                <span className={styles.badge}>Atual</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'atingidos' && (
        <div className={styles.grid}>
          {reachedAlerts.map(item => (
            <div key={item.id} className={styles.wishlistCard} style={{ borderColor: 'var(--success)' }}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.gameName}>{item.name}</h3>
                  <div className={styles.targetPrice}>Alvo: R$ {item.targetPrice}</div>
                </div>
                <span className={styles.badge} style={{ background: 'var(--success)', color: '#fff' }}>Alvo Atingido!</span>
              </div>
              
              <div className={styles.currentPrice} style={{ color: 'var(--success)', marginTop: '1rem' }}>
                <span>R$ {item.currentPrice}</span>
                <button className="btn-primary" style={{ fontSize: '0.9rem' }}>Comprar Agora</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'notificacoes' && (
        <div className={`${styles.wishlistCard} glass-panel`} style={{ maxWidth: '600px' }}>
          <h3 className={styles.gameName}>Configurações de Notificação</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Escolha onde deseja receber os alertas quando o preço alvo for atingido.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked style={{ accentColor: 'var(--accent-primary)' }} />
              E-mail (lucas@example.com)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked style={{ accentColor: 'var(--accent-primary)' }} />
              Push Notifications (Navegador)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
              <input type="checkbox" style={{ accentColor: 'var(--accent-primary)' }} />
              Telegram (@lucas_hunter)
            </label>
          </div>
          
          <button className="btn-primary" style={{ marginTop: '1rem', width: 'fit-content' }}>Salvar Preferências</button>
        </div>
      )}

    </main>
  )
}
