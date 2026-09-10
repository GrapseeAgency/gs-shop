'use client'

import { useState, useEffect } from 'react'
import { Heart, TrendingUp, Award, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

export default function DonationTrackerPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDonationData()
  }, [])

  const fetchDonationData = async () => {
    try {
      const res = await fetch('/api/lifestyle/donation-tracker')
      if (res.ok) {
        const data = await res.json()
        setData(data)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Heart className="h-8 w-8 text-rose-500" />
          Your Impact
        </h1>
        <p className="text-muted-foreground">
          Track your donations and see the difference you're making
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-rose-500" />
            <p className="text-sm text-muted-foreground">Total Donated</p>
            <p className="text-2xl font-bold">{data?.totalDonated?.toLocaleString() || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Gift className="h-8 w-8 mx-auto mb-2 text-rose-500" />
            <p className="text-sm text-muted-foreground">Donations</p>
            <p className="text-2xl font-bold">{data?.donationCount || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 mx-auto mb-2 text-rose-500" />
            <p className="text-sm text-muted-foreground">Streak</p>
            <p className="text-2xl font-bold">{data?.streak || 0} months</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Heart className="h-8 w-8 mx-auto mb-2 text-rose-500" />
            <p className="text-sm text-muted-foreground">Lives Impacted</p>
            <p className="text-2xl font-bold">{data?.impact?.livesImpacted || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Impact Details */}
      {data?.impact && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Your Impact Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-rose-50 rounded-lg">
                <p className="text-3xl font-bold text-rose-600">{data.impact.mealsProvided}</p>
                <p className="text-sm text-rose-700">Meals Provided</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-3xl font-bold text-green-600">{data.impact.treesPlanted}</p>
                <p className="text-sm text-green-700">Trees Planted</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">{data.impact.educationDays}</p>
                <p className="text-sm text-blue-700">Education Days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Badges */}
      {data?.badges && data.badges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data.badges.map((badge: any) => (
                <Badge key={badge.name} variant="secondary" className="text-lg py-2 px-4">
                  <span className="mr-2">{badge.icon}</span>
                  {badge.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
