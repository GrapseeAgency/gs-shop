'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  ArrowLeft, Wallet, ArrowDownLeft, ArrowUpRight, Plus,
  Send, QrCode, Loader2, CreditCard, Sparkles, History
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useShopStore } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import { formatPrice } from '@/components/shop/product-card'

interface WalletTransaction {
  id: string
  type: string
  amount: number
  description: string
  referenceId: string | null
  createdAt: string
}

interface WalletData {
  id: string
  userId: string
  balance: number
  currency: string
  transactions: WalletTransaction[]
  createdAt: string
  updatedAt: string
}

export default function WalletPage() {
  const { goBack } = useShopRouter()
  const { rewardsPoints } = useShopStore()
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWallet()
  }, [])

  const fetchWallet = async () => {
    try {
      setLoading(true)
      // First get the demo user's ID
      const usersRes = await fetch('/api/stats')
      let userId = 'default'

      // Try direct wallet fetch
      const res = await fetch(`/api/wallet?userId=${userId}`)
      if (res.ok) {
        const json = await res.json()
        setWallet(json.data || null)
      } else if (res.status === 404) {
        // Try to find user and create wallet
        try {
          const createRes = await fetch('/api/wallet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
          })
          if (createRes.ok) {
            const json = await createRes.json()
            setWallet(json.data || null)
          }
        } catch {
          // Wallet creation failed
        }
      }
    } catch {
      toast.error('Failed to load wallet')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const balance = wallet?.balance || 0
  const transactions = wallet?.transactions || []
  const currency = wallet?.currency || 'USD'

  const quickActions = [
    { icon: Plus, label: 'Top Up', color: 'from-emerald-500/15 to-emerald-700/5', iconColor: 'text-emerald-400' },
    { icon: Send, label: 'Send', color: 'from-amber-500/15 to-amber-700/5', iconColor: 'text-amber-400' },
    { icon: QrCode, label: 'Receive', color: 'from-violet-500/15 to-violet-700/5', iconColor: 'text-violet-400' },
  ]

  return (
    <motion.div
      className="px-4 py-2 pb-8"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={goBack}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Wallet className="h-5 w-5 text-emerald-400" />
            Digital Wallet
          </h1>
          <p className="text-xs text-muted-foreground">Manage your balance & transactions</p>
        </div>
      </div>

      {/* Balance Card */}
      <motion.div
        className="mb-4 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 p-5 relative overflow-hidden shadow-xl shadow-emerald-500/20"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5 blur-xl" />
        <div className="absolute -left-6 -bottom-6 h-28 w-28 rounded-full bg-white/5 blur-xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-white/80" />
            <span className="text-sm font-medium text-white/80">Grapsee Wallet</span>
          </div>
          {loading ? (
            <div className="h-10 w-40 rounded-lg bg-white/10 animate-pulse mb-2" />
          ) : (
            <p className="text-3xl font-bold text-white mb-1">{formatPrice(balance)}</p>
          )}
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1">
              <span className="text-[10px] text-white/70">Rewards Points</span>
              <span className="text-xs font-semibold text-white">{rewardsPoints}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1">
              <span className="text-[10px] text-white/70">Currency</span>
              <span className="text-xs font-semibold text-white">{currency}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {quickActions.map((action, index) => {
          const Icon = action.icon
          return (
            <motion.button
              key={action.label}
              className={`flex flex-col items-center gap-2 rounded-xl bg-gradient-to-br ${action.color} border border-border/50 p-3 transition-all hover:shadow-md active:scale-95`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + index * 0.05 }}
              onClick={() => toast.info(`${action.label} feature coming soon!`)}
            >
              <Icon className={`h-5 w-5 ${action.iconColor}`} />
              <span className="text-xs font-medium text-foreground">{action.label}</span>
            </motion.button>
          )
        })}
      </div>

      <Separator className="my-4" />

      {/* Transaction History */}
      <section className="mb-4">
        <h3 className="mb-3 text-sm font-bold text-foreground flex items-center gap-2">
          <History className="h-4 w-4 text-primary" />
          Transaction History
          {transactions.length > 0 && (
            <Badge variant="secondary" className="text-[10px]">{transactions.length}</Badge>
          )}
        </h3>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-border/30 bg-card p-3 animate-pulse">
                <div className="h-9 w-9 rounded-xl bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-muted" />
                  <div className="h-3 w-1/3 rounded bg-muted" />
                </div>
                <div className="h-5 w-16 rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center py-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <CreditCard className="h-10 w-10 text-muted-foreground/30" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No transactions yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Your transaction history will appear here</p>
          </motion.div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {transactions.map((tx, idx) => {
              const isCredit = tx.type === 'credit'
              return (
                <motion.div
                  key={tx.id}
                  className="flex items-center gap-3 rounded-xl border border-border/30 bg-card p-3"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  {/* Icon */}
                  <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${
                    isCredit ? 'bg-emerald-500/10' : 'bg-destructive/10'
                  }`}>
                    {isCredit ? (
                      <ArrowDownLeft className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 text-destructive" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{tx.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-muted-foreground">{formatDate(tx.createdAt)}</span>
                      {tx.referenceId && (
                        <span className="text-[9px] text-muted-foreground/60 font-mono">{tx.referenceId}</span>
                      )}
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="flex-shrink-0 text-right">
                    <p className={`text-sm font-bold ${isCredit ? 'text-emerald-400' : 'text-destructive'}`}>
                      {isCredit ? '+' : ''}{formatPrice(Math.abs(tx.amount))}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </section>
    </motion.div>
  )
}
