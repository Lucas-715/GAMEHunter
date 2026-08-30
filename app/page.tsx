'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from './page.module.css'

export default function Home() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

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

  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Game<span className={styles.accent}>Hunter</span></h1>
        <p className={styles.subtitle}>Encontre o momento perfeito para comprar seus jogos favoritos.</p>
        
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
          <div className={`${styles.resultsList} glass-panel`}>
            {results.map(game => (
              <Link href={`/game/${game.id}`} key={game.id} className={styles.resultItem}>
                <div className={styles.gameInfo}>
                  <h3 className={styles.gameTitle}>{game.name}</h3>
                  <span className={styles.publisher}>{game.publisher}</span>
                </div>
                <div className={styles.gameAction}>
                  Ver Detalhes →
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
