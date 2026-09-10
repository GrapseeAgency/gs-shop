'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, Home, AlertTriangle, ArrowLeft } from 'lucide-react'
import { useShopRouter } from '@/hooks/use-shop-router'

export default function ShopError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { goHome } = useShopRouter()

  useEffect(() => {
    console.error('[ShopError]', error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        className="flex flex-col items-center text-center max-w-sm w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <motion.div
          className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 border border-destructive/20"
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ repeat: 2, duration: 0.4, delay: 0.3 }}
        >
          <AlertTriangle className="h-9 w-9 text-destructive" />
        </motion.div>

        <h2 className="text-lg font-bold text-foreground mb-1">Oops! Something broke</h2>
        <p className="text-sm text-muted-foreground mb-6">
          We hit an unexpected error. You can try refreshing or go back home.
        </p>

        <div className="flex flex-col w-full gap-3">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98]"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
          <button
            onClick={goHome}
            className="flex items-center justify-center gap-2 h-11 rounded-xl border border-border bg-card text-foreground font-medium text-sm transition-all hover:bg-muted active:scale-[0.98]"
          >
            <Home className="h-4 w-4" />
            Back to Shop
          </button>
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 h-10 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>
      </motion.div>
    </div>
  )
}
