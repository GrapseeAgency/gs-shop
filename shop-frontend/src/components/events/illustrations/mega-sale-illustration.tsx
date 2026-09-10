'use client'

import { motion } from 'framer-motion'

export function MegaSaleIllustration() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-orange-600 via-red-600 to-pink-600">
      {/* Animated background particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white/10"
          style={{
            width: 20 + i * 10,
            height: 20 + i * 10,
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.1, 0.3, 0.1],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.4,
          }}
        />
      ))}

      {/* Fire/Flame effects */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bottom-0 w-4 bg-gradient-to-t from-yellow-500 via-orange-500 to-transparent rounded-t-full"
            style={{
              height: 40 + i * 15,
              left: `${20 + i * 15}%`,
            }}
            animate={{
              scaleY: [1, 1.3, 0.8, 1],
              opacity: [0.6, 0.9, 0.5, 0.6],
            }}
            transition={{
              duration: 1.5 + i * 0.2,
              repeat: Infinity,
              delay: i * 0.15,
            }}
          />
        ))}
      </div>

      {/* Floating discount tags */}
      {['-70%', '-50%', '-30%', 'SALE'].map((text, i) => (
        <motion.div
          key={text}
          className="absolute bg-white/90 backdrop-blur text-red-600 font-bold text-xs px-2 py-1 rounded-lg shadow-lg"
          style={{
            left: `${10 + i * 22}%`,
            top: `${15 + (i % 2) * 20}%`,
          }}
          animate={{
            y: [0, -20, 0],
            rotate: [-5, 5, -5],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2.5 + i * 0.3,
            repeat: Infinity,
            delay: i * 0.5,
          }}
        >
          {text}
        </motion.div>
      ))}

      {/* Central countdown visualization */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="relative"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.3 }}
        >
          {/* Outer ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-white/20"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            style={{ width: 120, height: 120 }}
          />

          {/* Inner content */}
          <div className="w-28 h-28 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/30">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-center"
            >
              <div className="text-2xl font-black text-white"></div>
              <div className="text-[10px] text-white/80 font-bold">ENDING</div>
            </motion.div>
          </div>

          {/* Orbiting dots */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 bg-yellow-400 rounded-full"
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{
                width: 140 + i * 20,
                height: 140 + i * 20,
                left: '50%',
                top: '50%',
                marginLeft: -(70 + i * 10),
                marginTop: -(70 + i * 10),
              }}
            >
              <div className="w-3 h-3 bg-yellow-400 rounded-full shadow-lg" />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Shopping cart animation */}
      <motion.div
        className="absolute bottom-16 right-8 text-4xl"
        animate={{
          x: [0, 10, 0],
          y: [0, -5, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      >
        
      </motion.div>

      {/* Money/Fireworks */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-xl"
          style={{
            left: `${70 + i * 8}%`,
            top: `${30 + i * 10}%`,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: [0, 1, 0],
            y: [-20, -60],
            x: [0, (i % 2 === 0 ? 20 : -20)],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.8,
          }}
        >
          {['', '', '', ''][i]}
        </motion.div>
      ))}

      {/* Bottom text animation */}
      <motion.div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="text-white/90 text-xs font-bold tracking-wider">UP TO 70% OFF</div>
      </motion.div>
    </div>
  )
}
