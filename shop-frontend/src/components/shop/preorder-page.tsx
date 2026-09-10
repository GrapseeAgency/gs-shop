'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useShopStore } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import { Package as Crystal, Clock, Bell, ChevronRight, Gift, CheckCircle, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

interface PreorderProduct {
  id: string
  name: string
  image: string | null
  fullPrice: number
  deposit: number
  estimatedShip: string
  preorderCount: number
  maxPreorders: number
  bonusItems: string[]
  status: string
}

interface UpcomingProduct {
  name: string
  expectedDate: string
  notifyCount: number
}

const statusColors: Record<string, string> = {
  open: 'bg-green-500/20 text-green-400 border-green-500/30',
  'almost-full': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  full: 'bg-red-500/20 text-red-400 border-red-500/30',
}

export function PreorderPage() {
  const [products, setProducts] = useState<PreorderProduct[]>([])
  const [upcoming, setUpcoming] = useState<UpcomingProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [notifyEmail, setNotifyEmail] = useState('')
  const [notifySuccess, setNotifySuccess] = useState<string | null>(null)
  const { goHome } = useShopRouter()

  useEffect(() => {
    fetch('/api/preorder')
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || [])
        setUpcoming(data.upcoming || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleNotify = (productName: string) => {
    if (!notifyEmail) return
    setNotifySuccess(productName)
    setNotifyEmail('')
    setTimeout(() => setNotifySuccess(null), 3000)
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="px-4 py-6">
        <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />)}</div>
      </div>
    )
  }

  return (
    <div className="px-4 py-4 pb-24">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
        <button onClick={goHome} className="text-xs text-muted-foreground mb-2"> Back</button>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Crystal className="h-6 w-6 text-orange-500" /> Preorder Center
        </h1>
        <p className="text-xs text-muted-foreground mt-1">Be first to get upcoming products + bonuses</p>
      </motion.div>

      {/* Preorder Products */}
      <div className="space-y-3 mb-6">
        {products.map((product, idx) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="rounded-xl border border-border bg-card p-4"
          >
            {/* Product Image Placeholder + Info */}
            <div className="flex gap-3 mb-3">
              <div className="h-20 w-20 rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center flex-shrink-0">
                <Crystal className="h-8 w-8 text-orange-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-bold text-foreground truncate">{product.name}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColors[product.status] || ''}`}>
                    {product.status === 'open' ? 'Open' : product.status === 'almost-full' ? 'Almost Full' : 'Full'}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1">
                  <Clock className="h-3 w-3" />
                  <span>Ships: {formatDate(product.estimatedShip)}</span>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="flex items-baseline gap-3 mb-3 p-2 rounded-lg bg-muted/50">
              <div>
                <p className="text-[10px] text-muted-foreground">Deposit</p>
                <p className="text-base font-bold text-primary">{product.deposit.toLocaleString()}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-[10px] text-muted-foreground">Full Price</p>
                <p className="text-sm font-medium text-foreground">{product.fullPrice.toLocaleString()}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-[10px] text-muted-foreground">Remaining</p>
                <p className="text-xs text-muted-foreground">{(product.fullPrice - product.deposit).toLocaleString()}</p>
              </div>
            </div>

            {/* Preorder Progress */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-muted-foreground">{product.preorderCount} preordered</span>
                <span className="text-[10px] text-muted-foreground">{product.maxPreorders} max</span>
              </div>
              <Progress value={(product.preorderCount / product.maxPreorders) * 100} className="h-2" />
            </div>

            {/* Bonus Items */}
            <div className="mb-3">
              <p className="text-[10px] font-medium text-foreground mb-1 flex items-center gap-1">
                <Gift className="h-3 w-3 text-orange-400" /> Preorder Bonuses
              </p>
              <div className="flex flex-wrap gap-1">
                {product.bonusItems.map(bonus => (
                  <span key={bonus} className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                    {bonus}
                  </span>
                ))}
              </div>
            </div>

            {/* Action */}
            <Button
              size="sm"
              className="w-full"
              disabled={product.status === 'full'}
            >
              {product.status === 'full' ? 'Sold Out' : product.status === 'almost-full' ? 'Preorder Now (Almost Full!)' : 'Preorder Now'}
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Upcoming Products */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
          <Bell className="h-4 w-4" /> Coming Soon
        </h2>
        <div className="space-y-2 mb-4">
          {upcoming.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border/50"
            >
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <Crystal className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground">{item.name}</p>
                <p className="text-[10px] text-muted-foreground">Expected: {item.expectedDate}  {item.notifyCount} notified</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNotify(item.name)}
                className="text-[10px] h-7"
              >
                <Bell className="h-3 w-3 mr-1" /> Notify Me
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Notify Email Input */}
        <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
          <p className="text-xs text-muted-foreground mb-2">Enter your email to get notified about upcoming products:</p>
          <div className="flex gap-2">
            <input
              type="email"
              value={notifyEmail}
              onChange={e => setNotifyEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 h-9 rounded-lg bg-background border border-border px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <Button size="sm" onClick={() => handleNotify('upcoming')} className="h-9">Notify</Button>
          </div>
          {notifySuccess && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[10px] text-green-500 mt-2 flex items-center gap-1"
            >
              <CheckCircle className="h-3 w-3" /> You'll be notified about {notifySuccess}!
            </motion.p>
          )}
        </div>
      </motion.div>
    </div>
  )
}

