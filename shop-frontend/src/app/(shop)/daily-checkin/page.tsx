'use client'

import { useEffect, useState } from 'react'
import { Calendar, Flame, Gift, Trophy, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function DailyCheckInPage() {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [checkingIn, setCheckingIn] = useState(false)

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/daily-checkin')
      if (res.ok) {
        const data = await res.json()
        setStatus(data)
      }
    } catch (error) {
      console.error('Error fetching check-in status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckIn = async () => {
    setCheckingIn(true)
    try {
      const res = await fetch('/api/daily-checkin', {
        method: 'POST'
      })
      
      const data = await res.json()
      
      if (res.ok) {
        toast.success(data.message)
        fetchStatus()
      } else {
        toast.error(data.error || 'Already checked in today!')
      }
    } catch (error) {
      toast.error('Failed to check in')
    } finally {
      setCheckingIn(false)
    }
  }

  if (loading) {
    return (
      <div className="container max-w-2xl py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/2" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="h-6 w-6" />
          Daily Check-In
        </h1>
        <p className="text-muted-foreground">
          Check in daily to earn points and unlock streak bonuses!
        </p>
      </div>

      {/* Main Check-In Card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            {/* Streak Display */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                  <Flame className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-background border rounded-full px-3 py-1 text-sm font-bold">
                  {status?.currentStreak || 0} days
                </div>
              </div>
            </div>

            <div>
              <p className="text-2xl font-bold">
                {status?.hasCheckedInToday ? 'Already Checked In!' : 'Ready to Check In?'}
              </p>
              <p className="text-muted-foreground">
                {status?.hasCheckedInToday 
                  ? `Come back tomorrow to continue your ${status?.currentStreak} day streak!`
                  : 'Don\'t break your streak!'
                }
              </p>
            </div>

            {/* Today's Reward */}
            {!status?.hasCheckedInToday && (
              <div className="rounded-lg bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 p-4">
                <p className="text-sm text-muted-foreground mb-1">Today's Reward</p>
                <p className="text-2xl font-bold text-emerald-600">
                  +{status?.todayReward || 10} Points
                </p>
                <p className="text-xs text-muted-foreground">
                  Base: {status?.basePoints || 10} + Streak Bonus: {status?.streakBonus || 0}
                </p>
              </div>
            )}

            {/* Check In Button */}
            <Button
              size="lg"
              className="w-full gap-2"
              onClick={handleCheckIn}
              disabled={status?.hasCheckedInToday || checkingIn}
            >
              {checkingIn ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Checking In...
                </>
              ) : status?.hasCheckedInToday ? (
                <>
                  <Trophy className="h-4 w-4" />
                  Done for Today
                </>
              ) : (
                <>
                  <Gift className="h-4 w-4" />
                  Check In Now
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{status?.currentStreak || 0}</p>
            <p className="text-xs text-muted-foreground">Current Streak</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{status?.longestStreak || 0}</p>
            <p className="text-xs text-muted-foreground">Best Streak</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{status?.totalCheckIns || 0}</p>
            <p className="text-xs text-muted-foreground">Total Check-ins</p>
          </CardContent>
        </Card>
      </div>

      {/* Milestone Progress */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Next Milestone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{status?.currentStreak || 0} days</span>
              <span>{status?.nextMilestone || 7} days</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all"
                style={{ 
                  width: `${Math.min(((status?.currentStreak || 0) / (status?.nextMilestone || 7)) * 100, 100)}%` 
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {status?.daysToMilestone || 7} more days to unlock milestone bonus!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Milestone Rewards */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Milestone Rewards</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[7, 14, 30, 60, 100].map((days) => (
            <div 
              key={days}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                (status?.currentStreak || 0) >= days 
                  ? 'bg-emerald-500/10 border-emerald-500/20' 
                  : 'bg-muted/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  (status?.currentStreak || 0) >= days 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-muted'
                }`}>
                  {(status?.currentStreak || 0) >= days ? (
                    <Trophy className="h-4 w-4" />
                  ) : (
                    <Flame className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{days} Day Streak</p>
                  <p className="text-xs text-muted-foreground">+{days * 5} bonus points</p>
                </div>
              </div>
              {(status?.currentStreak || 0) >= days && (
                <span className="text-xs font-medium text-emerald-600">Claimed!</span>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="mt-6 text-center">
        <Button variant="outline" className="gap-2">
          View Leaderboard
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
