'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Gift, Palette, MessageSquare, Ribbon,
  Check, ShoppingCart, Star, Sparkles, Image,
  PartyPopper, Crown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { useShopStore } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import { formatPrice } from '@/components/shop/product-card'
import { toast } from 'sonner'

interface WrappingDesign {
  id: string
  name: string
  price: number
  color: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  popular?: boolean
}

const wrappingDesigns: WrappingDesign[] = [
  { id: 'classic', name: 'Classic', price: 29, color: '#8B4513', icon: Gift, description: 'Elegant kraft paper with gold ribbon' },
  { id: 'birthday', name: 'Birthday', price: 39, color: '#FF6B9D', icon: PartyPopper, description: 'Colorful confetti with balloon accents', popular: true },
  { id: 'wedding', name: 'Wedding', price: 49, color: '#F5F5DC', icon: Sparkles, description: 'White satin with lace detail' },
  { id: 'holiday', name: 'Holiday', price: 35, color: '#C41E3A', icon: Star, description: 'Festive snowflakes and holly' },
  { id: 'premium', name: 'Premium', price: 69, color: '#1a1a2e', icon: Crown, description: 'Luxury matte black with rose gold', popular: true },
  { id: 'custom', name: 'Custom', price: 89, color: '#6366f1', icon: Palette, description: 'Design your own wrapping style' },
]

const ribbonColors = [
  { name: 'Gold', color: '#FFD700' },
  { name: 'Silver', color: '#C0C0C0' },
  { name: 'Rose', color: '#FF69B4' },
  { name: 'Red', color: '#DC143C' },
  { name: 'Navy', color: '#1B2A4A' },
]

interface WrappingData {
  designs: WrappingDesign[]
}

