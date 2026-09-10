'use client'

import { useState } from 'react'
import { Heart, ShoppingBag, AlertCircle, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export function NeedWantTagger({ productId, productName }: { productId: string; productName: string }) {
  const [tagged, setTagged] = useState<string | null>(null)
  const [showReason, setShowReason] = useState(false)
  const [reason, setReason] = useState('')

  const tagItem = async (type: 'need' | 'want') => {
    try {
      const res = await fetch('/api/nudge/need-want-tagger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          productName,
          type,
          reason: reason || undefined
        })
      })

      if (res.ok) {
        setTagged(type)
        toast.success(`Tagged as ${type === 'need' ? 'a need' : 'a want'}!`)
      }
    } catch (error) {
      toast.error('Failed to tag')
    }
  }

  if (tagged) {
    return (
      <Card className="border-l-4 border-l-emerald-500">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-500" />
            <span className="text-sm">
              Tagged as <Badge variant={tagged === 'need' ? 'default' : 'secondary'}>{tagged}</Badge>
            </span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Need vs Want Check
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Tag this purchase to track your spending habits
        </p>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => tagItem('need')}
          >
            <ShoppingBag className="h-4 w-4 mr-1" />
            Need
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => {
              setShowReason(true)
              tagItem('want')
            }}
          >
            <Heart className="h-4 w-4 mr-1" />
            Want
          </Button>
        </div>

        {showReason && (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Why do you want this? (optional)"
              className="w-full px-3 py-2 text-sm border rounded-md"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
