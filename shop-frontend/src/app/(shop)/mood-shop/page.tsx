'use client'

import { useState } from 'react'
import { Smile, Frown, Zap, Heart, BookOpen, PartyPopper } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ProductCard } from '@/components/shop/product-card'
import { toast } from 'sonner'

const MOODS = [
  { id: 'happy', name: 'Happy', icon: Smile, color: 'from-yellow-400 to-amber-500', desc: 'Celebrate the good vibes!' },
  { id: 'excited', name: 'Excited', icon: Zap, color: 'from-orange-400 to-red-500', desc: 'Channel that energy!' },
  { id: 'romantic', name: 'Romantic', icon: Heart, color: 'from-pink-400 to-rose-500', desc: 'Set the mood' },
  { id: 'bored', name: 'Bored', icon: BookOpen, color: 'from-slate-400 to-gray-500', desc: 'Time for something new' },
  { id: 'stressed', name: 'Stressed', icon: Heart, color: 'from-blue-400 to-cyan-500', desc: 'Find your calm' },
  { id: 'sad', name: 'Sad', icon: Frown, color: 'from-indigo-400 to-blue-500', desc: 'Take care of yourself' }
]

export default function MoodShoppingPage() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const handleMoodSelect = async (moodId: string) => {
    setSelectedMood(moodId)
    setLoading(true)

    try {
      const res = await fetch('/api/mood-shopping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood: moodId, intensity: 'medium' })
      })

      if (res.ok) {
        const data = await res.json()
        setProducts(data.products)
        toast.success(data.message)
      }
    } catch (error) {
      toast.error('Failed to load recommendations')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <PartyPopper className="h-8 w-8 text-amber-500" />
          Mood-Based Shopping
        </h1>
        <p className="text-muted-foreground mt-2">
          How are you feeling? We will curate products to match your mood!
        </p>
      </div>

      {!selectedMood ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {MOODS.map((mood) => {
            const Icon = mood.icon
            return (
              <button
                key={mood.id}
                onClick={() => handleMoodSelect(mood.id)}
                className={`p-6 rounded-2xl bg-gradient-to-br ${mood.color} text-white hover:scale-105 transition-all shadow-lg`}
              >
                <div className="mb-2 flex justify-center"><Icon className="h-10 w-10" /></div>
                <h3 className="font-bold text-lg">{mood.name}</h3>
                <p className="text-sm text-white/80 mt-1">{mood.desc}</p>
              </button>
            )
          })}
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">
                <span className="inline-flex items-center gap-2">
                {(() => { const SelectedIcon = MOODS.find(m => m.id === selectedMood)?.icon ?? Smile; return <SelectedIcon className="h-8 w-8" />; })()}
                For when you&apos;re feeling {selectedMood}
              </span>
              </h2>
              <p className="text-muted-foreground">
                Curated just for your current vibe
              </p>
            </div>
            <Button variant="outline" onClick={() => setSelectedMood(null)}>
              Change Mood
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-64 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {products.length === 0 && !loading && (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No products found for this mood. Try another!</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
