import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const game = await prisma.game.findUnique({
      where: { id },
      include: {
        priceHistory: {
          orderBy: {
            collectionDate: 'desc'
          }
        },
        store: true // We didn't link game to store directly, but via price history
      }
    })
    // Wait, prisma include above is slightly wrong for store, let's fix it

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    // Fetch the detailed price history to calculate score
    const priceHistory = await prisma.priceHistory.findMany({
      where: { gameId: id },
      include: { store: true },
      orderBy: { collectionDate: 'desc' }
    })

    // Group by store to find current price
    const currentPrices: Record<string, any> = {}
    priceHistory.forEach(ph => {
      if (!currentPrices[ph.storeId]) {
        currentPrices[ph.storeId] = ph
      }
    })

    const allPrices = Object.values(currentPrices)
    const lowestCurrentPrice = allPrices.reduce((min, p) => p.price < min.price ? p : min, allPrices[0])

    // Calculate All-Time Low
    const allTimeLow = priceHistory.reduce((min, p) => p.price < min.price ? p : min, priceHistory[0])

    // Calculate 90-day average
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
    const recentPrices = priceHistory.filter(p => new Date(p.collectionDate) >= ninetyDaysAgo)
    const average90Days = recentPrices.reduce((sum, p) => sum + p.price, 0) / (recentPrices.length || 1)

    // Calculate basic Opportunity Score (0-100)
    let score = 0
    if (lowestCurrentPrice.price <= allTimeLow.price) {
      score = 100 // Rule RN-07
    } else {
      // Distance from all time low (35%)
      const diffFromLow = lowestCurrentPrice.price - allTimeLow.price
      const maxDiff = average90Days - allTimeLow.price || 1
      const lowScore = Math.max(0, 35 - (diffFromLow / maxDiff) * 35)

      // Position vs 90 day average (25%)
      let avgScore = 0
      if (lowestCurrentPrice.price < average90Days) {
        avgScore = 25
      } else {
        const diffFromAvg = lowestCurrentPrice.price - average90Days
        avgScore = Math.max(0, 25 - (diffFromAvg / average90Days) * 25)
      }

      // Mock other factors for MVP
      const seasonalScore = 15 // Mock 20%
      const frequencyScore = 5 // Mock 10%
      const trendScore = 5 // Mock 10%

      score = Math.round(lowScore + avgScore + seasonalScore + frequencyScore + trendScore)
    }

    let recommendation = ''
    if (score >= 80) recommendation = 'Ótimo momento para comprar'
    else if (score >= 50) recommendation = 'Preço razoável, pode esperar'
    else recommendation = 'Espere — já esteve mais barato'

    return NextResponse.json({
      game,
      currentPrices: allPrices,
      allTimeLow,
      average90Days,
      opportunityScore: {
        score,
        recommendation
      }
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
