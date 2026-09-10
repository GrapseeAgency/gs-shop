import { NextRequest, NextResponse } from 'next/server';

// GET /api/shopping-games/stats - Get player statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      );
    }

    
    const playerStats = {
      userId,
      overall: {
        totalGamesPlayed: 41,
        totalPoints: 28450,
        averageScore: 694,
        winRate: 0.68,
        currentStreak: 5,
        bestStreak: 12,
        rank: 1247,
        percentile: 87.3
      },
      gameStats: [
        {
          gameId: 'game-1',
          gameName: 'Price Predictor',
          played: 12,
          bestScore: 850,
          averageScore: 620,
          winRate: 0.67,
          favorite: true
        },
        {
          gameId: 'game-2',
          gameName: 'Style Match',
          played: 8,
          bestScore: 920,
          averageScore: 780,
          winRate: 0.75,
          favorite: false
        },
        {
          gameId: 'game-3',
          gameName: 'Deal Hunter',
          played: 15,
          bestScore: 1100,
          averageScore: 890,
          winRate: 0.53,
          favorite: true
        },
        {
          gameId: 'game-4',
          gameName: 'Brand Quiz',
          played: 6,
          bestScore: 780,
          averageScore: 650,
          winRate: 0.83,
          favorite: false
        }
      ],
      achievements: [
        {
          id: 'ach-1',
          name: 'Game Master',
          description: 'Play 50 games',
          progress: 41,
          target: 50,
          unlocked: false,
          icon: '',
          points: 500
        },
        {
          id: 'ach-2',
          name: 'High Scorer',
          description: 'Score over 1000 points',
          progress: 1,
          target: 1,
          unlocked: true,
          icon: '',
          points: 250
        },
        {
          id: 'ach-3',
          name: 'Winning Streak',
          description: 'Win 10 games in a row',
          progress: 5,
          target: 10,
          unlocked: false,
          icon: '',
          points: 300
        }
      ],
      powerups: [
        {
          id: 'power-1',
          name: 'Time Freeze',
          description: 'Freeze time for 10 seconds',
          quantity: 3,
          type: 'temporary',
          icon: ''
        },
        {
          id: 'power-2',
          name: 'Double Points',
          description: 'Double points for next game',
          quantity: 1,
          type: 'boost',
          icon: ''
        },
        {
          id: 'power-3',
          name: 'Hint Helper',
          description: 'Get hints during games',
          quantity: 5,
          type: 'assistance',
          icon: ''
        }
      ],
      recentActivity: [
        {
          type: 'game_played',
          gameName: 'Deal Hunter',
          score: 980,
          result: 'win',
          timestamp: '2024-05-20T14:30:00Z',
          pointsEarned: 100
        },
        {
          type: 'achievement_unlocked',
          achievementName: 'High Scorer',
          timestamp: '2024-05-20T14:25:00Z',
          pointsEarned: 250
        },
        {
          type: 'powerup_earned',
          powerupName: 'Double Points',
          timestamp: '2024-05-20T14:20:00Z'
        }
      ],
      weeklyProgress: {
        gamesPlayed: 12,
        pointsEarned: 2840,
        rankChange: +45,
        nextMilestone: {
          name: 'Weekly Champion',
          target: 3000,
          progress: 0.95
        }
      }
    };

    return NextResponse.json({
      success: true,
      data: playerStats
    });
  } catch (error) {
    console.error('Error fetching player stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch player stats' },
      { status: 500 }
    );
  }
}
