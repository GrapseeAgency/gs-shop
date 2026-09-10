import { NextRequest, NextResponse } from 'next/server';

// GET /api/shopping-games/leaderboard - Get leaderboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const game = searchParams.get('game');
    const timeframe = searchParams.get('timeframe') || 'weekly';

    return NextResponse.json({
      success: true,
      data: {
        leaderboard: [],
        timeframe,
        game: game || 'all',
        totalPlayers: 0,
        lastUpdated: new Date(),
      }
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
