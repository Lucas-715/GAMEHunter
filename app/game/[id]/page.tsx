'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import styles from './game.module.css'

export default function GameDetails() {
  const params = useParams()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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

  if (loading) return <div className={styles.container}>Carregando...</div>
  if (!data || data.error) return <div className={styles.container}>Jogo não encontrado.</div>

  const { game, currentPrices, allTimeLow, average90Days, opportunityScore } = data

  return (
    <main className={styles.container}>
      <Link href="/" style={{ color: 'var(--text-secondary)', marginBottom: '2rem', display: 'inline-block' }}>
        ← Voltar para busca
      </Link>
      
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{game.name}</h1>
          <div className={styles.meta}>
            <span>{game.publisher}</span>
            <span>•</span>
            <span>{game.category}</span>
          </div>
        </div>
      </header>

      <div className={styles.grid}>
        <div className={styles.mainContent}>
          <section className={`${styles.section} glass-panel`}>
            <h2 className={styles.sectionTitle}>Comparação de Preços Atual</h2>
            <table className={styles.priceTable}>
              <thead>
                <tr>
                  <th>Loja</th>
                  <th>Preço Atual</th>
                  <th>Região</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {currentPrices.map((p: any) => (
                  <tr key={p.id}>
                    <td className={styles.storeName}>{p.store.name}</td>
                    <td className={styles.price}>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: p.currency }).format(p.price)}
                    </td>
                    <td>{p.region}</td>
                    <td>
                      <button className="btn-primary">Comprar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className={`${styles.section} glass-panel`}>
            <h2 className={styles.sectionTitle}>Histórico de Preços (90 dias)</h2>
            <div className={styles.chartContainer}>
              [Gráfico de linha renderizado aqui]
            </div>
            <div className={styles.meta} style={{ marginTop: '1rem', justifyContent: 'space-between' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'block' }}>Menor Preço Histórico</span>
                <strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(allTimeLow.price)}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'block' }}>Média de 90 dias</span>
                <strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(average90Days)}</strong>
              </div>
            </div>
          </section>
        </div>

        <aside className={styles.sidebar}>
          <div className={`${styles.scoreCard} glass-panel`}>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontWeight: 600 }}>SCORE DE OPORTUNIDADE</div>
            <div className={styles.scoreValue} style={{ color: opportunityScore.score >= 80 ? 'var(--success)' : opportunityScore.score >= 50 ? 'var(--warning)' : 'var(--danger)' }}>
              {opportunityScore.score}
            </div>
            <div className={styles.scoreRecommendation}>
              {opportunityScore.recommendation}
            </div>
            <div className={styles.scoreDetails}>
              (Baseado em preço mínimo e média recente)
            </div>
          </div>

          <div className={`${styles.section} glass-panel`}>
            <h3 style={{ marginBottom: '1rem' }}>Alertas de Preço</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Seja notificado quando este jogo atingir o seu preço-alvo.
            </p>
            <button className="btn-primary" style={{ width: '100%', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              🔔 Criar Alerta
            </button>
          </div>
        </aside>
      </div>
    </main>
  )
}
