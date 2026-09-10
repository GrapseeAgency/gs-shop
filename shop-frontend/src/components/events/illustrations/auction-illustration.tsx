'use client'

import { motion } from 'framer-motion'

export function AuctionIllustration() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-amber-600 via-orange-600 to-red-600">
      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full">
          <defs>
            <pattern id="auctionGrid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#auctionGrid)" />
        </svg>
      </div>

      {/* Gavel animation - center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="relative"
          initial={{ rotate: -45 }}
          animate={{ rotate: [-45, -30, -45] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
        >
          <div className="text-6xl"></div>
          
          {/* Impact effect */}
          <motion.div
            className="absolute -bottom-2 left-1/2 -translate-x-1/2"
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: [0, 1.5, 2], opacity: [1, 0.5, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1.5 }}
          >
            <div className="w-16 h-16 border-2 border-white/50 rounded-full" />
          </motion.div>
        </motion.div>

        {/* Sound block */}
        <motion.div
          className="absolute mt-16 text-3xl"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
        >
          
        </motion.div>
      </div>

      {/* Rising bid numbers */}
      {['1,200', '2,500', '4,800', '6,200'].map((bid, i) => (
        <motion.div
          key={i}
          className="absolute bg-white/20 backdrop-blur text-white font-bold text-xs px-2 py-1 rounded-lg"
          style={{
            left: `${10 + i * 20}%`,
            bottom: '20%',
          }}
          initial={{ opacity: 0, y: 50 }}
          animate={{
            opacity: [0, 1, 0],
            y: [-20, -80],
            scale: [0.8, 1.2, 1],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            delay: i * 0.8,
          }}
        >
          {bid}
        </motion.div>
      ))}

      {/* Bidder avatars */}
      {['', '', '', ''].map((avatar, i) => (
        <motion.div
          key={i}
          className="absolute w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm border-2 border-white/30"
          style={{
            right: `${15 + i * 12}%`,
            top: `${20 + (i % 2) * 15}%`,
          }}
          animate={{
            scale: [1, 1.2, 1],
            borderColor: ['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.8)', 'rgba(255,255,255,0.3)'],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.4,
          }}
        >
          {avatar}
        </motion.div>
      ))}

      {/* Countdown urgency ring */}
      <motion.div
        className="absolute top-4 right-4"
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
      >
        <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/40" />
      </motion.div>

      <div className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="text-white font-bold text-sm"
        >
          LIVE
        </motion.div>
      </div>

      {/* Winner celebration burst */}
      <motion.div
        className="absolute top-1/4 left-1/4"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
      >
        <div className="text-4xl"></div>
      </motion.div>

      {/* Sparkles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-yellow-300 text-lg"
          style={{
            left: `${20 + i * 15}%`,
            top: `${40 + (i % 2) * 20}%`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1.5, 0.5],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.5,
          }}
        >
          
        </motion.div>
      ))}

      {/* Current bid display */}
      <motion.div
        className="absolute bottom-4 left-4 bg-white/90 backdrop-blur text-orange-700 px-3 py-2 rounded-xl shadow-lg"
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <div className="text-[10px] text-orange-500 font-bold uppercase">Current Bid</div>
        <div className="text-lg font-black">6,200</div>
      </motion.div>

      {/* Bid count */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1 text-white/80 text-xs">
        <motion.span
          animate={{ rotate: [0, 20, -20, 0] }}
          transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
        >
          
        </motion.span>
        <span>4 bids</span>
      </div>
    </div>
  )
}
