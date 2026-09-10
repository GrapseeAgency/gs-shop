'use client'

import { motion } from 'framer-motion'

export function BlogIllustration() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600">
      {/* Background book pages effect */}
      <div className="absolute inset-0 opacity-10">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white rounded-lg"
            style={{
              width: 40,
              height: 60,
              left: `${10 + i * 18}%`,
              top: '20%',
              transform: `rotate(${-10 + i * 5}deg)`,
            }}
            animate={{
              y: [0, 10, 0],
              rotate: [-10 + i * 5, -5 + i * 5, -10 + i * 5],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Central book opening animation */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="relative"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring' }}
        >
          {/* Book cover */}
          <motion.div
            className="w-24 h-32 bg-white rounded-lg shadow-2xl flex items-center justify-center relative overflow-hidden"
            animate={{ rotateY: [0, 5, 0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="text-4xl"></div>
            
            {/* Pages turning effect */}
            <motion.div
              className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-gray-100 to-transparent"
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>

          {/* Floating letters */}
          {['B', 'L', 'O', 'G'].map((letter, i) => (
            <motion.div
              key={i}
              className="absolute text-white font-bold text-xl"
              style={{
                left: `${-30 + i * 20}px`,
                top: `${-40 + (i % 2) * 80}px`,
              }}
              animate={{
                y: [0, -15, 0],
                opacity: [0.5, 1, 0.5],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: i * 0.4,
              }}
            >
              {letter}
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Knowledge flow/streaming particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/40 rounded-full"
          style={{
            left: `${20 + i * 8}%`,
            top: '30%',
          }}
          animate={{
            y: [0, 100],
            opacity: [0, 1, 0],
            x: [0, (i % 2 === 0 ? 20 : -20)],
          }}
          transition={{
            duration: 3 + i * 0.3,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}

      {/* Trending graph animation */}
      <div className="absolute bottom-16 left-4 right-4">
        <svg viewBox="0 0 200 60" className="w-full h-16">
          <motion.path
            d="M0 50 Q25 45, 50 40 T100 25 T150 20 T200 10"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.circle
            cx="200"
            cy="10"
            r="4"
            fill="white"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </svg>
        <div className="text-white/70 text-[10px] text-center">Trending +127% this week</div>
      </div>

      {/* Share network spreading */}
      <motion.div
        className="absolute top-4 right-4"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          <span className="text-lg"></span>
        </div>
        {/* Spread rings */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border border-white/30"
            animate={{
              scale: [1, 2, 2.5],
              opacity: [0.5, 0.3, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
      </motion.div>

      {/* Read time indicator */}
      <motion.div
        className="absolute top-4 left-4 bg-white/20 backdrop-blur text-white px-2 py-1 rounded-full flex items-center gap-1"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-xs"></span>
        <span className="text-[10px] font-medium">5 min read</span>
      </motion.div>

      {/* Article cards floating */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bg-white/10 backdrop-blur rounded-lg p-2 w-20"
          style={{
            right: `${10 + i * 25}%`,
            top: `${35 + i * 8}%`,
          }}
          animate={{
            y: [0, -10, 0],
            rotate: [-2, 2, -2],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div className="h-1 bg-white/30 rounded mb-1" />
          <div className="h-1 bg-white/20 rounded w-2/3" />
        </motion.div>
      ))}

      {/* Stats at bottom */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between text-white/80 text-[10px]">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex items-center gap-1"
        >
          <span></span>
          <span>12.5K views</span>
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          className="flex items-center gap-1"
        >
          <span></span>
          <span>2.4K likes</span>
        </motion.div>
      </div>
    </div>
  )
}
