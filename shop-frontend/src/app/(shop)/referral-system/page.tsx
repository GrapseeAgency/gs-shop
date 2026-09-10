'use client'

import { useState } from 'react'
import { Gift, Share2, Users, DollarSign, Copy, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function ReferralSystemPage() {
  const [referralCode] = useState('GRAPSEE500')
  const [copied, setCopied] = useState(false)
  const [stats] = useState({
    referrals: 12,
    earned: 6000,
    pending: 1500
  })

  const copyCode = () => {
    setCopied(true)
    toast.success('Referral code copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <Gift className="h-10 w-10 text-pink-600" />
          Refer & Earn
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Both you and your friend get 500 credit
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <p className="text-3xl font-bold">{stats.referrals}</p>
            <p className="text-sm text-muted-foreground">Friends Referred</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <p className="text-3xl font-bold">{stats.earned}</p>
            <p className="text-sm text-muted-foreground">Total Earned</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Gift className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <p className="text-3xl font-bold">{stats.pending}</p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">Your Referral Code</h2>
            <p className="text-muted-foreground">Share this code with friends</p>
          </div>
          
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="bg-muted px-6 py-4 rounded-lg">
              <p className="text-3xl font-bold tracking-wider">{referralCode}</p>
            </div>
            <Button size="lg" onClick={copyCode}>
              {copied ? <CheckCircle className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
            </Button>
          </div>

          <div className="flex justify-center gap-4">
            <Button variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Share on WhatsApp
            </Button>
            <Button variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Share on Email
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Share2 className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-bold mb-1">1. Share</h3>
              <p className="text-sm text-muted-foreground">Send your code to friends</p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-bold mb-1">2. They Buy</h3>
              <p className="text-sm text-muted-foreground">Friend makes first purchase</p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Gift className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-bold mb-1">3. Both Win</h3>
              <p className="text-sm text-muted-foreground">You both get 500 credit</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
