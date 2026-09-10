'use client'

import { useEffect, useState } from 'react'
import { Trophy, Medal, Crown, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'

const CATEGORIES = [
  { id: 'top_buyer', name: 'Top Buyers', icon: '' },
  { id: 'top_reviewer', name: 'Top Reviewers', icon: '' },
  { id: 'top_referrer', name: 'Top Referrers', icon: '' },
  { id: 'top_earner', name: 'Point Leaders', icon: '' }
]

const PERIODS = [
  { id: 'weekly', name: 'This Week' },
  { id: 'monthly', name: 'This Month' },
  { id: 'all_time', name: 'All Time' }
]

export default function LeaderboardPage() {
  const [category, setCategory] = useState('top_buyer')
  const [period, setPeriod] = useState('monthly')
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [userRank, setUserRank] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [category, period])

  const fetchLeaderboard = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/leaderboard?category=${category}&period=${period}`)
      if (res.ok) {
        const data = await res.json()
        setLeaderboard(data.leaderboard || [])
        setUserRank(data.userRank)
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
      toast.error('Failed to load leaderboard')
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-amber-500" />
    if (rank === 2) return <Medal className="h-5 w-5 text-slate-400" />
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-700" />
    return <span className="h-5 w-5 flex items-center justify-center font-bold text-sm">{rank}</span>
  }

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border-amber-500/30'
    if (rank === 2) return 'bg-gradient-to-r from-slate-400/20 to-slate-300/10 border-slate-400/30'
    if (rank === 3) return 'bg-gradient-to-r from-amber-700/20 to-amber-600/10 border-amber-700/30'
    if (rank <= 10) return 'bg-emerald-500/5 border-emerald-500/20'
    return ''
  }

  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="h-6 w-6 text-amber-500" />
          Leaderboard
        </h1>
        <p className="text-muted-foreground">
          Compete with others and climb the ranks!
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat.id}
            variant={category === cat.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategory(cat.id)}
            className="gap-1"
          >
            <span>{cat.icon}</span>
            <span className="hidden sm:inline">{cat.name}</span>
          </Button>
        ))}
      </div>

      {/* Period Selector */}
      <div className="flex justify-center gap-2 mb-6">
        {PERIODS.map((p) => (
          <Button
            key={p.id}
            variant={period === p.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setPeriod(p.id)}
          >
            {p.name}
          </Button>
        ))}
      </div>

      {/* User's Rank */}
      {userRank && (
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                {userRank.rank <= 3 ? (
                  userRank.rank === 1 ? <Crown className="h-6 w-6" /> : <Medal className="h-6 w-6" />
                ) : (
                  userRank.rank
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium">Your Rank</p>
                <p className="text-sm text-muted-foreground">
                  {userRank.userName || 'You'}  {userRank.score.toLocaleString()} points
                </p>
              </div>
              <Badge variant="secondary">
                Top {Math.min(Math.round((userRank.rank / (leaderboard.length + 1)) * 100), 100)}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>Top Performers</span>
            <span className="text-sm font-normal text-muted-foreground">
              {leaderboard.length} participants
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : leaderboard.length > 0 ? (
            <div className="divide-y">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.id || index}
                  className={`flex items-center gap-4 p-4 transition-colors ${
                    entry.userId === userRank?.userId ? 'bg-primary/5' : ''
                  } ${getRankStyle(index + 1)}`}
                >
                  {/* Rank */}
                  <div className="w-10 flex justify-center">
                    {getRankIcon(index + 1)}
                  </div>

                  {/* Avatar */}
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={entry.avatar} />
                    <AvatarFallback className="bg-muted">
                      {(entry.userName || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {entry.userName || `User ${index + 1}`}
                      {entry.userId === userRank?.userId && (
                        <Badge variant="secondary" className="ml-2 text-xs">You</Badge>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {entry.score.toLocaleString()} points
                    </p>
                  </div>

                  {/* Position Badge */}
                  {index < 3 && (
                    <Badge 
                      variant={index === 0 ? 'default' : 'secondary'}
                      className={index === 0 ? 'bg-amber-500 hover:bg-amber-600' : ''}
                    >
                      #{index + 1}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No data available for this period</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {leaderboard.length > 0 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button variant="outline" size="sm" disabled>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  )
}
