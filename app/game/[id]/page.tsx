'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import styles from './game.module.css'
import Image from 'next/image'
import { Star, LayoutGrid, ThumbsUp, ThumbsDown, Filter, Bell, Heart } from 'lucide-react'

export default function GameDetails() {
  const params = useParams()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [chartPeriod, setChartPeriod] = useState('90')

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/games/${params.id}`)
        const json = await res.json()
        setData(json)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [params.id])

  if (loading) return <div className={styles.loaderContainer}>Carregando...</div>
  if (!data || data.error) return <div className={styles.loaderContainer}>Jogo não encontrado.</div>

  const { game } = data;
  const currentPrices = game.stores || [];
  const opportunityScore = { score: game.opportunityScore || 0, recommendation: 'Preço baseado na busca em tempo real' };
  const allTimeLow = game.allTimeLow || null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'var(--success)';
    if (score >= 50) return '#EAB308';
    return 'var(--text-secondary)';
  }

  const scoreColor = getScoreColor(opportunityScore.score);
  const minPrice = allTimeLow?.price || currentPrices[0]?.price || 0;
  const maxPrice = Math.max(0, ...currentPrices.map((p: any) => p.price), minPrice * 1.5);
  const isHistoricalLow = currentPrices[0] && currentPrices[0].price <= minPrice && opportunityScore.score >= 80;

  const getPlatformType = (storeName: string) => {
    if (storeName === 'Steam' || storeName === 'Epic Games') return 'Direto';
    if (storeName === 'GOG') return 'DRM-free';
    return 'Steam Key';
  };

  return (
    <main className={styles.main}>
      <header className={styles.heroSection}>
        <Image 
          src={game.coverImageUrl || '/fantasy_bg_1788053423242.jpg'} 
          alt={game.name} 
          fill 
          style={{ objectFit: 'cover', zIndex: 0 }} 
          priority
        />
        <div className={styles.heroOverlay}></div>
        
        <div className={styles.heroTopActions}>
          <button className={styles.iconBtn} aria-label="Favoritos"><Star size={20} /></button>
          <button className={styles.iconBtn} aria-label="Comparar"><LayoutGrid size={20} /></button>
          <button className={styles.iconBtn} aria-label="Like"><ThumbsUp size={20} /></button>
          <button className={styles.iconBtn} aria-label="Dislike"><ThumbsDown size={20} /></button>
        </div>

        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>{game.name}</h1>
          <div className={styles.heroMeta}>
            <span className={styles.metaBadge}>{game.category || 'Action RPG'}</span>
            <span className={styles.metaBadge}>{game.publisher || 'Bandai Namco'}</span>
            <span className={styles.metaBadge} style={{ color: '#EAB308', borderColor: 'rgba(234, 179, 8, 0.3)' }}>⭐ 96 Metacritic</span>
          </div>
        </div>

        <div className={styles.heroScoreCard} style={{ borderColor: scoreColor }}>
          <div className={styles.heroScoreValue} style={{ color: scoreColor }}>{opportunityScore.score}</div>
          <div className={styles.heroScoreDetails}>
            <div className={styles.heroScoreRec} style={{ color: scoreColor }}>{opportunityScore.recommendation}</div>
            {isHistoricalLow && <div className={styles.heroScoreSub}>HISTORICAL LOW</div>}
          </div>
        </div>
      </header>

      <div className={styles.gridContainer}>
        <div className={styles.mainContent}>
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Comparador de Preços</h2>
              <button className={styles.filterBtn} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Filter size={16} /> Filtros
              </button>
            </div>
            
            <div className={styles.tableContainer}>
              <table className={styles.priceTable}>
                <thead>
                  <tr>
                    <th>LOJA</th>
                    <th>EDIÇÃO</th>
                    <th>PLATAFORMA</th>
                    <th style={{ textAlign: 'right' }}>PREÇO</th>
                  </tr>
                </thead>
                <tbody>
                  {currentPrices.map((p: any, idx: number) => {
                    const isBest = p.available && idx === 0;
                    return (
                      <tr key={p.id} className={isBest ? styles.bestPriceRow : ''}>
                        <td>
                          <div className={styles.storeCell}>
                            <div className={styles.storeIcon}>{p.store.name.substring(0,2).toUpperCase()}</div>
                            <span style={{ fontWeight: 600 }}>{p.store.name}</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>Standard Edition</td>
                        <td>
                          <span className={styles.platformBadge}>{getPlatformType(p.store.name)}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {p.available ? (
                            <div className={styles.priceActionCell}>
                              <div className={styles.priceBlock}>
                                {isBest && <span className={styles.oldPrice}>R$ 249,90</span>}
                                <span className={isBest ? styles.currentPriceBest : styles.currentPriceRegular}>
                                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: p.currency }).format(p.price)}
                                </span>
                              </div>
                              {isBest ? (
                                <a href={p.storeUrl || p.url || p.link || `https://www.google.com/search?q=${encodeURIComponent(game.name + ' buy ' + p.store.name)}`} target="_blank" rel="noopener noreferrer" className={styles.buyBtnPrimary}>Comprar</a>
                              ) : (
                                <a href={p.storeUrl || p.url || p.link || `https://www.google.com/search?q=${encodeURIComponent(game.name + ' buy ' + p.store.name)}`} target="_blank" rel="noopener noreferrer" className={styles.buyBtnSecondary}>Ver ↗</a>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-secondary)' }}>Indisponível</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className={styles.actionButtons}>
              <button className={styles.alertBtn} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Bell size={18} /> Criar Alerta de Preço
              </button>
              <button className={styles.wishlistBtn} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Heart size={18} /> Adicionar à Wishlist
              </button>
            </div>
          </section>
        </div>

        <aside className={styles.sidebarContent}>
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Histórico (90 dias) + Projeção</h2>
              <span className={styles.currencyBadge}>BRL</span>
            </div>
            
            <div className={styles.chartMockup}>
               {/* Mocking the chart layout visually as requested */}
               <div className={styles.chartGrid}>
                  <div className={styles.chartLine}></div>
                  <div className={styles.chartLine}></div>
                  <div className={styles.chartLine}></div>
                  <div className={styles.chartLine}></div>
               </div>
               
               <div className={styles.chartEvents}>
                  <span className={styles.chartEventLabel} style={{ left: '20%' }}>Spring Sale</span>
                  <span className={styles.chartEventLabel} style={{ left: '70%' }}>Summer Sale</span>
               </div>
               
               <div className={styles.chartPathSVG}>
                  <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <path d="M0,40 L10,40 L15,80 L25,80 L30,40 L60,40 L65,90 L75,90" fill="none" stroke="#3B82F6" strokeWidth="2" />
                    <path d="M75,90 L85,45 L100,45" fill="none" stroke="#EAB308" strokeWidth="2" strokeDasharray="4,4" />
                    <polygon points="75,90 85,30 100,30 100,60 85,60 75,90" fill="rgba(234, 179, 8, 0.1)" />
                  </svg>
               </div>
               
               <div className={styles.chartMaxMin}>
                 <span className={styles.chartMax}>Max: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(maxPrice)}</span>
                 <span className={styles.chartMin}>Min: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(minPrice)}</span>
               </div>
            </div>
            
            <div className={styles.chartWarning}>
              ⚠️ Promoção expira em 3d
            </div>
          </section>
        </aside>
      </div>
    </main>
  )
}
