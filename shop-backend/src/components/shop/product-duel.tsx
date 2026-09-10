'use client'

import { useState } from 'react'
import { Swords, ThumbsUp, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'

interface ProductDuelProps {
  productA: any
  productB: any
}

export function ProductDuel({ productA, productB }: ProductDuelProps) {
  const [votes, setVotes] = useState({ a: 0, b: 0 })
  const [userVoted, setUserVoted] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleVote = async (choice: 'a' | 'b') => {
    if (userVoted) {
      toast.error('You already voted!')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/gamification/duel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productAId: productA.id,
          productBId: productB.id,
          choice
        })
      })

      if (res.ok) {
        const data = await res.json()
        setVotes(data.votes)
        setUserVoted(choice)
        toast.success('Vote recorded!')
      }
    } catch (error) {
      toast.error('Failed to vote')
    } finally {
      setLoading(false)
    }
  }

  const totalVotes = votes.a + votes.b
  const percentA = totalVotes > 0 ? Math.round((votes.a / totalVotes) * 100) : 50
  const percentB = totalVotes > 0 ? Math.round((votes.b / totalVotes) * 100) : 50

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Swords className="h-5 w-5 text-amber-500" />
            Product Duel
          </h3>
          <span className="text-xs text-muted-foreground">
            {totalVotes} votes
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Product A */}
          <div className={`p-4 rounded-lg border-2 transition-all ${
            userVoted === 'a' ? 'border-emerald-500 bg-emerald-50' : 'border-transparent bg-muted'
          }`}>
            <img 
              src={productA.imageUrl || '/placeholder.png'} 
              alt={productA.name}
              className="w-full h-32 object-cover rounded mb-2"
            />
            <p className="font-medium text-sm truncate">{productA.name}</p>
            <p className="text-xs text-muted-foreground">${productA.price}</p>
            
            <Button
              size="sm"
              variant={userVoted === 'a' ? 'default' : 'outline'}
              className="w-full mt-2 gap-1"
              onClick={() => handleVote('a')}
              disabled={!!userVoted || loading}
            >
              <ThumbsUp className="h-3 w-3" />
              {userVoted === 'a' ? 'Voted' : 'Vote'}
            </Button>
          </div>

          {/* Product B */}
          <div className={`p-4 rounded-lg border-2 transition-all ${
            userVoted === 'b' ? 'border-emerald-500 bg-emerald-50' : 'border-transparent bg-muted'
          }`}>
            <img 
              src={productB.imageUrl || '/placeholder.png'} 
              alt={productB.name}
              className="w-full h-32 object-cover rounded mb-2"
            />
            <p className="font-medium text-sm truncate">{productB.name}</p>
            <p className="text-xs text-muted-foreground">${productB.price}</p>
            
            <Button
              size="sm"
              variant={userVoted === 'b' ? 'default' : 'outline'}
              className="w-full mt-2 gap-1"
              onClick={() => handleVote('b')}
              disabled={!!userVoted || loading}
            >
              <ThumbsUp className="h-3 w-3" />
              {userVoted === 'b' ? 'Voted' : 'Vote'}
            </Button>
          </div>
        </div>

        {/* Results Bar */}
        {totalVotes > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="w-8">{productA.name.substring(0, 8)}...</span>
              <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all"
                  style={{ width: `${percentA}%` }}
                />
              </div>
              <span className="w-8 text-right">{percentA}%</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-8">{productB.name.substring(0, 8)}...</span>
              <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${percentB}%` }}
                />
              </div>
              <span className="w-8 text-right">{percentB}%</span>
            </div>
          </div>
        )}

        {/* Winner Announcement */}
        {percentA > 60 && (
          <p className="text-center text-sm text-emerald-600 mt-3">
             {productA.name} is winning!
          </p>
        )}
        {percentB > 60 && (
          <p className="text-center text-sm text-blue-600 mt-3">
             {productB.name} is winning!
          </p>
        )}
      </CardContent>
    </Card>
  )
}
