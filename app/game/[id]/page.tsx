'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import styles from './game.module.css'

export default function GameDetails() {
  const params = useParams()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false)
  const [chartPeriod, setChartPeriod] = useState('90')
  const [chatMessage, setChatMessage] = useState('')
  const modalRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAlertModalOpen) {
        setIsAlertModalOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isAlertModalOpen])

  useEffect(() => {
    if (isAlertModalOpen && modalRef.current) {
      modalRef.current.focus()
    }
  }, [isAlertModalOpen])

  if (loading) return <div className={styles.container} role="status" aria-live="polite">Carregando...</div>
  if (!data || data.error) return <div className={styles.container} role="alert">Jogo não encontrado.</div>

  const { game, currentPrices, allTimeLow, average90Days, opportunityScore } = data

  return (
    <main className={styles.container}>
      <Link href="/" style={{ color: 'var(--text-secondary)', marginBottom: '2rem', display: 'inline-block' }} aria-label="Voltar para busca">
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
          <div className={styles.feedbackContainer}>
            <button aria-label="Avaliar positivamente" title="Boa oportunidade" className={styles.feedbackBtn}>👍</button>
            <button aria-label="Avaliar negativamente" title="Oportunidade ruim" className={styles.feedbackBtn}>👎</button>
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
                      <button className="btn-primary" aria-label={`Comprar ${game.name} na loja ${p.store.name}`} title="Ir para loja">Comprar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className={`${styles.section} glass-panel`}>
            <div className={styles.chartControls}>
              <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Histórico e Projeções</h2>
              <div>
                <button className={`${styles.chartPeriodBtn} ${chartPeriod === '30' ? styles.active : ''}`} onClick={() => setChartPeriod('30')}>30d</button>
                <button className={`${styles.chartPeriodBtn} ${chartPeriod === '90' ? styles.active : ''}`} onClick={() => setChartPeriod('90')}>90d</button>
                <button className={`${styles.chartPeriodBtn} ${chartPeriod === '365' ? styles.active : ''}`} onClick={() => setChartPeriod('365')}>1 Ano</button>
              </div>
            </div>
            <div className={styles.chartContainer} aria-label={`Gráfico de histórico de preços para ${game.name}`}>
              [Gráfico de linha renderizado aqui - Período: {chartPeriod} dias. Inclui Projeção de Tendência e Eventos Sazonais]
            </div>
            <div className={styles.meta} style={{ marginTop: '1rem', justifyContent: 'space-between' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'block' }}>Menor Preço Histórico</span>
                <strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(allTimeLow.price)}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'block' }}>Média de {chartPeriod} dias</span>
                <strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(average90Days)}</strong>
              </div>
            </div>
          </section>

          <section className={styles.chatbotContainer} aria-label="Assistente Conversacional GameHunter">
            <div className={styles.chatbotHeader}>
              <span style={{ fontSize: '1.5rem' }}>🤖</span> Assistente GameHunter
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Pergunte-me sobre o histórico de {game.name}, quando foi a melhor promoção ou se vale a pena esperar a próxima Black Friday.
            </div>
            <div className={styles.chatbotInputContainer}>
              <input 
                type="text" 
                className={styles.chatbotInput} 
                placeholder="Ex: Devo comprar agora ou esperar a Summer Sale?" 
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
              />
              <button className="btn-primary" onClick={() => { alert('Esta é uma versão mockada do assistente. Em produção, conectaremos a uma IA real.'); setChatMessage(''); }}>Enviar</button>
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
            <button 
              className="btn-primary" 
              style={{ width: '100%', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
              aria-label="Criar alerta de preço"
              aria-haspopup="dialog"
              title="Configurar notificação de preço"
              onClick={() => setIsAlertModalOpen(true)}
            >
              🔔 Criar Alerta
            </button>
          </div>
        </aside>
      </div>

      {isAlertModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsAlertModalOpen(false)}>
          <div 
            className={styles.modalContent} 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="modal-title"
            tabIndex={-1}
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="modal-title" style={{ marginBottom: '1rem' }}>Configurar Alerta</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Defina o preço desejado para ser notificado.
            </p>
            <input type="number" placeholder="Preço Alvo (R$)" className={styles.searchInput} style={{ width: '100%', padding: '0.8rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'white', borderRadius: 'var(--radius-sm)' }} />
            <div className={styles.modalActions}>
              <button className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--border-color)' }} onClick={() => setIsAlertModalOpen(false)}>Cancelar</button>
              <button className="btn-primary" onClick={() => setIsAlertModalOpen(false)}>Salvar Alerta</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
