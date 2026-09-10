'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Home, ArrowLeft, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        className="flex flex-col items-center text-center max-w-sm"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          className="relative mb-6"
          animate={{ rotate: [0, -5, 5, -5, 0] }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <span className="text-8xl select-none"></span>
          <motion.div
            className="absolute -top-1 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-destructive text-white text-xs font-bold shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: 'spring' }}
          >
            ?
          </motion.div>
        </motion.div>

        <h1 className="text-5xl font-black text-foreground mb-2">404</h1>
        <h2 className="text-lg font-bold text-foreground mb-2">Page Not Found</h2>
        <p className="text-sm text-muted-foreground mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex flex-col w-full gap-3">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98]"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
          <Link
            href="/search"
            className="flex items-center justify-center gap-2 h-11 rounded-xl border border-border bg-card text-foreground font-medium text-sm transition-all hover:bg-muted active:scale-[0.98]"
          >
            <Search className="h-4 w-4" />
            Search Products
          </Link>
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