export function GiftWrappingPage() {
  const { goBack } = useShopRouter()
  const { addToCart } = useShopStore()
  const [selectedDesign, setSelectedDesign] = useState<string | null>(null)
  const [selectedRibbon, setSelectedRibbon] = useState(0)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [designs, setDesigns] = useState<WrappingDesign[]>(wrappingDesigns)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/gift-wrapping')
        if (res.ok) {
          const data: WrappingData = await res.json()
          if (data.designs?.length) setDesigns(data.designs)
        }
      } catch { /* silent */ }
      setLoading(false)
    }
    fetchData()
  }, [])

  const activeDesign = designs.find(d => d.id === selectedDesign)
  const charCount = message.length
  const isCharOver = charCount > 200

  return (
    <motion.div className="min-h-screen bg-background pb-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={goBack} className="flex-shrink-0 text-muted-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" /> Gift Wrapping
            </h1>
          </div>
        </div>
      </div>

      {/* Preview Card */}
      <div className="mx-4 mt-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDesign || 'empty'}
            className="rounded-2xl border border-border/50 bg-card overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="relative aspect-[16/9] flex items-center justify-center" style={{ backgroundColor: activeDesign?.color || '#2a2a2a' }}>
              <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 4 }}>
                {(() => { const Icon = activeDesign?.icon || Gift; return <Icon className="h-16 w-16 text-white" />; })()}
              </motion.div>
              {activeDesign && (
                <div className="absolute top-3 right-3">
                  <Badge className="bg-background/80 text-foreground backdrop-blur-sm text-[10px]">
                    {formatPrice(activeDesign.price)}
                  </Badge>
                </div>
              )}
              {/* Ribbon indicator */}
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full border border-white/30" style={{ backgroundColor: ribbonColors[selectedRibbon].color }} />
                <span className="text-[10px] text-white/80">{ribbonColors[selectedRibbon].name} ribbon</span>
              </div>
            </div>
            <div className="p-3">
              <p className="text-sm font-bold text-foreground">{activeDesign?.name || 'Select a Design'}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{activeDesign?.description || 'Choose from our premium wrapping options'}</p>
              {message && (
                <div className="mt-2 rounded-lg bg-muted/30 p-2">
                  <p className="text-[10px] text-muted-foreground italic">&quot;{message}&quot;</p>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Wrapping Design Cards */}
      <div className="mx-4 mt-4">
        <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-1.5">
          <Palette className="h-4 w-4 text-primary" /> Choose Design
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {designs.map((design, index) => (
            <motion.button
              key={design.id}
              className={`relative rounded-xl border p-2.5 text-center transition-all ${
                selectedDesign === design.id
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                  : 'border-border/50 bg-card'
              }`}
              onClick={() => setSelectedDesign(design.id)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              whileTap={{ scale: 0.95 }}
            >
              {design.popular && (
                <div className="absolute -top-1.5 -right-1.5">
                  <Badge className="bg-amber-500 text-white text-[7px] h-4 px-1.5">
                    <Star className="h-2.5 w-2.5 mr-0.5" /> Popular
                  </Badge>
                </div>
              )}
              <div className="h-8 w-8 mx-auto rounded-lg mb-1.5 flex items-center justify-center" style={{ backgroundColor: design.color + '30' }}>
                {(() => { const Icon = design.icon; return <Icon className="h-4 w-4" />; })()}
              </div>
              <p className="text-[10px] font-medium text-foreground">{design.name}</p>
              <p className="text-[9px] text-primary font-bold">{formatPrice(design.price)}</p>
              {selectedDesign === design.id && (
                <motion.div className="absolute top-1 left-1" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <Check className="h-3.5 w-3.5 text-primary" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Ribbon Color Selector */}
      <div className="mx-4 mt-4">
        <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-1.5">
          <Ribbon className="h-4 w-4 text-primary" /> Ribbon Color
        </h3>
        <div className="flex gap-3">
          {ribbonColors.map((ribbon, index) => (
            <motion.button
              key={ribbon.name}
              className={`relative h-9 w-9 rounded-full border-2 transition-all ${
                selectedRibbon === index ? 'border-primary scale-110' : 'border-border/50'
              }`}
              style={{ backgroundColor: ribbon.color }}
              onClick={() => setSelectedRibbon(index)}
              whileTap={{ scale: 0.9 }}
            >
              {selectedRibbon === index && (
                <motion.div className="absolute inset-0 flex items-center justify-center" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <Check className={`h-3.5 w-3.5 ${['Gold', 'Silver', 'Rose'].includes(ribbon.name) ? 'text-white' : 'text-white'}`} />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5">{ribbonColors[selectedRibbon].name} ribbon selected</p>
      </div>

      {/* Personal Message */}
      <div className="mx-4 mt-4">
        <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-1.5">
          <MessageSquare className="h-4 w-4 text-primary" /> Personal Message
        </h3>
        <div className="relative">
          <Textarea
            placeholder="Write a heartfelt message..."
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, 200))}
            className="min-h-[80px] text-sm bg-muted/30 border-border/30 resize-none"
          />
          <span className={`absolute bottom-2 right-2 text-[9px] ${isCharOver ? 'text-red-500' : 'text-muted-foreground'}`}>
            {charCount}/200
          </span>
        </div>
      </div>

      {/* Gallery Examples */}
      <div className="mx-4 mt-4">
        <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-1.5">
          <Image className="h-4 w-4 text-primary" /> Wrapping Examples
        </h3>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {['', '', '', '', '', ''].map((emoji, i) => (
            <motion.div
              key={i}
              className="flex-shrink-0 h-20 w-20 rounded-xl border border-border/50 bg-gradient-to-br from-primary/5 to-muted/20 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <span className="text-3xl">{emoji}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Add to Order */}
      <div className="mx-4 mt-4">
        <Button
          className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
          disabled={!selectedDesign}
          onClick={() => {
            if (!activeDesign) return
            addToCart({
              productId: `gift-wrap-${activeDesign.id}`,
              name: `Gift Wrapping: ${activeDesign.name}`,
              price: activeDesign.price,
              quantity: 1,
              imageUrl: null,
            })
            toast.success(`Gift wrapping added! `)
          }}
        >
          <Sparkles className="h-4 w-4" />
          Add to Order {activeDesign ? ` ${formatPrice(activeDesign.price)}` : ''}
        </Button>
      </div>
    </motion.div>
  )
}
