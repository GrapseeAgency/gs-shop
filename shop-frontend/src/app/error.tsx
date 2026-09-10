'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, Home, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        className="flex flex-col items-center text-center max-w-sm"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
      >
        <motion.div
          className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: 2, duration: 0.4, delay: 0.3 }}
        >
          <AlertTriangle className="h-10 w-10 text-destructive" />
        </motion.div>

        <h1 className="text-xl font-black text-foreground mb-2">Something went wrong</h1>
        <p className="text-sm text-muted-foreground mb-1">
          An unexpected error occurred. Please try again.
        </p>
        {error.digest && (
          <p className="text-[10px] text-muted-foreground/50 font-mono mb-6">
            Error ID: {error.digest}
          </p>
        )}
        {!error.digest && <div className="mb-6" />}

        <div className="flex flex-col w-full gap-3">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98]"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 h-11 rounded-xl border border-border bg-card text-foreground font-medium text-sm transition-all hover:bg-muted active:scale-[0.98]"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
