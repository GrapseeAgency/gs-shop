'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bell, BellOff, Search, Package, Clock, Filter } from 'lucide-react'
import { useShopStore } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'

interface StockProduct {
  id: string
  name: string
  price: number
  imageUrl: string | null
  category: string
  status: 'active' | 'notified' | 'expired'
  estimatedRestock: string
  notifyEnabled: boolean
}



const categories = []

export function StockNotificationsPage() {
  const router = useShopRouter()
  const [products, setProducts] = useState<StockProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/stock-notifications')
        if (res.ok) {
          const data = await res.json()
          setProducts(Array.isArray(data) ? data : data.data ?? [])
        } else {
          setProducts([])
        }
      } catch {
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const toggleNotify = (id: string) => {
    setProducts(prev => prev.map(p =>
      p.id === id ? { ...p, notifyEnabled: !p.notifyEnabled, status: !p.notifyEnabled ? 'active' : 'expired' } : p
    ))
  }

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchCat = selectedCategory === 'All' || p.category === selectedCategory
    return matchSearch && matchCat
  })

  const statusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'notified': return 'bg-blue-500'
      case 'expired': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  const statusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Watching'
      case 'notified': return 'In Stock!'
      case 'expired': return 'Expired'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Stock Notifications
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Get notified when out-of-stock items are back</p>
      </div>

      {/* Search */}
      <div className="px-4 py-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-card border border-border pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="px-4 py-2">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 py-2">
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-card border border-border p-3 text-center">
            <div className="text-lg font-bold text-green-500">{products.filter(p => p.status === 'active').length}</div>
            <div className="text-[10px] text-muted-foreground">Watching</div>
          </div>
          <div className="rounded-xl bg-card border border-border p-3 text-center">
            <div className="text-lg font-bold text-blue-500">{products.filter(p => p.status === 'notified').length}</div>
            <div className="text-[10px] text-muted-foreground">In Stock</div>
          </div>
          <div className="rounded-xl bg-card border border-border p-3 text-center">
            <div className="text-lg font-bold text-gray-400">{products.filter(p => p.status === 'expired').length}</div>
            <div className="text-[10px] text-muted-foreground">Expired</div>
          </div>
        </div>
      </div>

      {/* Product List */}
      <div className="px-4 py-2 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <BellOff className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No notifications found</p>
          </div>
        ) : (
          filtered.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-xl bg-card border border-border p-4"
            >
              <div className="flex items-start gap-3">
                {/* Product Image Placeholder */}
                <div className="h-14 w-14 rounded-lg bg-muted/30 flex items-center justify-center shrink-0">
                  <Package className="h-6 w-6 text-muted-foreground" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-foreground truncate">{product.name}</h3>
                    <div className={`shrink-0 flex items-center gap-1.5 rounded-full px-2 py-0.5 ${statusColor(product.status)} bg-opacity-20`}>
                      <div className={`h-1.5 w-1.5 rounded-full ${statusColor(product.status)}`} />
                      <span className="text-[10px] font-medium text-foreground">{statusLabel(product.status)}</span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mt-0.5">{product.category}</p>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Restock: {product.estimatedRestock}</span>
                    </div>
                    <span className="text-sm font-bold text-primary">{product.price.toLocaleString()}</span>
                  </div>

                  {/* Toggle */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                    <span className="text-xs text-muted-foreground">
                      {product.notifyEnabled ? 'Notifications ON' : 'Notifications OFF'}
                    </span>
                    <button
                      onClick={() => toggleNotify(product.id)}
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        product.notifyEnabled ? 'bg-primary' : 'bg-muted'
                      }`}
                    >
                      <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-glass-deep shadow transition-transform ${
                        product.notifyEnabled ? 'translate-x-5.5' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* How It Works */}
      <div className="px-4 py-4 mt-2">
        <h2 className="text-base font-bold text-foreground mb-3">How It Works</h2>
        <div className="space-y-3">
          {[
            { step: '1', title: 'Find a Product', desc: 'Browse out-of-stock items you want' },
            { step: '2', title: 'Enable Notification', desc: 'Toggle on to get restock alerts' },
            { step: '3', title: 'Get Notified', desc: 'We alert you when it\'s back in stock' },
          ].map(item => (
            <div key={item.step} className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-primary">{item.step}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

