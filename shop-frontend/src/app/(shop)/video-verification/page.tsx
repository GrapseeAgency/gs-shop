'use client'

import { useState } from 'react'
import { Video, Phone, User, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function VideoVerificationPage() {
  const [requesting, setRequesting] = useState(false)
  const [status, setStatus] = useState<'idle' | 'requested' | 'scheduled'>('idle')

  const requestCall = async () => {
    setRequesting(true)
    
    try {
      const res = await fetch('/api/trust/video-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: 'demo-product',
          preferredTime: new Date(Date.now() + 3600000).toISOString()
        })
      })
      
      if (res.ok) {
        setStatus('requested')
        toast.success('Video call requested!')
      }
    } catch (error) {
      toast.error('Request failed')
    } finally {
      setRequesting(false)
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Video className="h-8 w-8 text-indigo-600" />
          Video Call Verification
        </h1>
        <p className="text-muted-foreground">
          See the actual product in real-time before buying
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">1</div>
              <div>
                <p className="font-medium">Request a call</p>
                <p className="text-sm text-muted-foreground">Select product and preferred time</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">2</div>
              <div>
                <p className="font-medium">Seller accepts</p>
                <p className="text-sm text-muted-foreground">Get confirmation within minutes</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">3</div>
              <div>
                <p className="font-medium">2-min video call</p>
                <p className="text-sm text-muted-foreground">See the product in seller's hand</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Schedule Call
            </CardTitle>
          </CardHeader>
          <CardContent>
            {status === 'idle' ? (
              <div className="text-center py-6">
                <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  See the actual human behind the store
                </p>
                <Button size="lg" onClick={requestCall} disabled={requesting}>
                  {requesting ? 'Requesting...' : 'Request Video Call'}
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <Clock className="h-16 w-16 mx-auto mb-4 text-indigo-500" />
                <Badge className="mb-2">Pending</Badge>
                <p className="font-medium">Call Requested!</p>
                <p className="text-sm text-muted-foreground">
                  Waiting for seller confirmation...
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
