'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Gamepad2, 
  Trophy, 
  Star, 
  Coins, 
  Gift,
  Target,
  Zap,
  Clock,
  Users,
  TrendingUp,
  Award,
  Play,
  Lock,
  CheckCircle,
  Crown,
  Flame,
  Gem,
  ShoppingBag,
  Heart,
  BarChart3
} from 'lucide-react';

interface Game {
  id: string;
  name: string;
  description: string;
  type: 'quiz' | 'styling' | 'scavenger' | 'competition' | 'social';
  category: 'fashion' | 'lifestyle' | 'brand' | 'trending' | 'limited';
  difficulty: 'easy' | 'medium' | 'hard';
  players: {
    min: number;
    max: number;
    current: number;
  };
  rewards: {
    points: number;
    coins: number;
    items: string[];
    badges: string[];
  };
  duration: string;
  status: 'available' | 'in_progress' | 'completed' | 'locked';
  requirements: {
    level: number;
    coins?: number;
    previousGames?: string[];
  };
  tags: string[];
}

interface PlayerStats {
  level: number;
  experience: number;
  totalPoints: number;
  totalCoins: number;
  gamesPlayed: number;
  gamesWon: number;
  winRate: number;
  currentStreak: number;
  bestStreak: number;
  achievements: Achievement[];
  inventory: InventoryItem[];
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface InventoryItem {
  id: string;
  name: string;
  type: 'badge' | 'avatar' | 'title' | 'powerup' | 'ticket';
  quantity: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  usable: boolean;
}

interface LeaderboardEntry {
  userId: string;
  username: string;
  avatar?: string;
  score: number;
  rank: number;
  level: number;
  badges: string[];
}

export default function ShoppingGamesHub({ userId }: { userId: string }) {
  const [games, setGames] = useState<Game[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [activeTab, setActiveTab] = useState('games');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    fetchGames();
    fetchPlayerStats();
    fetchLeaderboard();
  }, [userId]);

