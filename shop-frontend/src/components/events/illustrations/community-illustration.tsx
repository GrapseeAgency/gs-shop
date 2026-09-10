'use client'

import { motion } from 'framer-motion'

export function CommunityIllustration() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600">
      {/* Background floating shapes */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white/5"
          style={{
            width: 60 + i * 30,
            height: 60 + i * 30,
            left: `${10 + i * 25}%`,
            top: `${15 + (i % 2) * 30}%`,
          }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 20, 0],
            y: [0, -15, 0],
          }}
          transition={{
            duration: 5 + i,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Central community hub */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="relative w-20 h-20"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        >
          {/* Orbiting connections */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm shadow-lg"
              style={{
                transform: `rotate(${i * 60}deg) translateX(50px)`,
                left: '50%',
                top: '50%',
                marginLeft: -16,
                marginTop: -16,
              }}
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            >
              {['', '', '', '', '', ''][i]}
            </motion.div>
          ))}
        </motion.div>

        {/* Center hub */}
        <motion.div
          className="absolute w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-3xl"></span>
        </motion.div>
      </div>

      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.line
            key={i}
            x1="50%"
            y1="50%"
            x2={`${30 + i * 20}%`}
            y2={`${30 + (i % 2) * 40}%`}
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="2"
            strokeDasharray="5,5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
          />
        ))}
      </svg>

      {/* Floating message bubbles */}
      {[
        { text: 'Hello! ', x: 10, y: 20 },
        { text: 'Welcome! ', x: 70, y: 15 },
        { text: 'Join us! ', x: 75, y: 60 },
        { text: 'Share ', x: 15, y: 65 },
      ].map((msg, i) => (
        <motion.div
          key={i}
          className="absolute bg-white/90 backdrop-blur text-gray-800 text-xs px-2 py-1 rounded-lg shadow-md"
          style={{ left: `${msg.x}%`, top: `${msg.y}%` }}
          animate={{
            y: [0, -10, 0],
            opacity: [0.7, 1, 0.7],
            scale: [0.9, 1.05, 0.9],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.8,
          }}
        >
          {msg.text}
        </motion.div>
      ))}

      {/* Growth counter */}
      <motion.div
        className="absolute top-4 right-4 bg-white/20 backdrop-blur text-white px-3 py-1 rounded-full"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="text-[10px] text-white/70">Members</div>
        <div className="text-sm font-bold">2,847+</div>
      </motion.div>

      {/* Like/Share pulse effects */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            right: `${20 + i * 15}%`,
            bottom: `${25 + i * 10}%`,
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.7,
          }}
        >
          <div className="w-8 h-8 border-2 border-white/40 rounded-full" />
        </motion.div>
      ))}

      {/* Heart icons floating */}
      {['', '', ''].map((heart, i) => (
        <motion.div
          key={i}
          className="absolute text-lg"
          style={{
            right: `${15 + i * 10}%`,
            bottom: '30%',
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 1, 0],
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 1,
          }}
        >
          {heart}
        </motion.div>
      ))}

      {/* Bottom CTA */}
      <motion.div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-indigo-600 px-4 py-2 rounded-full font-bold text-xs shadow-lg"
        whileHover={{ scale: 1.05 }}
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Join Community 
      </motion.div>
    </div>
  )
}
