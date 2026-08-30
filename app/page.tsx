'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import styles from './page.module.css'

// Dados Mockados para o Dashboard
const MOCK_FEATURED = [
  { id: 1, title: 'Elden Ring', type: 'Destaque', discount: '-40%', price: 'R$ 149,90' },
  { id: 2, title: 'Cyberpunk 2077', type: 'Destaque', discount: '-50%', price: 'R$ 99,90' },
  { id: 3, title: 'Red Dead Redemption 2', type: 'Destaque', discount: '-67%', price: 'R$ 79,90' },
]

const MOCK_FREE = [
  { id: 'f1', title: 'Epic Games: Jogo Misterioso', expiry: 'Expira em 2 dias' },
  { id: 'f2', title: 'Steam: Fim de Semana Grátis', expiry: 'Expira em 1 dia' },
]

const MOCK_OPPORTUNITIES = [
  { id: 1, name: 'Hollow Knight', score: 95, discount: 50, price: 13.99 },
  { id: 2, name: 'The Witcher 3', score: 88, discount: 75, price: 19.99 },
  { id: 3, name: 'Stardew Valley', score: 92, discount: 40, price: 14.99 },
]

export default function Home() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'score', direction: 'desc' })

  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/games/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setResults(data.games || [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const sortedOpportunities = useMemo(() => {
    let sortableItems = [...MOCK_OPPORTUNITIES];
    sortableItems.sort((a: any, b: any) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    return sortableItems;
  }, [sortConfig]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  }

  return (
    <main className={styles.main}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem' }}>
        <h2 className={styles.title} style={{ fontSize: '1.5rem', margin: 0 }}>Game<span className={styles.accent}>Hunter</span></h2>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Link href="/wishlist" className="btn-primary" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', textDecoration: 'none' }}>
            Monitoramento
          </Link>
          <button className="btn-primary" aria-label="Avaliar positivamente" title="Gostei">👍</button>
          <button className="btn-primary" style={{ background: 'var(--danger)' }} aria-label="Avaliar negativamente" title="Não gostei">👎</button>
        </div>
      </header>

      <div className={styles.hero} style={{ paddingTop: '2rem' }}>
        <h1 className={styles.title}>Encontre o momento <span className={styles.accent}>perfeito</span></h1>
        <p className={styles.subtitle}>Pesquise jogos e descubra se é a hora certa de comprar.</p>
        
        <div className={styles.searchContainer}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Buscar por jogo (ex: Cyberpunk 2077)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {loading && <div className={styles.loader}></div>}
        </div>

        {results.length > 0 && (
          <div className={styles.resultsContainer}>
            <aside className={styles.resultsSidebar} aria-label="Filtros de busca">
              <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-sora)' }}>Filtros</h3>
              
              <div className={styles.filterGroup}>
                <div className={styles.filterTitle}>Lojas</div>
                <label className={styles.filterLabel}>
                  <input type="checkbox" defaultChecked /> Steam
                </label>
                <label className={styles.filterLabel}>
                  <input type="checkbox" defaultChecked /> Nuuvem
                </label>
                <label className={styles.filterLabel}>
                  <input type="checkbox" defaultChecked /> Epic Games
                </label>
              </div>

              <div className={styles.filterGroup}>
                <div className={styles.filterTitle}>Edição</div>
                <label className={styles.filterLabel}>
                  <input type="checkbox" defaultChecked /> Jogo Base
                </label>
                <label className={styles.filterLabel}>
                  <input type="checkbox" /> Premium / Deluxe
                </label>
                <label className={styles.filterLabel}>
                  <input type="checkbox" /> DLCs
                </label>
              </div>
            </aside>

            <div className={styles.resultsList}>
              {results.map(game => (
                <Link href={`/game/${game.id}`} key={game.id} className={styles.resultItem}>
                  <div style={{ textAlign: 'left' }}>
                    <h3 className={styles.gameTitle}>{game.name} <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', marginLeft: '0.5rem', padding: '0.1rem 0.4rem', border: '1px solid var(--accent-primary)', borderRadius: '12px' }}>Jogo Base</span></h3>
                    <span className={styles.publisher}>{game.publisher}</span>
                  </div>
                  <div className={styles.gameAction}>
                    Ver Ofertas →
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {!query && (
        <>
          <section>
            <h2 className={styles.sectionTitle}>Ofertas em Destaque</h2>
            <div className={styles.carousel} aria-label="Carrossel de ofertas em destaque" tabIndex={0}>
              {MOCK_FEATURED.map(item => (
                <div key={item.id} className={`${styles.card} ${styles.cardFeatured}`}>
                  <span className={styles.badge}>{item.discount}</span>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>A partir de <strong>{item.price}</strong></p>
                  <button className="btn-primary" style={{ width: 'fit-content' }}>Ver Oportunidade</button>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className={styles.sectionTitle}>Jogos Grátis e Resgates</h2>
            <div className={styles.freeGamesGrid}>
              {MOCK_FREE.map(item => (
                <div key={item.id} className={styles.freeGameCard}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>{item.title}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{item.expiry}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className={styles.sectionTitle}>Melhores Oportunidades do Dia</h2>
            <div className={`${styles.tableContainer} glass-panel`}>
              <table className={styles.oppTable}>
                <thead>
                  <tr>
                    <th onClick={() => requestSort('name')} aria-sort={sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
                      Jogo {sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th onClick={() => requestSort('score')} aria-sort={sortConfig.key === 'score' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
                      Score {sortConfig.key === 'score' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th onClick={() => requestSort('discount')} aria-sort={sortConfig.key === 'discount' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
                      Desconto {sortConfig.key === 'discount' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th onClick={() => requestSort('price')} aria-sort={sortConfig.key === 'price' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
                      Preço (R$) {sortConfig.key === 'price' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedOpportunities.map(opp => (
                    <tr key={opp.id}>
                      <td style={{ fontWeight: 600 }}>{opp.name}</td>
                      <td>
                        <span style={{ 
                          padding: '0.2rem 0.5rem', 
                          borderRadius: '4px', 
                          background: opp.score >= 90 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                          color: opp.score >= 90 ? 'var(--success)' : 'var(--warning)'
                        }}>
                          {opp.score}
                        </span>
                      </td>
                      <td className={styles.discount}>-{opp.discount}%</td>
                      <td>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(opp.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </main>
  )
}
