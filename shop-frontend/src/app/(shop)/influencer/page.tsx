'use client'

import { useState } from 'react'
import { Star, Users, ExternalLink, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const INFLUENCERS = [
  {
    id: '1',
    name: 'Tech Reviewer Pro',
    handle: '@techreviewer',
    followers: '125K',
    niche: 'Tech Reviews',
    rating: 4.9,
    collections: 12,
    avatar: null
  },
  {
    id: '2',
    name: 'Design Guru',
    handle: '@designguru',
    followers: '89K',
    niche: 'UI/UX Design',
    rating: 4.8,
    collections: 8,
    avatar: null
  },
  {
    id: '3',
    name: 'Code Master',
    handle: '@codemaster',
    followers: '210K',
    niche: 'Development',
    rating: 4.9,
    collections: 15,
    avatar: null
  }
]

export default function InfluencerPage() {
  const [selectedInfluencer, setSelectedInfluencer] = useState<string | null>(null)

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Star className="h-6 w-6 text-amber-500" />
          Influencer Storefronts
        </h1>
        <p className="text-muted-foreground">
          Discover curated collections from industry experts
        </p>
      </div>

      {/* Influencer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {INFLUENCERS.map((influencer) => (
          <Card 
            key={influencer.id}
            className="cursor-pointer hover:shadow-lg transition-all"
            onClick={() => setSelectedInfluencer(influencer.id)}
          >
            <CardContent className="pt-6">
              <div className="text-center">
                <Avatar className="h-20 w-20 mx-auto mb-4">
                  <AvatarImage src={influencer.avatar || ''} />
                  <AvatarFallback className="text-2xl">
                    {influencer.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold">{influencer.name}</h3>
                <p className="text-sm text-muted-foreground">{influencer.handle}</p>
                <Badge variant="secondary" className="mt-2">
                  {influencer.niche}
                </Badge>
                <div className="flex items-center justify-center gap-4 mt-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {influencer.followers}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-amber-500" />
                    {influencer.rating}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {influencer.collections} curated collections
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Featured Collections */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Featured Collections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {['Best Website Builders 2024', 'Top Mobile App Frameworks', 'Essential DevOps Tools'].map((collection, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">{collection}</p>
                  <p className="text-xs text-muted-foreground">by {INFLUENCERS[index]?.name}</p>
                </div>
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Phase 2: Influencer Code Tracking & Earnings */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-emerald-500" />
            Influencer Savings Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-emerald-600">$127</p>
              <p className="text-xs text-muted-foreground">Total Saved</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold">8</p>
              <p className="text-xs text-muted-foreground">Codes Used</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold">3</p>
              <p className="text-xs text-muted-foreground">Influencers</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-emerald-50 rounded">
              <div>
                <p className="font-medium text-sm">@techreviewer</p>
                <p className="text-xs text-muted-foreground">Code: TECH10</p>
              </div>
              <p className="text-sm font-bold text-emerald-600">-$45 saved</p>
            </div>
            <div className="flex items-center justify-between p-2 bg-emerald-50 rounded">
              <div>
                <p className="font-medium text-sm">@designguru</p>
                <p className="text-xs text-muted-foreground">Code: DESIGN15</p>
              </div>
              <p className="text-sm font-bold text-emerald-600">-$52 saved</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phase 2: Buy Together Discount */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Buy Together - Group Discount
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Invite friends to buy together and unlock 20% off for everyone!
          </p>
          <div className="flex gap-2">
            <Button className="flex-1" variant="outline">
              Create Group
            </Button>
            <Button className="flex-1">
              Join Group
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            3 friends buying = 20% off for all  Valid for 24 hours
          </p>
        </CardContent>
      </Card>

      {/* Phase 2: Style Match - Find Similar Taste Users */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-purple-500" />
            Style Match
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Users with similar taste to you also bought:
          </p>
          <div className="space-y-3">
            {['Premium UI Kit', 'React Templates Bundle', 'Design System Pro'].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg cursor-pointer">
                <div className="h-10 w-10 bg-muted rounded" />
                <div className="flex-1">
                  <p className="font-medium text-sm">{item}</p>
                  <p className="text-xs text-muted-foreground">89% match with your style</p>
                </div>
                <Badge variant="secondary">Trending</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
