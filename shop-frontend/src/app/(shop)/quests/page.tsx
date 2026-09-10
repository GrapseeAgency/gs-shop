'use client'

import { useEffect, useState } from 'react'
import { Target, Gift, CheckCircle, Circle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

export default function QuestsPage() {
  const [quests, setQuests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQuests()
  }, [])

  const fetchQuests = async () => {
    try {
      const res = await fetch('/api/gamification/quests')
      if (res.ok) {
        const data = await res.json()
        setQuests(data.quests || [])
      }
    } catch (error) {
      console.error('Error fetching quests:', error)
    } finally {
      setLoading(false)
    }
  }

  const claimReward = async (questId: string) => {
    try {
      const res = await fetch('/api/gamification/quests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questId, increment: 1 })
      })

      if (res.ok) {
        const data = await res.json()
        if (data.completed) {
          toast.success(data.message)
        }
        fetchQuests()
      }
    } catch (error) {
      toast.error('Failed to update quest')
    }
  }

  if (loading) {
    return (
      <div className="container max-w-3xl py-8">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const activeQuests = quests.filter(q => q.status === 'in_progress' || q.status === 'available')
  const completedQuests = quests.filter(q => q.status === 'completed')

  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Target className="h-6 w-6 text-emerald-500" />
          Shopping Quests
        </h1>
        <p className="text-muted-foreground">
          Complete challenges to earn rewards and exclusive badges
        </p>
      </div>

      {/* Active Quests */}
      <div className="space-y-4 mb-8">
        <h2 className="font-semibold text-lg">Active Quests</h2>
        {activeQuests.map((quest) => (
          <Card key={quest.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <Circle className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{quest.title}</h3>
                    <Badge variant="secondary">
                      <Gift className="h-3 w-3 mr-1" />
                      +{quest.reward.points} pts
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {quest.description}
                  </p>
                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{quest.progress || 0}/{quest.requirement.count}</span>
                    </div>
                    <Progress value={quest.percent || 0} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Completed Quests */}
      {completedQuests.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-lg">Completed</h2>
          {completedQuests.map((quest) => (
            <Card key={quest.id} className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-emerald-600">{quest.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Completed on {new Date(quest.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className="bg-emerald-500">Done!</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
