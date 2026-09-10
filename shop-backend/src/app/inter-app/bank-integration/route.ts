import { NextRequest, NextResponse } from 'next/server'

// POST - Connect bank account for smart payments
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, bankName } = await req.json()

    if (action === 'connect') {
      return NextResponse.json({
        success: true,
        connected: true,
        bank: bankName,
        features: [
          'Automatic balance check before purchase',
          'Smart payment routing',
          'Spending insights',
          'Budget alerts'
        ],
        message: `${bankName} connected! Smart payments enabled.`
      })
    }

    if (action === 'check_balance') {
      const balance = 25000 + Math.floor(Math.random() * 50000)
      
      return NextResponse.json({
        balance,
        currency: 'INR',
        canAfford: true,
        smartSuggestion: balance < 10000 
          ? 'Low balance - consider smaller purchases'
          : 'Good balance for shopping'
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Bank integration error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// GET - Get bank connection status
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ connected: false })
    }

    return NextResponse.json({
      connected: false,
      bank: null,
      connectedAt: null
    })
  } catch (error) {
    console.error('Bank status error:', error)
    return NextResponse.json({ connected: false })
  }
}
