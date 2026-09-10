'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useShopRouter } from '@/hooks/use-shop-router'
import { Gift, Ticket, Crown, Diamond, Coins, Truck, CreditCard } from 'lucide-react'

function SparkleEffect({ delay, x, y }: { delay: number; x: string; y: string }) {
  return (
    <motion.div
      className="absolute"
      style={{ left: x, top: y }}
      initial={{ scale: 0, opacity: 0, rotate: 0 }}
      animate={{
        scale: [0, 1.2, 0],
        opacity: [0, 1, 0],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: 1.5,
        delay,
        repeat: Infinity,
        repeatDelay: 2 + Math.random() * 2,
      }}
    >
      <Sparkles className="h-3 w-3 text-yellow-200" />
    </motion.div>
  )
}

export function SpinWinBanner() {
  const { goSpinWin } = useShopRouter()
  const [lastPrize, setLastPrize] = useState<string | null>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('grapsee-last-spin-prize')
      if (saved) setLastPrize(saved)
    } catch {
      // ignore
    }
  }, [])

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="px-4 py-4"
    >
      <div className="relative overflow-hidden rounded-2xl p-5 shadow-lg shadow-purple-500/20">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-purple-600 animate-gradient-x" />
        {/* Overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/5" />

        {/* Sparkles */}
        <SparkleEffect delay={0} x="10%" y="20%" />
        <SparkleEffect delay={0.5} x="80%" y="15%" />
        <SparkleEffect delay={1.0} x="60%" y="70%" />
        <SparkleEffect delay={1.5} x="20%" y="75%" />
        <SparkleEffect delay={2.0} x="90%" y="50%" />
        <SparkleEffect delay={0.8} x="45%" y="10%" />

        {/* Background glow orbs */}
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-glass-deep/10 blur-2xl" />
        <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-pink-300/20 blur-xl" />

        {/* Rotating icon wheel */}
        <motion.div
          className="absolute right-4 top-3 opacity-30"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        >
          <Gift className="h-8 w-8 text-white" />
        </motion.div>
        <motion.div
          className="absolute right-10 bottom-3 opacity-20"
          animate={{ rotate: -360 }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        >
          <Sparkles className="h-5 w-5 text-white" />
        </motion.div>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              {/* Slot machine emoji with bounce */}
              <motion.div
                className="mb-1"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Ticket className="h-6 w-6 text-white" />
              </motion.div>

              {/* Shimmer heading */}
              <div className="relative inline-block">
                <h3 className="text-lg font-bold text-white">Spin &amp; Win!</h3>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent bg-[length:200%_100%] animate-shimmer" />
              </div>

              <p className="mt-0.5 text-xs font-medium text-purple-100">
                Win up to 500 points daily!
              </p>

              {/* Last prize won */}
              {lastPrize && (
                <motion.p
                  className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-glass-deep/15 px-2 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-sm"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Gift className="h-3 w-3" /> Last prize: {lastPrize}
                </motion.p>
              )}
            </div>

            {/* Spin Now button with bounce */}
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
            >
              <Button
                onClick={() => goSpinWin()}
                className="bg-glass-deep text-purple-700 hover:bg-glass-deep/90 shadow-md font-bold text-sm px-4 gap-1.5 active:scale-95 transition-transform"
              >
                Spin Now
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Inline keyframes for animations */}
      <style jsx global>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 4s ease infinite;
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          animation: shimmer 2s linear infinite;
        }
      `}</style>
    </motion.section>
  )
}

