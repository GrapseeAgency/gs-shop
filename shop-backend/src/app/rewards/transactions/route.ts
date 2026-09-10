import { NextResponse } from 'next/server'

interface Transaction {
  id: string
  type: 'purchase_earn' | 'referral_bonus' | 'redemption' | 'tier_upgrade' | 'daily_login'
  points: number
  description: string
  date: string
}

function generateTransactions(currentPoints: number): Transaction[] {
  const transactions: Transaction[] = []
  const now = Date.now()
  const day = 86400000

  // Generate realistic transaction history based on current points
  const purchaseCount = Math.floor(currentPoints / 10) || 2

  // Daily login bonuses
  for (let i = 0; i < Math.min(7, purchaseCount); i++) {
    transactions.push({
      id: `dl-${i}`,
      type: 'daily_login',
      points: 5,
      description: 'Daily login bonus',
      date: new Date(now - i * day).toISOString(),
    })
  }

  // Purchase earnings
  for (let i = 0; i < Math.min(purchaseCount, 5); i++) {
    const pts = [10, 15, 20, 25, 30][i % 5]
    transactions.push({
      id: `pe-${i}`,
      type: 'purchase_earn',
      points: pts,
      description: `Earned from order #${(1000 + i).toString().padStart(4, '0')}`,
      date: new Date(now - (i + 2) * day * 2).toISOString(),
    })
  }

  // Referral bonus
  if (currentPoints > 50) {
    transactions.push({
      id: 'rb-1',
      type: 'referral_bonus',
      points: 100,
      description: 'Referral bonus - friend signed up',
      date: new Date(now - 5 * day).toISOString(),
    })
  }

  // Tier upgrade
  if (currentPoints >= 500) {
    transactions.push({
      id: 'tu-1',
      type: 'tier_upgrade',
      points: 50,
      description: 'Upgraded to Silver tier bonus',
      date: new Date(now - 10 * day).toISOString(),
    })
  }
  if (currentPoints >= 1000) {
    transactions.push({
      id: 'tu-2',
      type: 'tier_upgrade',
      points: 100,
      description: 'Upgraded to Gold tier bonus',
      date: new Date(now - 20 * day).toISOString(),
    })
  }

  // Redemption
  if (currentPoints >= 500) {
    transactions.push({
      id: 'rd-1',
      type: 'redemption',
      points: -500,
      description: 'Redeemed for $10 discount code',
      date: new Date(now - 15 * day).toISOString(),
    })
  }

  // Sort by date descending
  transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return transactions
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const points = parseInt(searchParams.get('points') || '0')

    const transactions = generateTransactions(points)
    const totalEarned = transactions.filter(t => t.points > 0).reduce((sum, t) => sum + t.points, 0)
    const totalRedeemed = Math.abs(transactions.filter(t => t.points < 0).reduce((sum, t) => sum + t.points, 0))

    return NextResponse.json({
      data: transactions,
      summary: {
        totalEarned,
        totalRedeemed,
        currentBalance: points,
      },
    })
  } catch (error) {
    console.error('Error fetching reward transactions:', error)
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}
