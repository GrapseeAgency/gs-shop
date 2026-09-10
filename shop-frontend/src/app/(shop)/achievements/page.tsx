'use client'

import { useEffect, useState } from 'react'
import { Award, Lock, Trophy, TrendingUp, ShoppingBag, Star, Heart, Flame, Users, Gamepad2, Crown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  points: number
  category: string
  unlocked: boolean
  unlockedAt?: string
  progress: number
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAchievements()
  }, [])

  const fetchAchievements = async () => {
    try {
      const res = await fetch('/api/achievements')
      if (res.ok) {
        const data = await res.json()
        setAchievements(data.achievements)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching achievements:', error)
      toast.error('Failed to load achievements')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-32 bg-muted rounded" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </div>
      </div>
    )
  }

  const categories = []
  
  const categoryConfig: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
    orders: { label: 'Shopping', icon: ShoppingBag },
    reviews: { label: 'Reviews', icon: Star },
    wishlist: { label: 'Wishlist', icon: Heart },
    streak: { label: 'Streaks', icon: Flame },
    referral: { label: 'Referrals', icon: Users },
    games: { label: 'Games', icon: Gamepad2 },
    loyalty: { label: 'Loyalty', icon: Crown },
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="h-6 w-6 text-amber-500" />
          Achievements
        </h1>
        <p className="text-muted-foreground">
          Unlock badges and earn bonus points by completing challenges
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold">{stats?.unlocked || 0}</p>
            <p className="text-xs text-muted-foreground">Unlocked</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold">{stats?.locked || 0}</p>
            <p className="text-xs text-muted-foreground">To Unlock</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold">{stats?.totalPoints || 0}</p>
            <p className="text-xs text-muted-foreground">Points Earned</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold text-emerald-600">
              {Math.round(((stats?.unlocked || 0) / (stats?.total || 1)) * 100)}%
            </p>
            <p className="text-xs text-muted-foreground">Completion</p>
          </CardContent>
        </Card>
      </div>

      {/* Next Achievement */}
      {stats?.nextAchievement && (
        <Card className="mb-8 border-amber-500/20 bg-amber-500/5">
          <CardContent className="pt-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Almost There!</p>
                <p className="text-sm text-muted-foreground">
                  {stats.nextAchievement.name} - {stats.nextAchievement.progress}%
                </p>
                <Progress value={stats.nextAchievement.progress} className="mt-2" />
              </div>
              <Badge variant="secondary">
                +{stats.nextAchievement.points} pts
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievements by Category */}
      <div className="space-y-8">
        {categories.map((category) => {
          const categoryAchievements = achievements.filter(a => a.category === category)
          if (categoryAchievements.length === 0) return null

          return (
            <div key={category}>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                {(() => { const Icon = categoryConfig[category]?.icon ?? Star; return <Icon className="h-5 w-5" />; })()}
                {categoryConfig[category]?.label ?? category}
                <Badge variant="outline">
                  {categoryAchievements.filter(a => a.unlocked).length}/{categoryAchievements.length}
                </Badge>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryAchievements.map((achievement) => (
                  <Card 
                    key={achievement.id}
                    className={`transition-all ${
                      achievement.unlocked 
                        ? 'border-emerald-500/20 bg-emerald-500/5' 
                        : 'opacity-75'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center text-2xl ${
                          achievement.unlocked 
                            ? 'bg-emerald-500 text-white' 
                            : 'bg-muted'
                        }`}>
                          {achievement.unlocked ? achievement.icon : <Lock className="h-5 w-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-medium truncate">{achievement.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {achievement.description}
                              </p>
                            </div>
                            <Badge variant={achievement.unlocked ? 'default' : 'secondary'}>
                              +{achievement.points}
                            </Badge>
                          </div>
                          
                          {!achievement.unlocked && (
                            <div className="mt-3">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-muted-foreground">Progress</span>
                                <span>{achievement.progress}%</span>
                              </div>
                              <Progress value={achievement.progress} className="h-1.5" />
                            </div>
                          )}

                          {achievement.unlocked && achievement.unlockedAt && (
                            <p className="text-xs text-emerald-600 mt-2">
                              Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {achievements.length === 0 && (
        <div className="text-center py-12">
          <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Start shopping to unlock achievements!</p>
        </div>
      )}
    </div>
  )
}