  const fetchGames = async () => {
    try {
      const response = await fetch(`/api/shopping-games?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setGames(data.data);
      }
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  };

  const fetchPlayerStats = async () => {
    try {
      const response = await fetch(`/api/shopping-games/stats?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setPlayerStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching player stats:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/shopping-games/leaderboard');
      const data = await response.json();
      if (data.success) {
        setLeaderboard(data.data);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const playGame = async (gameId: string) => {
    const game = games.find(g => g.id === gameId);
    if (!game) return;

    setSelectedGame(game);
    setIsPlaying(true);

    try {
      const response = await fetch(`/api/shopping-games/${gameId}/play`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          betAmount: game.type === 'competition' ? 10 : 0
        })
      });
      const data = await response.json();
      if (data.success) {
        // Game session started
        console.log('Game session started:', data.data);
      }
    } catch (error) {
      console.error('Error starting game:', error);
      setIsPlaying(false);
    }
  };

  const usePowerup = async (itemId: string) => {
    try {
      const response = await fetch(`/api/shopping-games/powerup/use`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          itemId
        })
      });
      const data = await response.json();
      if (data.success) {
        fetchPlayerStats();
      }
    } catch (error) {
      console.error('Error using powerup:', error);
    }
  };

  const getGameIcon = (type: string) => {
    switch (type) {
      case 'quiz': return <Target className="w-5 h-5" />;
      case 'styling': return <Star className="w-5 h-5" />;
      case 'scavenger': return <Gift className="w-5 h-5" />;
      case 'competition': return <Trophy className="w-5 h-5" />;
      case 'social': return <Users className="w-5 h-5" />;
      default: return <Gamepad2 className="w-5 h-5" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'hard': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'completed': return 'bg-gray-500';
      case 'locked': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-400';
      case 'rare': return 'border-blue-400';
      case 'epic': return 'border-purple-400';
      case 'legendary': return 'border-yellow-400';
      default: return 'border-gray-400';
    }
  };

  if (!playerStats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Gamepad2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Loading shopping games...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Gamepad2 className="w-5 h-5" />
              Shopping Games Hub
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                <Flame className="w-3 h-3 mr-1" />
                {playerStats.currentStreak} Streak
              </Badge>
              <Button>
                <Coins className="w-4 h-4 mr-2" />
                {playerStats.totalCoins} Coins
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Player Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Level</p>
                <p className="text-2xl font-bold">{playerStats.level}</p>
              </div>
              <Trophy className="w-8 h-8 text-yellow-500" />
            </div>
            <div className="mt-2">
              <Progress value={(playerStats.experience % 100)} className="h-2" />
              <p className="text-xs text-gray-600 mt-1">
                {playerStats.experience % 100}/100 XP
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Points</p>
                <p className="text-2xl font-bold">{playerStats.totalPoints.toLocaleString()}</p>
              </div>
              <Star className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Win Rate</p>
                <p className="text-2xl font-bold">{Math.round(playerStats.winRate * 100)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {playerStats.gamesWon}/{playerStats.gamesPlayed} wins
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Best Streak</p>
                <p className="text-2xl font-bold">{playerStats.bestStreak}</p>
              </div>
              <Flame className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Hub */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="games">Games</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="games" className="space-y-4">
          {/* Game Categories */}
          <div className="flex gap-2 flex-wrap">
            {['All', 'Fashion', 'Lifestyle', 'Brand', 'Trending', 'Limited'].map((category) => (
              <Button
                key={category}
                variant="outline"
                size="sm"
                onClick={() => {
                  // Filter games by category
                  console.log('Filter by:', category);
                }}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Games Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {games.map((game) => (
              <Card key={game.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(game.status)}`} />
                      {getGameIcon(game.type)}
                    </div>
                    <Badge variant="outline" className={getDifficultyColor(game.difficulty)}>
                      {game.difficulty}
                    </Badge>
                  </div>

                  <h3 className="font-medium mb-2">{game.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{game.description}</p>

                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary" className="text-xs">
                      {game.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {game.duration}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between mb-3 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{game.players.current}/{game.players.max}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Coins className="w-3 h-3" />
                      <span>{game.rewards.coins}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => playGame(game.id)}
                      disabled={game.status !== 'available' || isPlaying}
                      className="flex-1"
                    >
                      {game.status === 'locked' ? (
                        <><Lock className="w-3 h-3 mr-1" />Locked</>
                      ) : game.status === 'in_progress' ? (
                        <><Play className="w-3 h-3 mr-1" />Playing</>
                      ) : (
                        <><Play className="w-3 h-3 mr-1" />Play</>
                      )}
                    </Button>
                    <Button size="sm" variant="outline">
                      <Gift className="w-3 h-3" />
                    </Button>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {game.tags.slice(0, 2).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5" />
                Inventory & Power-ups
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {playerStats.inventory.map((item) => (
                  <div key={item.id} className={`border-2 rounded-lg p-3 ${getRarityColor(item.rarity)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{item.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {item.quantity}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded ${
                        item.rarity === 'legendary' ? 'bg-yellow-400' :
                        item.rarity === 'epic' ? 'bg-purple-400' :
                        item.rarity === 'rare' ? 'bg-blue-400' : 'bg-gray-400'
                      }`} />
                      <span className="text-xs capitalize">{item.rarity}</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => usePowerup(item.id)}
                      disabled={!item.usable || item.quantity === 0}
                      className="w-full"
                    >
                      {item.usable ? 'Use' : 'View'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {playerStats.achievements.map((achievement) => (
                  <div key={achievement.id} className={`border rounded-lg p-4 ${
                    achievement.unlocked ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        achievement.unlocked ? 'bg-yellow-200' : 'bg-gray-200'
                      }`}>
                        {achievement.unlocked ? (
                          <Crown className="w-5 h-5 text-yellow-600" />
                        ) : (
                          <Lock className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{achievement.name}</h4>
                        <p className="text-xs text-gray-600">{achievement.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={`text-xs ${
                        achievement.rarity === 'legendary' ? 'border-yellow-400 text-yellow-600' :
                        achievement.rarity === 'epic' ? 'border-purple-400 text-purple-600' :
                        achievement.rarity === 'rare' ? 'border-blue-400 text-blue-600' : 'border-gray-400'
                      }`}>
                        {achievement.rarity}
                      </Badge>
                      {achievement.unlocked && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    {achievement.unlockedAt && (
                      <p className="text-xs text-gray-500 mt-2">
                        Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Global Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.map((entry) => (
                  <div key={entry.userId} className={`flex items-center justify-between p-3 rounded ${
                    entry.userId === userId ? 'bg-blue-50 border border-blue-200' : 'border'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`text-lg font-bold w-8 text-center ${
                        entry.rank === 1 ? 'text-yellow-500' :
                        entry.rank === 2 ? 'text-gray-400' :
                        entry.rank === 3 ? 'text-orange-600' : 'text-gray-600'
                      }`}>
                        #{entry.rank}
                      </div>
                      <Avatar>
                        <AvatarImage src={entry.avatar} />
                        <AvatarFallback>{entry.username?.charAt(0) || 'G'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{entry.username}</p>
                        <p className="text-sm text-gray-600">Level {entry.level}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{entry.score.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">points</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Game Modal */}
      {selectedGame && isPlaying && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getGameIcon(selectedGame.type)}
                {selectedGame.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Gamepad2 className="w-16 h-16 mx-auto mb-4 text-blue-500 animate-pulse" />
                <p className="text-lg font-medium mb-2">Game Starting...</p>
                <p className="text-sm text-gray-600">{selectedGame.description}</p>
              </div>
              <Button 
                onClick={() => {
                  setIsPlaying(false);
                  setSelectedGame(null);
                }}
                className="w-full"
              >
                Exit Game
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
