'use client'

import { useEffect, useState } from 'react'
import { Bell, Mail, MessageSquare, Smartphone, Gift, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const NOTIFICATION_TYPES = [
  {
    id: 'priceDrops',
    name: 'Price Drop Alerts',
    description: 'Notify me when wishlist items drop in price',
    icon: Bell
  },
  {
    id: 'backInStock',
    name: 'Back in Stock',
    description: 'Notify when sold-out items become available',
    icon: Bell
  },
  {
    id: 'newArrivals',
    name: 'New Arrivals',
    description: 'Get notified about new products in categories I follow',
    icon: Bell
  },
  {
    id: 'orderMilestones',
    name: 'Order Updates',
    description: 'Shipping, delivery, and order status updates',
    icon: Bell
  },
  {
    id: 'dealExpiry',
    name: 'Deal Reminders',
    description: 'Reminders before flash sales and deals expire',
    icon: Bell
  },
  {
    id: 'reviewReminders',
    description: 'Remind me to review purchased products',
    name: 'Review Reminders',
    icon: MessageSquare
  },
  {
    id: 'birthdayOffers',
    name: 'Birthday Rewards',
    description: 'Special offers and discounts for my birthday',
    icon: Bell
  },
  {
    id: 'lowStock',
    name: 'Low Stock Alerts',
    description: 'Notify when items in my cart are running low',
    icon: Bell
  },
  // Phase 2: New notification types
  {
    id: 'treasureHunt',
    name: 'Treasure Hunt Codes',
    description: 'Alert when new treasure codes are hidden',
    icon: Gift
  },
  {
    id: 'bingoComplete',
    name: 'Bingo Achievements',
    description: 'Notify when you complete a bingo line',
    icon: Bell
  },
  {
    id: 'duelEnding',
    name: 'Product Duel Updates',
    description: 'Updates on duels you participated in',
    icon: Bell
  },
  {
    id: 'liveShopping',
    name: 'Live Shopping Events',
    description: 'Notifications for live shopping streams',
    icon: Bell
  },
  {
    id: 'culturalEvents',
    name: 'Cultural & Festival Deals',
    description: 'Special deals for Eid, Puja, Boishakh and more',
    icon: Bell
  },
  {
    id: 'friendActivity',
    name: 'Friend Activity',
    description: 'See what friends are buying (opt-in only)',
    icon: Users
  },
  {
    id: 'weatherDeals',
    name: 'Weather-Based Deals',
    description: 'Get deals based on current weather',
    icon: Bell
  },
  {
    id: 'smartReorder',
    name: 'Smart Reorder Reminders',
    description: 'Reminders to reorder products you use regularly',
    icon: Bell
  }
]

export default function NotificationPreferencesPage() {
  const [preferences, setPreferences] = useState<Record<string, boolean>>({})
  const [channels, setChannels] = useState({
    email: true,
    push: true,
    sms: false
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPreferences()
  }, [])

  const fetchPreferences = async () => {
    try {
      const res = await fetch('/api/notifications/preferences')
      if (res.ok) {
        const data = await res.json()
        setPreferences(data.preferences || {})
        setChannels(data.channels || { email: true, push: true, sms: false })
      }
    } catch (error) {
      console.error('Error fetching preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  const togglePreference = async (id: string, value: boolean) => {
    const newPreferences = { ...preferences, [id]: value }
    setPreferences(newPreferences)

    try {
      await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: newPreferences })
      })
    } catch (error) {
      toast.error('Failed to save preference')
    }
  }

  const toggleChannel = async (channel: string, value: boolean) => {
    const newChannels = { ...channels, [channel]: value }
    setChannels(newChannels)

    try {
      await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channels: newChannels })
      })
    } catch (error) {
      toast.error('Failed to save channel preference')
    }
  }

  if (loading) {
    return (
      <div className="container max-w-2xl py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/2" />
          <div className="h-96 bg-muted rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="h-6 w-6" />
          Notification Preferences
        </h1>
        <p className="text-muted-foreground">
          Choose what notifications you want to receive and how
        </p>
      </div>

      {/* Channels */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Notification Channels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label htmlFor="email">Email</Label>
                <p className="text-xs text-muted-foreground">Receive notifications via email</p>
              </div>
            </div>
            <Switch
              id="email"
              checked={channels.email}
              onCheckedChange={(v) => toggleChannel('email', v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label htmlFor="push">Push Notifications</Label>
                <p className="text-xs text-muted-foreground">Browser push notifications</p>
              </div>
            </div>
            <Switch
              id="push"
              checked={channels.push}
              onCheckedChange={(v) => toggleChannel('push', v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label htmlFor="sms">SMS</Label>
                <p className="text-xs text-muted-foreground">Text message notifications</p>
              </div>
            </div>
            <Switch
              id="sms"
              checked={channels.sms}
              onCheckedChange={(v) => toggleChannel('sms', v)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Types */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notification Types</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {NOTIFICATION_TYPES.map((type) => (
            <div key={type.id} className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <type.icon className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <Label htmlFor={type.id} className="font-medium">
                    {type.name}
                  </Label>
                  <p className="text-xs text-muted-foreground">{type.description}</p>
                </div>
              </div>
              <Switch
                id={type.id}
                checked={preferences[type.id] !== false}
                onCheckedChange={(v) => togglePreference(type.id, v)}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
