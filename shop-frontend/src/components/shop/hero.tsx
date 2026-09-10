'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, Zap, Cpu, Palette, Rocket, Gavel, Star, CreditCard, Download, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useShopRouter } from '@/hooks/use-shop-router'

const SLIDE_DURATION = 5000

interface HeroSlide {
  id: number
  badge: string
  badgeDot: boolean
  title: string
  highlight: string
  description: string
  cta: string
  ctaSecondary: string
  accent: string
  accentBg: string
  accentText: string
  badgeBg: string
  gradient: string
  orb1: string
  orb2: string
  icon: React.ReactNode
  Illustration: React.FC
}

// Illustration 1: Floating UI Windows 
function IllustrationEmpire() {
  return (
    <svg viewBox="0 0 200 180" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="e-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#10b981" floodOpacity="0.25" />
        </filter>
        <filter id="e-cardGlow"><feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#10b981" floodOpacity="0.3" /></filter>
      </defs>
      {/* Back window slow independent float */}
      <motion.g animate={{ y: [0, -4, 0], scale: [1, 1.01, 1] }} transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut', delay: 0.5 }}>
        <rect x="50" y="28" width="112" height="78" rx="9" fill="#10b981" fillOpacity="0.07" stroke="#10b981" strokeWidth="1.2" strokeOpacity="0.35" />
        <rect x="50" y="28" width="112" height="18" rx="9" fill="#10b981" fillOpacity="0.18" />
        <circle cx="62" cy="37" r="3" fill="#ef4444" opacity="0.8" />
        <circle cx="73" cy="37" r="3" fill="#f59e0b" opacity="0.8" />
        <circle cx="84" cy="37" r="3" fill="#22c55e" opacity="0.8" />
        {/* Code lines */}
        <motion.rect x="60" y="54" width="50" height="4" rx="2" fill="#10b981" fillOpacity="0.5"
          animate={{ width: [50, 62, 50] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }} />
        <rect x="60" y="63" width="76" height="3.5" rx="2" fill="#10b981" fillOpacity="0.28" />
        <rect x="60" y="71" width="58" height="3.5" rx="2" fill="#10b981" fillOpacity="0.28" />
        <rect x="60" y="79" width="40" height="3.5" rx="2" fill="#10b981" fillOpacity="0.28" />
        {/* Blinking cursor */}
        <motion.rect x="102" y="79" width="2" height="4" rx="1" fill="#10b981"
          animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 0.9 }} />
        {/* Button */}
        <motion.rect x="60" y="88" width="42" height="10" rx="5" fill="#10b981" opacity="0.85"
          animate={{ opacity: [0.7, 1, 0.7] }} transition={{ repeat: Infinity, duration: 2.5 }} />
        {/* Notification dot */}
        <motion.circle cx="156" cy="32" r="4" fill="#ef4444"
          animate={{ scale: [1, 1.5, 1], opacity: [0.8, 1, 0.8] }} transition={{ repeat: Infinity, duration: 1.2 }} />
        <motion.circle cx="156" cy="32" r="7" stroke="#ef4444" strokeWidth="1.5" fill="none"
          animate={{ scale: [0.5, 1.4, 0.5], opacity: [0.7, 0, 0.7] }} transition={{ repeat: Infinity, duration: 1.2 }} />
      </motion.g>
      {/* Front main card faster float, slight tilt */}
      <motion.g animate={{ y: [0, -9, 0], rotate: [0, 1.5, 0] }} transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}>
        <rect x="16" y="84" width="84" height="58" rx="11" fill="white" filter="url(#e-cardGlow)" />
        <rect x="16" y="84" width="84" height="17" rx="11" fill="#10b981" opacity="0.92" />
        <text x="25" y="96" fontSize="7" fill="white" fontWeight="800">Grapsee Mall</text>
        <rect x="24" y="110" width="36" height="4" rx="2" fill="#10b981" fillOpacity="0.3" />
        <rect x="24" y="118" width="56" height="3.5" rx="2" fill="#94a3b8" fillOpacity="0.35" />
        <rect x="24" y="125" width="46" height="3.5" rx="2" fill="#94a3b8" fillOpacity="0.25" />
        {/* Live dot */}
        <motion.circle cx="88" cy="92" r="3" fill="#fbbf24"
          animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} />
      </motion.g>
      {/* Mini analytics card top right, independent float */}
      <motion.g animate={{ y: [0, -6, 0], x: [0, 2, 0], rotate: [0, -2, 0] }} transition={{ repeat: Infinity, duration: 4.2, ease: 'easeInOut', delay: 0.8 }}>
        <rect x="118" y="90" width="66" height="42" rx="9" fill="white" filter="url(#e-shadow)" />
        <text x="126" y="104" fontSize="6.5" fill="#64748b" fontWeight="600">Revenue</text>
        <motion.text x="126" y="116" fontSize="10" fill="#10b981" fontWeight="900"
          animate={{ opacity: [0.7, 1, 0.7] }} transition={{ repeat: Infinity, duration: 2 }}>+28%</motion.text>
        <rect x="126" y="120" width="48" height="3" rx="2" fill="#e2e8f0" />
        <motion.rect x="126" y="120" width="0" height="3" rx="2" fill="#10b981"
          animate={{ width: [0, 38, 0] }} transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }} />
      </motion.g>
      {/* " Live" badge drift both axes */}
      <motion.g animate={{ y: [0, -5, 0], x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 3.6, ease: 'easeInOut', delay: 0.2 }}>
        <rect x="118" y="140" width="60" height="22" rx="11" fill="#10b981" opacity="0.92" />
        <motion.circle cx="130" cy="151" r="3" fill="white"
          animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 0.9 }} />
        <text x="136" y="155" fontSize="7.5" fill="white" fontWeight="700">Live</text>
      </motion.g>
      {/* Ambient particles */}
      <motion.circle cx="170" cy="38" r="4.5" fill="#10b981" animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }} transition={{ repeat: Infinity, duration: 2.2 }} />
      <motion.circle cx="28" cy="52" r="3" fill="#6366f1" animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.9, 0.4] }} transition={{ repeat: Infinity, duration: 2.8, delay: 0.5 }} />
      <motion.circle cx="14" cy="145" r="3.5" fill="#f59e0b" animate={{ scale: [1, 1.6, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 3.1, delay: 1 }} />
      <motion.circle cx="185" cy="158" r="2.5" fill="#e879f9" animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0.8, 0.3] }} transition={{ repeat: Infinity, duration: 1.9, delay: 0.7 }} />
    </svg>
  )
}

// Illustration 2: Flash Deal Lightning 
function IllustrationFlash() {
  return (
    <svg viewBox="0 0 200 180" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="f-flashGrad" x1="108" y1="28" x2="92" y2="152" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fbbf24" /><stop offset="0.5" stopColor="#f97316" /><stop offset="1" stopColor="#ef4444" />
        </linearGradient>
        <filter id="f-boltGlow"><feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#f97316" floodOpacity="0.7" /></filter>
      </defs>
      {/* Breathing outer ring */}
      <motion.circle cx="100" cy="90" r="60" stroke="#f97316" strokeWidth="1" strokeOpacity="0.2" fill="none"
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.7, 0.3] }} transition={{ repeat: Infinity, duration: 3 }} />
      <motion.circle cx="100" cy="90" r="44" stroke="#f97316" strokeWidth="1.5" strokeOpacity="0.15" fill="none"
        animate={{ scale: [1.06, 1, 1.06], opacity: [0.2, 0.6, 0.2] }} transition={{ repeat: Infinity, duration: 2.2 }} />
      {/* Lightning bolt flickers */}
      <motion.path d="M108 28 L88 88 L102 88 L92 152 L128 78 L112 78 Z"
        fill="url(#f-flashGrad)" filter="url(#f-boltGlow)"
        animate={{ opacity: [1, 0.75, 1, 0.88, 1], scale: [1, 1.03, 1] }}
        transition={{ repeat: Infinity, duration: 0.8 }} />
      {/* Radial sparks from bolt tip */}
      {[0, 45, 90, 135, 225, 270, 315].map((deg, i) => {
        const rad = (deg * Math.PI) / 180
        const tx = Math.cos(rad) * 22, ty = Math.sin(rad) * 22
        return (
          <motion.line key={i} x1="92" y1="152" x2={92 + tx} y2={152 + ty}
            stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round"
            animate={{ opacity: [0, 0.9, 0] }}
            transition={{ repeat: Infinity, duration: 1, delay: i * 0.12 }} />
        )
      })}
      {/* Price tag WAS (dramatic wobble) */}
      <motion.g animate={{ y: [0, -8, 0], rotate: [-6, 6, -6], scale: [1, 1.04, 1] }} transition={{ repeat: Infinity, duration: 2.6 }}>
        <rect x="18" y="46" width="50" height="30" rx="8" fill="#f97316" opacity="0.92" />
        <text x="26" y="58" fontSize="7" fill="white" fontWeight="600">WAS</text>
        <line x1="22" y1="70" x2="62" y2="70" stroke="white" strokeWidth="1.5" opacity="0.7" />
        <text x="22" y="70" fontSize="9.5" fill="white" fontWeight="800" opacity="0.7">999</text>
      </motion.g>
      {/* Price tag NOW */}
      <motion.g animate={{ y: [0, -10, 0], rotate: [4, -5, 4], scale: [1, 1.06, 1] }} transition={{ repeat: Infinity, duration: 3, delay: 0.3 }}>
        <rect x="136" y="36" width="50" height="30" rx="8" fill="#ef4444" opacity="0.92" />
        <text x="144" y="48" fontSize="7" fill="white" fontWeight="600">NOW</text>
        <text x="140" y="61" fontSize="9.5" fill="white" fontWeight="800">499</text>
      </motion.g>
      {/* -50% badge */}
      <motion.g animate={{ y: [0, -6, 0], rotate: [-3, 3, -3] }} transition={{ repeat: Infinity, duration: 2.4, delay: 0.6 }}>
        <rect x="28" y="118" width="54" height="24" rx="8" fill="#f59e0b" opacity="0.92" />
        <text x="35" y="134" fontSize="9" fill="white" fontWeight="800">-50% OFF</text>
      </motion.g>
      {/* Live badge */}
      <motion.g animate={{ y: [0, -7, 0], rotate: [-2, 4, -2] }} transition={{ repeat: Infinity, duration: 3, delay: 0.9 }}>
        <rect x="128" y="118" width="54" height="24" rx="8" fill="#8b5cf6" opacity="0.92" />
        <motion.circle cx="138" cy="130" r="3" fill="#fbbf24"
          animate={{ opacity: [1, 0.2, 1] }} transition={{ repeat: Infinity, duration: 0.7 }} />
        <text x="144" y="134" fontSize="8" fill="white" fontWeight="800">Live</text>
      </motion.g>
      {/* Countdown */}
      <motion.g animate={{ opacity: [1, 0.6, 1] }} transition={{ repeat: Infinity, duration: 1.1, delay: 0.5 }}>
        <rect x="62" y="153" width="76" height="22" rx="8" fill="#1e293b" opacity="0.85" />
        <text x="77" y="168" fontSize="10" fill="#f59e0b" fontWeight="800">02:47</text>
      </motion.g>
      {/* Ambient sparks */}
      {[{x:18,y:105},{x:182,y:55},{x:175,y:158},{x:20,y:160}].map((p,i)=>(
        <motion.circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#fbbf24"
          animate={{ scale:[0.5,2,0.5], opacity:[0.2,1,0.2] }}
          transition={{ repeat:Infinity, duration:1.4+i*0.2, delay:i*0.3 }} />
      ))}
    </svg>
  )
}

// Illustration 3: Neural Net / AI 
function IllustrationAI() {
  const nodes = [
    { cx: 35, cy: 50 }, { cx: 35, cy: 90 }, { cx: 35, cy: 130 },
    { cx: 100, cy: 35 }, { cx: 100, cy: 75 }, { cx: 100, cy: 115 }, { cx: 100, cy: 150 },
    { cx: 165, cy: 60 }, { cx: 165, cy: 100 }, { cx: 165, cy: 140 },
  ]
  const edges = [
    [0,3],[0,4],[1,3],[1,4],[1,5],[2,4],[2,5],[2,6],
    [3,7],[3,8],[4,7],[4,8],[4,9],[5,8],[5,9],[6,9],
  ]
  return (
    <svg viewBox="0 0 200 180" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="ai-nodeGlow"><feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#8b5cf6" floodOpacity="0.7" /></filter>
        <filter id="ai-labelGlow"><feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#7c3aed" floodOpacity="0.5" /></filter>
      </defs>
      {/* Rotating scan ring */}
      <motion.circle cx="100" cy="90" r="70" stroke="#8b5cf6" strokeWidth="1" strokeOpacity="0.12" fill="none"
        animate={{ rotate: [0, 360] }} transition={{ repeat: Infinity, duration: 8, ease: 'linear' }} />
      <motion.line x1="100" y1="20" x2="100" y2="90" stroke="#8b5cf6" strokeWidth="1" strokeOpacity="0.3"
        animate={{ rotate: [0, 360] }} transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
        style={{ transformOrigin: '100px 90px' }} />
      {/* Edges with signal shimmer */}
      {edges.map(([a, b], i) => (
        <motion.line key={i}
          x1={nodes[a].cx} y1={nodes[a].cy}
          x2={nodes[b].cx} y2={nodes[b].cy}
          stroke="#8b5cf6" strokeWidth="1.2"
          animate={{ strokeOpacity: [0.1, 0.55, 0.1] }}
          transition={{ repeat: Infinity, duration: 1.8 + (i % 5) * 0.35, delay: i * 0.09 }}
        />
      ))}
      {/* Signal packets traveling along select edges */}
      {[[35,50,100,35],[35,90,100,75],[100,75,165,100],[100,115,165,140]].map(([x1,y1,x2,y2],i)=>(
        <motion.circle key={i} cx={x1} cy={y1} r="3" fill="#c4b5fd" filter="url(#ai-nodeGlow)"
          animate={{ cx:[x1,x2,x1], cy:[y1,y2,y1] }}
          transition={{ repeat:Infinity, duration:2.2+i*0.4, ease:'easeInOut', delay:i*0.5 }} />
      ))}
      {/* Nodes wave cascade */}
      {nodes.map((n, i) => (
        <motion.circle key={i}
          cx={n.cx} cy={n.cy} r={i >= 3 && i <= 6 ? 9 : 7}
          fill={i >= 3 && i <= 6 ? '#8b5cf6' : '#a78bfa'}
          filter="url(#ai-nodeGlow)"
          animate={{ scale: [1, 1.3, 1], opacity: [0.55, 1, 0.55] }}
          transition={{ repeat: Infinity, duration: 2.4, delay: i * 0.16 }}
        />
      ))}
      {/* Central "AI Engine" pill */}
      <motion.rect x="70" y="66" width="60" height="24" rx="12" fill="#7c3aed" filter="url(#ai-labelGlow)"
        animate={{ scale: [1, 1.07, 1] }} transition={{ repeat: Infinity, duration: 2.5 }} />
      <text x="80" y="82" fontSize="8" fill="white" fontWeight="800">AI Engine</text>
      {/* Thinking dots beneath label */}
      {[84,93,102].map((x,i)=>(
        <motion.circle key={i} cx={x} cy={98} r="2.5" fill="#c4b5fd"
          animate={{ y:[0,-4,0], opacity:[0.4,1,0.4] }}
          transition={{ repeat:Infinity, duration:1, delay:i*0.25 }} />
      ))}
      {/* Ambient sparks */}
      {[{x:150,y:18},{x:18,y:162},{x:178,y:168},{x:12,y:40}].map((p,i)=>(
        <motion.circle key={i} cx={p.x} cy={p.y} r="3" fill="#c4b5fd"
          animate={{ scale:[1,2,1], opacity:[0.3,0.9,0.3] }}
          transition={{ repeat: Infinity, duration: 1.8, delay: i*0.45 }} />
      ))}
    </svg>
  )
}

// Illustration 4: Design / Creative 
function IllustrationDesign() {
  const dots = [
    { cx:68, cy:80, fill:'#ef4444', delay:0 },
    { cx:90, cy:62, fill:'#f97316', delay:0.2 },
    { cx:115, cy:62, fill:'#eab308', delay:0.4 },
    { cx:134, cy:80, fill:'#22c55e', delay:0.6 },
    { cx:136, cy:105, fill:'#3b82f6', delay:0.8 },
    { cx:120, cy:124, fill:'#8b5cf6', delay:1.0 },
  ]
  return (
    <svg viewBox="0 0 200 180" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="d-paletteGlow"><feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#e879f9" floodOpacity="0.25"/></filter>
      </defs>
      {/* Palette body */}
      <motion.g animate={{ rotate:[-3,3,-3], y:[0,-5,0], scale:[1,1.02,1] }}
        transition={{ repeat:Infinity, duration:4.5, ease:'easeInOut' }}>
        <ellipse cx="100" cy="100" rx="52" ry="48" fill="white" filter="url(#d-paletteGlow)" stroke="#e879f9" strokeWidth="1.5" strokeOpacity="0.35"/>
        <ellipse cx="100" cy="116" rx="22" ry="17" fill="#f3f4f6"/>
        {dots.map((d,i) => (
          <motion.circle key={i} cx={d.cx} cy={d.cy} r="9" fill={d.fill} opacity={0.88}
            animate={{ scale:[1,1.18,1], opacity:[0.75,1,0.75] }}
            transition={{ repeat:Infinity, duration:2.2, delay:d.delay }} />
        ))}
      </motion.g>
      {/* Paint splash bursts from palette center */}
      {['#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#e879f9'].map((c,i)=>{
        const ang = (i/6)*Math.PI*2
        const tx = Math.cos(ang)*28, ty = Math.sin(ang)*28
        return (
          <motion.circle key={i} cx={100+tx} cy={100+ty} r="4" fill={c}
            animate={{ scale:[0,1.6,0], opacity:[0,0.7,0] }}
            transition={{ repeat:Infinity, duration:2, delay:i*0.3+0.5 }} />
        )
      })}
      {/* Floating triangle */}
      <motion.polygon points="28,45 48,75 8,75" fill="#e879f9" opacity="0.72"
        animate={{ y:[0,-10,0], rotate:[0,12,0], scale:[1,1.08,1] }}
        transition={{ repeat:Infinity, duration:3.8, delay:0.4 }} />
      {/* Floating circle outline */}
      <motion.circle cx="168" cy="52" r="18" stroke="#f97316" strokeWidth="2.5" strokeOpacity="0.65" fill="none"
        animate={{ scale:[1,1.14,1], opacity:[0.45,1,0.45], rotate:[0,30,0] }}
        transition={{ repeat:Infinity, duration:3, delay:0.2 }} />
      {/* Floating rect */}
      <motion.rect x="145" y="132" width="34" height="22" rx="6" fill="#3b82f6" opacity="0.72"
        animate={{ y:[0,-8,0], rotate:[0,-8,0] }}
        transition={{ repeat:Infinity, duration:3.4, delay:0.7 }} />
      {/* Pencil drawing path */}
      <motion.path d="M18 148 Q50 125 82 148 Q112 170 145 148" stroke="#e879f9" strokeWidth="2.5"
        strokeLinecap="round" fill="none" strokeOpacity="0.6"
        animate={{ pathLength:[0,1,0], opacity:[0.3,0.9,0.3] }}
        transition={{ repeat:Infinity, duration:3.5, delay:0.9 }} />
      {/* Sparkle dots */}
      {[{x:185,y:32},{x:10,y:155},{x:185,y:158},{x:12,y:35}].map((p,i)=>(
        <motion.circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#e879f9"
          animate={{ scale:[1,2,1], opacity:[0.3,0.85,0.3] }}
          transition={{ repeat:Infinity, duration:1.6, delay:i*0.38 }} />
      ))}
    </svg>
  )
}

// Illustration 5: Rocket / Growth 
function IllustrationRocket() {
  return (
    <svg viewBox="0 0 200 180" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="r-rocketGrad" x1="100" y1="20" x2="100" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e2e8f0"/><stop offset="1" stopColor="#94a3b8"/>
        </linearGradient>
        <linearGradient id="r-flameGrad" x1="100" y1="98" x2="100" y2="122" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f97316"/><stop offset="1" stopColor="#fbbf24"/>
        </linearGradient>
        <filter id="r-rocketGlow"><feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#38bdf8" floodOpacity="0.4"/></filter>
        <filter id="r-flameGlow"><feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#f97316" floodOpacity="0.6"/></filter>
      </defs>
      {/* Orbit ellipses */}
      <motion.ellipse cx="100" cy="112" rx="66" ry="18" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.2" fill="none"
        animate={{ scaleX:[1,1.07,1], opacity:[0.3,0.6,0.3] }} transition={{ repeat:Infinity, duration:3.5 }} />
      <motion.ellipse cx="100" cy="112" rx="46" ry="12" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.12" fill="none"
        animate={{ scaleX:[1.06,1,1.06] }} transition={{ repeat:Infinity, duration:2.8 }} />
      {/* Exhaust trail particles */}
      {[{dx:-6,dy:14},{dx:0,dy:18},{dx:6,dy:14},{dx:-3,dy:22},{dx:3,dy:22}].map((t,i)=>(
        <motion.circle key={i} cx={100+t.dx} cy={92+t.dy} r="2.5" fill="#38bdf8"
          animate={{ cx:[100+t.dx,100+t.dx*1.5], cy:[92+t.dy, 92+t.dy+18], opacity:[0.7,0] }}
          transition={{ repeat:Infinity, duration:0.9+i*0.12, delay:i*0.18, ease:'easeOut' }} />
      ))}
      {/* Speed lines */}
      {[{y:40},{y:55},{y:70},{y:85}].map((l,i)=>(
        <motion.line key={i} x1="18" y1={l.y} x2="42" y2={l.y} stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round"
          animate={{ opacity:[0,0.55,0] }}
          transition={{ repeat:Infinity, duration:1.2, delay:i*0.22 }} />
      ))}
      {/* Planet top-right */}
      <motion.g animate={{ rotate:[0,360] }} transition={{ repeat:Infinity, duration:14, ease:'linear' }}>
        <circle cx="162" cy="32" r="12" fill="#1e40af" opacity="0.7"/>
        <ellipse cx="162" cy="32" rx="20" ry="5" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.5" fill="none"/>
        <circle cx="162" cy="32" r="4" fill="#93c5fd" opacity="0.8"/>
      </motion.g>
      {/* Rocket body */}
      <motion.g animate={{ y:[0,-12,0] }} transition={{ repeat:Infinity, duration:2.4, ease:'easeInOut' }} filter="url(#r-rocketGlow)">
        <path d="M100 18 C116 34 121 60 121 80 L79 80 C79 60 84 34 100 18Z" fill="url(#r-rocketGrad)"/>
        <rect x="88" y="64" width="24" height="20" rx="4" fill="#0ea5e9" opacity="0.82"/>
        <path d="M79 80 L66 106 L79 99 Z" fill="#94a3b8" opacity="0.72"/>
        <path d="M121 80 L134 106 L121 99 Z" fill="#94a3b8" opacity="0.72"/>
        <motion.circle cx="100" cy="52" r="8" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1.5" opacity="0.92"
          animate={{ opacity:[0.7,1,0.7] }} transition={{ repeat:Infinity, duration:1.8 }}/>
      </motion.g>
      {/* Outer flame */}
      <motion.path d="M88 97 Q94 122 100 114 Q106 122 112 97" fill="url(#r-flameGrad)" filter="url(#r-flameGlow)"
        animate={{ scaleY:[1,1.5,1], opacity:[0.8,1,0.8] }}
        transition={{ repeat:Infinity, duration:0.35 }} style={{ transformOrigin:'100px 100px' }}/>
      {/* Inner flame */}
      <motion.path d="M93 97 Q97 112 100 107 Q103 112 107 97" fill="#fbbf24"
        animate={{ scaleY:[1,1.3,0.9,1], opacity:[0.6,1,0.7,0.6] }}
        transition={{ repeat:Infinity, duration:0.28 }} style={{ transformOrigin:'100px 100px' }}/>
      {/* Stars dramatic twinkle */}
      {[{x:28,y:28,r:3},{x:48,y:155,r:2.2},{x:18,y:92,r:2},{x:175,y:155,r:2.5}].map((s,i)=>(
        <motion.circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fbbf24"
          animate={{ opacity:[0.2,1,0.2], scale:[0.6,1.6,0.6] }}
          transition={{ repeat:Infinity, duration:1.2+i*0.35, delay:i*0.25 }}/>
      ))}
      {/* Bar chart */}
      {[{x:135,h:18,y:147},{x:145,h:30,y:135},{x:155,h:46,y:119},{x:165,h:36,y:129}].map((b,i)=>(
        <motion.rect key={i} x={b.x} y={b.y} width="8" height={b.h} rx="3" fill="#38bdf8" opacity="0.75"
          animate={{ scaleY:[0.7,1.1,0.7] }} transition={{ repeat:Infinity, duration:2.2, delay:i*0.22 }}
          style={{ transformOrigin:`${b.x+4}px ${b.y+b.h}px` }}/>
      ))}
    </svg>
  )
}

// Illustration 6: Auction / Gavel 
function IllustrationAuction() {
  return (
    <svg viewBox="0 0 200 180" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="a-gavelGrad" x1="60" y1="40" x2="130" y2="110" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fde68a"/><stop offset="1" stopColor="#d97706"/>
        </linearGradient>
        <filter id="a-gavelGlow"><feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#f59e0b" floodOpacity="0.65"/></filter>
        <filter id="a-soldGlow"><feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#ef4444" floodOpacity="0.5"/></filter>
      </defs>
      {/* Gavel bigger arc, more drama */}
      <motion.g animate={{ rotate: [-28, 2, -28], x: [0, 10, 0], y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
        style={{ transformOrigin: '114px 120px' }}>
        <rect x="56" y="32" width="58" height="30" rx="10" fill="url(#a-gavelGrad)" filter="url(#a-gavelGlow)"/>
        <rect x="78" y="60" width="13" height="56" rx="6" fill="#92400e" opacity="0.92"/>
        {/* Gavel face details */}
        <rect x="58" y="38" width="54" height="4" rx="2" fill="white" opacity="0.2"/>
      </motion.g>
      {/* Impact rings */}
      {[1,2,3].map(r => (
        <motion.circle key={r} cx="126" cy="124" r={r*14}
          stroke="#f59e0b" strokeWidth="1.5" fill="none"
          animate={{ scale: [0.3, 1.6, 0.3], opacity: [0.9, 0, 0.9] }}
          transition={{ repeat: Infinity, duration: 1.6, delay: r * 0.25 }}/>
      ))}
      {/* Confetti burst on impact */}
      {['#ef4444','#fbbf24','#10b981','#3b82f6','#e879f9','#f97316'].map((c,i)=>{
        const ang = (i/6)*Math.PI*2
        const x1 = 126+Math.cos(ang)*8, y1 = 124+Math.sin(ang)*8
        const x2 = 126+Math.cos(ang)*36, y2 = 124+Math.sin(ang)*36
        return (
          <motion.g key={i}
            animate={{ x:[x1,x2], y:[y1,y2], opacity:[0.9,0], rotate:[0,180] }}
            transition={{ repeat:Infinity, duration:1.6, delay:i*0.1 }}>
            <rect width="5" height="3" rx="1" fill={c}/>
          </motion.g>
        )
      })}
      {/* PREV BID */}
      <motion.g animate={{ y:[0,-9,0], rotate:[-4,4,-4], scale:[1,1.04,1] }} transition={{ repeat:Infinity, duration:2.4 }}>
        <rect x="8" y="40" width="58" height="32" rx="10" fill="#10b981" opacity="0.92"/>
        <text x="16" y="54" fontSize="7" fill="white" fontWeight="600">PREV BID</text>
        <text x="12" y="67" fontSize="9.5" fill="white" fontWeight="800">1,200</text>
      </motion.g>
      {/* TOP BID animates up */}
      <motion.g animate={{ y:[0,-11,0], rotate:[3,-4,3], scale:[1,1.06,1] }} transition={{ repeat:Infinity, duration:2, delay:0.4 }}>
        <rect x="136" y="28" width="58" height="32" rx="10" fill="#ef4444" opacity="0.92"/>
        <text x="144" y="42" fontSize="7" fill="white" fontWeight="600">TOP BID</text>
        <motion.text x="140" y="55" fontSize="9.5" fill="white" fontWeight="800"
          animate={{ opacity:[0.5,1,0.5] }} transition={{ repeat:Infinity, duration:0.9 }}>2,750</motion.text>
      </motion.g>
      {/* Countdown */}
      <motion.g animate={{ opacity:[1,0.5,1] }} transition={{ repeat:Infinity, duration:1 }}>
        <rect x="56" y="128" width="88" height="32" rx="10" fill="#0f172a" opacity="0.9"/>
        <text x="72" y="141" fontSize="7" fill="#94a3b8" fontWeight="500">TIME LEFT</text>
        <text x="70" y="154" fontSize="12" fill="#f59e0b" fontWeight="800">00:47</text>
      </motion.g>
      {/* SOLD badge pops, then fades */}
      <motion.g animate={{ scale:[0,1.2,1,1,0], opacity:[0,1,1,1,0] }}
        transition={{ repeat:Infinity, duration:3.5, delay:1, times:[0,0.15,0.3,0.7,1] }}>
        <rect x="60" y="88" width="80" height="28" rx="14" fill="#ef4444" filter="url(#a-soldGlow)"/>
        <text x="80" y="107" fontSize="13" fill="white" fontWeight="900">SOLD!</text>
      </motion.g>
      {/* Ambient sparks */}
      {[{x:18,y:128},{x:182,y:72},{x:174,y:160},{x:12,y:86}].map((p,i)=>(
        <motion.circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#fbbf24"
          animate={{ scale:[1,2.2,1], opacity:[0.3,1,0.3] }}
          transition={{ repeat:Infinity, duration:1.5+i*0.2, delay:i*0.32 }}/>
      ))}
    </svg>
  )
}

// Illustration 7: Reviews / Community 
function IllustrationReviews() {
  return (
    <svg viewBox="0 0 200 180" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="rv-starGlow"><feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#fbbf24" floodOpacity="0.7"/></filter>
        <filter id="rv-cardShadow"><feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#fbbf24" floodOpacity="0.18"/></filter>
      </defs>
      {/* Rating card breathing float */}
      <motion.g animate={{ y:[0,-6,0], scale:[1,1.02,1] }} transition={{ repeat:Infinity, duration:3.8, ease:'easeInOut' }}>
        <rect x="18" y="16" width="164" height="68" rx="14" fill="white" filter="url(#rv-cardShadow)"/>
        <rect x="18" y="16" width="164" height="68" rx="14" stroke="#fbbf24" strokeWidth="1.2" strokeOpacity="0.35"/>
        <text x="33" y="38" fontSize="8" fill="#64748b" fontWeight="600">Overall Rating</text>
        {/* Big score */}
        <motion.text x="33" y="62" fontSize="24" fill="#f59e0b" fontWeight="900"
          animate={{ opacity:[0.8,1,0.8] }} transition={{ repeat:Infinity, duration:2.5 }}>4.9</motion.text>
        {/* Stars filling sequentially */}
        {[108,124,140,156,172].map((x,i)=>(
          <motion.circle key={i} cx={x} cy={52} r="8" fill="#fbbf24" filter="url(#rv-starGlow)"
            animate={{ scale:[0.6,1.25,1], opacity:[0.5,1,0.85] }}
            transition={{ repeat:Infinity, duration:3, delay:i*0.4, times:[0,0.3,1] }}/>
        ))}
        <text x="152" y="75" fontSize="8" fill="#94a3b8">(2.4k)</text>
      </motion.g>
      {/* Review card 1 drifts diagonally */}
      <motion.g animate={{ x:[0,5,0], y:[0,-7,0] }} transition={{ repeat:Infinity, duration:2.9, delay:0.3 }}>
        <rect x="10" y="100" width="88" height="34" rx="10" fill="#ecfdf5" stroke="#10b981" strokeWidth="1" strokeOpacity="0.5"/>
        <text x="18" y="113" fontSize="7" fill="#059669" fontWeight="700">&#x2713; Verified Buyer</text>
        <text x="18" y="126" fontSize="6.5" fill="#475569">"Absolutely perfect!"</text>
        {/* Shimmer sweep */}
        <motion.rect x="10" y="100" width="20" height="34" rx="10" fill="white" opacity="0"
          animate={{ x:[10,98,10], opacity:[0,0.18,0] }} transition={{ repeat:Infinity, duration:2.2, delay:1 }}/>
      </motion.g>
      {/* Review card 2 */}
      <motion.g animate={{ x:[0,-5,0], y:[0,-8,0] }} transition={{ repeat:Infinity, duration:3.3, delay:0.7 }}>
        <rect x="104" y="104" width="84" height="34" rx="10" fill="#eff6ff" stroke="#3b82f6" strokeWidth="1" strokeOpacity="0.5"/>
        <text x="112" y="117" fontSize="7" fill="#2563eb" fontWeight="700">&#x2713; Verified</text>
        <text x="112" y="130" fontSize="6.5" fill="#475569">"5 stars always!"</text>
      </motion.g>
      {/* New review popping in from bottom */}
      <motion.g animate={{ y:[20,0,0,20], opacity:[0,1,1,0] }}
        transition={{ repeat:Infinity, duration:4, delay:1.5, times:[0,0.2,0.8,1], ease:'easeOut' }}>
        <rect x="40" y="145" width="120" height="26" rx="10" fill="#fef9c3" stroke="#eab308" strokeWidth="1" strokeOpacity="0.6"/>
        <text x="54" y="162" fontSize="7" fill="#92400e" fontWeight="700">&#x2605; New: "Game changer!" </text>
      </motion.g>
      {/* Avatars each with unique timing */}
      {[{x:15,c:'#10b981',dur:2.6},{x:35,c:'#3b82f6',dur:3.1},{x:55,c:'#f97316',dur:2.3},{x:75,c:'#8b5cf6',dur:3.5}].map((a,i)=>(
        <motion.circle key={i} cx={a.x} cy={172} r={8} fill={a.c} opacity={0.85}
          animate={{ y:[0,-5,0], scale:[1,1.1,1] }} transition={{ repeat:Infinity, duration:a.dur, delay:i*0.28 }}/>
      ))}
      <text x="96" y="177" fontSize="7.5" fill="#64748b" fontWeight="600">+2,400 reviews</text>
      {/* Ambient stars */}
      {[{x:188,y:26},{x:8,y:164},{x:190,y:160}].map((p,i)=>(
        <motion.circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#fbbf24"
          animate={{ scale:[1,2.2,1], opacity:[0.25,0.9,0.25] }}
          transition={{ repeat:Infinity, duration:1.7, delay:i*0.42 }}/>
      ))}
    </svg>
  )
}

// Illustration 8: Secure Payments 
function IllustrationPayments() {
  return (
    <svg viewBox="0 0 200 180" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="p-cardGrad1" x1="22" y1="44" x2="152" y2="122" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366f1"/><stop offset="1" stopColor="#8b5cf6"/>
        </linearGradient>
        <linearGradient id="p-cardGrad2" x1="30" y1="55" x2="160" y2="133" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0ea5e9"/><stop offset="1" stopColor="#06b6d4"/>
        </linearGradient>
        <filter id="p-shieldGlow"><feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#22c55e" floodOpacity="0.6"/></filter>
        <filter id="p-chipGlow"><feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#fbbf24" floodOpacity="0.5"/></filter>
      </defs>
      {/* Card back bigger rotation */}
      <motion.g animate={{ rotate:[-10,-3,-10], y:[0,-4,0] }} transition={{ repeat:Infinity, duration:4.5, ease:'easeInOut' }}>
        <rect x="28" y="52" width="132" height="80" rx="13" fill="url(#p-cardGrad2)" opacity="0.6"/>
        <rect x="28" y="68" width="132" height="14" fill="white" opacity="0.13"/>
      </motion.g>
      {/* Card front opposite tilt */}
      <motion.g animate={{ rotate:[5,1,5], y:[0,-8,0] }} transition={{ repeat:Infinity, duration:3.8, ease:'easeInOut', delay:0.35 }}>
        <rect x="20" y="42" width="132" height="80" rx="13" fill="url(#p-cardGrad1)"/>
        <rect x="20" y="56" width="132" height="14" fill="white" opacity="0.15"/>
        {/* Chip with shimmer */}
        <motion.rect x="32" y="64" width="22" height="17" rx="4" fill="#fbbf24" opacity="0.9" filter="url(#p-chipGlow)"
          animate={{ opacity:[0.6,1,0.6] }} transition={{ repeat:Infinity, duration:1.5 }}/>
        <rect x="36" y="68" width="14" height="2.5" rx="1" fill="#92400e" opacity="0.5"/>
        <rect x="36" y="73" width="14" height="2.5" rx="1" fill="#92400e" opacity="0.5"/>
        <circle cx="138" cy="68" r="9" fill="white" opacity="0.22"/>
        <circle cx="150" cy="68" r="9" fill="white" opacity="0.14"/>
        <text x="32" y="106" fontSize="8" fill="white" opacity="0.9" fontFamily="monospace">---- ---- 4291</text>
        <text x="32" y="118" fontSize="7" fill="white" opacity="0.65">VALID 08/28</text>
      </motion.g>
      {/* Encrypted data stream dots traveling from card edge to shield */}
      {[0,1,2,3,4].map(i=>(
        <motion.circle key={i} cx={152} cy={85} r="2.5" fill="#22c55e"
          animate={{ cx:[152,160], cy:[85,58], opacity:[0.8,0] }}
          transition={{ repeat:Infinity, duration:1.2, delay:i*0.22, ease:'easeOut' }}/>
      ))}
      {/* Shield heartbeat double-pulse */}
      <motion.g animate={{ scale:[1,1.08,1.03,1.08,1], y:[0,-6,0] }}
        transition={{ repeat:Infinity, duration:1.6, ease:'easeInOut' }}>
        <path d="M154 24 L180 34 L180 60 C180 74 167 85 154 90 C141 85 128 74 128 60 L128 34 Z"
          fill="#22c55e" filter="url(#p-shieldGlow)" opacity="0.93"/>
        <motion.text x="141" y="64" fontSize="18" fill="white" fontWeight="900"
          animate={{ opacity:[0.7,1,0.7] }} transition={{ repeat:Infinity, duration:1.6 }}>&#x2713;</motion.text>
        {/* Lock ring */}
        <circle cx="154" cy="62" r="14" stroke="white" strokeWidth="1" strokeOpacity="0.2" fill="none"/>
      </motion.g>
      {/* Payment method pills */}
      {[{y:136,txt:'Card',c:'#6366f1'},{y:150,txt:'Wallet',c:'#0ea5e9'},{y:164,txt:'Gift Card',c:'#10b981'}].map((m,i)=>(
        <motion.g key={i} animate={{ x:[0,4,0], scale:[1,1.04,1] }} transition={{ repeat:Infinity, duration:2.4, delay:i*0.32 }}>
          <rect x="12" y={m.y-10} width="66" height="15" rx="8" fill={m.c} opacity="0.88"/>
          <text x="20" y={m.y} fontSize="7" fill="white" fontWeight="700">{m.txt}</text>
        </motion.g>
      ))}
      {/* Ambient dots */}
      {[{x:190,y:38},{x:16,y:38},{x:192,y:158}].map((p,i)=>(
        <motion.circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#22c55e"
          animate={{ scale:[1,2,1], opacity:[0.25,0.9,0.25] }}
          transition={{ repeat:Infinity, duration:1.8, delay:i*0.42 }}/>
      ))}
    </svg>
  )
}

// Illustration 9: Digital Downloads 
function IllustrationDownloads() {
  return (
    <svg viewBox="0 0 200 180" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="dl-cloudGrad" x1="65" y1="20" x2="145" y2="65" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38bdf8"/><stop offset="1" stopColor="#818cf8"/>
        </linearGradient>
        <filter id="dl-cloudGlow"><feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#38bdf8" floodOpacity="0.5"/></filter>
        <filter id="dl-fileGlow"><feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#6366f1" floodOpacity="0.35"/></filter>
      </defs>
      {/* Cloud breathes + floats */}
      <motion.g animate={{ y:[0,-6,0], scale:[1,1.03,1] }} transition={{ repeat:Infinity, duration:3.2, ease:'easeInOut' }}>
        <path d="M63 56 Q63 30 87 30 Q94 16 115 20 Q136 8 149 28 Q167 28 167 47 Q174 56 163 64 L71 64 Q56 64 63 56Z"
          fill="url(#dl-cloudGrad)" filter="url(#dl-cloudGlow)" opacity="0.92"/>
        {/* Download arrow with speed burst */}
        <motion.g animate={{ y:[0,6,0], opacity:[0.6,1,0.6] }} transition={{ repeat:Infinity, duration:1.1 }}>
          <line x1="115" y1="64" x2="115" y2="82" stroke="white" strokeWidth="3" strokeLinecap="round"/>
          <path d="M107 76 L115 86 L123 76" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </motion.g>
        {/* Speed lines left of arrow */}
        {[{x:104,y:70},{x:102,y:76},{x:104,y:82}].map((l,i)=>(
          <motion.line key={i} x1={l.x} y1={l.y} x2={l.x-8} y2={l.y} stroke="white" strokeWidth="1.5" strokeLinecap="round"
            animate={{ opacity:[0,0.7,0] }} transition={{ repeat:Infinity, duration:0.8, delay:i*0.12 }}/>
        ))}
      </motion.g>
      {/* File icons spring pop-in then float */}
      {[{x:14,y:80,lbl:'ZIP',c:'#6366f1',d:0},{x:57,y:94,lbl:'PDF',c:'#ef4444',d:0.3},{x:100,y:86,lbl:'EXE',c:'#10b981',d:0.6},{x:143,y:78,lbl:'MP4',c:'#f97316',d:0.9}].map((f,i)=>(
        <motion.g key={i}
          animate={{ y:[f.y-12, f.y+6, f.y-12], scale:[0.85,1.05,0.85] }}
          transition={{ repeat:Infinity, duration:3, delay:f.d }}>
          <rect x={f.x} y={f.y} width="34" height="24" rx="6" fill={f.c} opacity="0.9" filter="url(#dl-fileGlow)"/>
          <rect x={f.x} y={f.y} width="34" height="7" rx="6" fill="white" opacity="0.12"/>
          <text x={f.x+6} y={f.y+16} fontSize="8.5" fill="white" fontWeight="800">{f.lbl}</text>
        </motion.g>
      ))}
      {/* Progress bar */}
      <rect x="20" y="124" width="160" height="14" rx="7" fill="#e2e8f0" opacity="0.4"/>
      <motion.rect x="20" y="124" width="0" height="14" rx="7" fill="#38bdf8" opacity="0.92"
        animate={{ width:[0,160,0] }} transition={{ repeat:Infinity, duration:2.8, ease:'easeInOut' }}/>
      <text x="85" y="135" fontSize="7" fill="#1e293b" fontWeight="600">Downloading...</text>
      {/* Checkmark self-drawing after bar fills */}
      <motion.path d="M24 148 L32 156 L46 140" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"
        animate={{ pathLength:[0,1,1,0], opacity:[0,0,1,1] }}
        transition={{ repeat:Infinity, duration:2.8, times:[0,0.6,0.8,1] }}/>
      {/* Instant delivery badge */}
      <motion.g animate={{ scale:[1,1.07,1] }} transition={{ repeat:Infinity, duration:2, delay:0.5 }}>
        <rect x="54" y="148" width="92" height="22" rx="9" fill="#10b981" opacity="0.9"/>
        <text x="72" y="163" fontSize="8" fill="white" fontWeight="700">&#x26A1; Instant Delivery</text>
      </motion.g>
      {/* Ambient dots */}
      {[{x:12,y:113},{x:190,y:93},{x:13,y:172},{x:190,y:172}].map((p,i)=>(
        <motion.circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#818cf8"
          animate={{ scale:[1,2,1], opacity:[0.25,0.9,0.25] }}
          transition={{ repeat:Infinity, duration:1.6, delay:i*0.32 }}/>
      ))}
    </svg>
  )
}

// Illustration 10: Rewards & Loyalty 
function IllustrationRewards() {
  return (
    <svg viewBox="0 0 200 180" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="rw-coinGrad" x1="80" y1="30" x2="120" y2="90" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fde68a"/><stop offset="0.5" stopColor="#f59e0b"/><stop offset="1" stopColor="#d97706"/>
        </linearGradient>
        <linearGradient id="rw-xpGrad" x1="20" y1="0" x2="180" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a855f7"/><stop offset="1" stopColor="#ec4899"/>
        </linearGradient>
        <filter id="rw-coinGlow"><feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#f59e0b" floodOpacity="0.7"/></filter>
        <filter id="rw-trophyGlow"><feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#f59e0b" floodOpacity="0.6"/></filter>
      </defs>
      {/* Coin flip animation (scaleX) + slow orbit */}
      <motion.g style={{ transformOrigin:'100px 58px' }}
        animate={{ scaleX:[1,0.15,1,-0.15,1] }}
        transition={{ repeat:Infinity, duration:3, ease:'easeInOut', delay:0.5 }}>
        <circle cx="100" cy="58" r="34" fill="url(#rw-coinGrad)" filter="url(#rw-coinGlow)"/>
        <circle cx="100" cy="58" r="27" fill="none" stroke="#fde68a" strokeWidth="1.5" strokeOpacity="0.55"/>
        <text x="88" y="65" fontSize="19" fill="#92400e" fontWeight="900">G</text>
        {/* Coin edge shimmer */}
        <motion.circle cx="100" cy="58" r="34" fill="none" stroke="#fffbeb" strokeWidth="3" strokeOpacity="0"
          animate={{ strokeOpacity:[0,0.4,0] }} transition={{ repeat:Infinity, duration:3 }}/>
      </motion.g>
      {/* Sparkle burst around coin */}
      {[{x:58,y:30},{x:142,y:26},{x:24,y:72},{x:176,y:78},{x:52,y:12},{x:148,y:14}].map((s,i)=>(
        <motion.circle key={i} cx={s.x} cy={s.y} r="3" fill="#fbbf24"
          animate={{ scale:[0.4,1.6,0.4], opacity:[0.1,1,0.1] }}
          transition={{ repeat:Infinity, duration:1.5, delay:i*0.22 }}/>
      ))}
      {/* +50pts particles floating up */}
      {[{x:78},{x:100},{x:122}].map((p,i)=>(
        <motion.g key={i} animate={{ y:[-0,-25,-50], opacity:[0,1,0] }}
          transition={{ repeat:Infinity, duration:2, delay:i*0.6 }}>
          <text x={p.x} y={130} fontSize="8" fill="#a855f7" fontWeight="800">+50</text>
        </motion.g>
      ))}
      {/* Trophy wobble + float */}
      <motion.g animate={{ rotate:[-5,5,-5], y:[0,-6,0] }}
        transition={{ repeat:Infinity, duration:2.2, ease:'easeInOut', delay:0.4 }}>
        <path d="M146 88 L157 110 L174 112 L161 125 L164 142 L146 133 L128 142 L131 125 L118 112 L135 110 Z"
          fill="#f59e0b" filter="url(#rw-trophyGlow)" opacity="0.92"/>
        {/* Trophy shine */}
        <motion.path d="M140 96 L146 108" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0"
          animate={{ opacity:[0,0.5,0] }} transition={{ repeat:Infinity, duration:2.2 }}/>
      </motion.g>
      {/* XP bar */}
      <rect x="18" y="108" width="116" height="13" rx="6.5" fill="#e2e8f0" opacity="0.35"/>
      <motion.rect x="18" y="108" width="0" height="13" rx="6.5" fill="url(#rw-xpGrad)" opacity="0.92"
        animate={{ width:[0,100,0] }} transition={{ repeat:Infinity, duration:3.2, ease:'easeInOut' }}/>
      <text x="30" y="119" fontSize="7" fill="white" fontWeight="700">XP Progress</text>
      {/* Tier badges sequential lighting */}
      {[{x:14,tier:'Bronze',c:'#cd7f32',d:0},{x:62,tier:'Silver',c:'#94a3b8',d:0.4},{x:110,tier:'Gold',c:'#f59e0b',d:0.8}].map((t,i)=>(
        <motion.g key={i} animate={{ y:[0,-4,0], scale:[1,1.1,1] }}
          transition={{ repeat:Infinity, duration:2.2, delay:t.d }}>
          <rect x={t.x} y={128} width="46" height="17" rx="8.5" fill={t.c} opacity="0.88"/>
          <motion.rect x={t.x} y={128} width="46" height="17" rx="8.5" fill="white" opacity="0"
            animate={{ opacity:[0,0.2,0] }} transition={{ repeat:Infinity, duration:2.2, delay:t.d }}/>
          <text x={t.x+7} y={140} fontSize="7" fill="white" fontWeight="700">{t.tier}</text>
        </motion.g>
      ))}
      {/* +50 pts badge */}
      <motion.g animate={{ scale:[1,1.08,1] }} transition={{ repeat:Infinity, duration:2, delay:0.3 }}>
        <rect x="36" y="152" width="128" height="20" rx="10" fill="#a855f7" opacity="0.9"/>
        <text x="60" y="166" fontSize="8" fill="white" fontWeight="700">+50 pts per purchase</text>
      </motion.g>
    </svg>
  )
}

// Slide data 
const slides: HeroSlide[] = [
  {
    id: 1,
    badge: 'Welcome to Grapsee Mall',
    badgeDot: false,
    title: 'Build Your',
    highlight: 'Digital Empire',
    description: 'Premium websites, apps & DevOps  crafted by elite engineers. Your one-stop digital shopping mall.',
    cta: 'Shop Now',
    ctaSecondary: 'Browse All Products',
    accent: '#10b981',
    accentBg: 'bg-emerald-500',
    accentText: 'text-emerald-500',
    badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    gradient: 'from-emerald-600/25 via-teal-500/10 to-transparent',
    orb1: 'bg-emerald-500/20',
    orb2: 'bg-teal-400/15',
    icon: <Sparkles className="h-3.5 w-3.5" />,
    Illustration: IllustrationEmpire,
  },
  {
    id: 2,
    badge: 'Flash Deals Live',
    badgeDot: true,
    title: 'Up to',
    highlight: '50% OFF',
    description: "Limited-time deals on Digital services. Don't miss out on the biggest sale of the season!",
    cta: 'Grab Deals',
    ctaSecondary: 'View All Deals',
    accent: '#f97316',
    accentBg: 'bg-orange-500',
    accentText: 'text-orange-500',
    badgeBg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    gradient: 'from-orange-600/25 via-amber-500/10 to-transparent',
    orb1: 'bg-orange-500/20',
    orb2: 'bg-amber-400/15',
    icon: <Zap className="h-3.5 w-3.5" />,
    Illustration: IllustrationFlash,
  },
  {
    id: 3,
    badge: 'New Arrivals',
    badgeDot: false,
    title: 'Next-Gen Tech,',
    highlight: 'Built for You',
    description: 'AI-powered tools and next-gen applications  the sharpest digital products now in one marketplace.',
    cta: 'Explore Tech',
    ctaSecondary: 'Browse AI Tools',
    accent: '#8b5cf6',
    accentBg: 'bg-violet-500',
    accentText: 'text-violet-500',
    badgeBg: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    gradient: 'from-violet-600/25 via-purple-500/10 to-transparent',
    orb1: 'bg-violet-500/20',
    orb2: 'bg-purple-400/15',
    icon: <Cpu className="h-3.5 w-3.5" />,
    Illustration: IllustrationAI,
  },
  {
    id: 4,
    badge: 'Creative Studio',
    badgeDot: false,
    title: 'Design That',
    highlight: 'Actually Sells',
    description: 'UI kits, brand templates & design systems built by professionals. Make your product impossible to ignore.',
    cta: 'Shop Designs',
    ctaSecondary: 'Browse UI Kits',
    accent: '#e879f9',
    accentBg: 'bg-fuchsia-500',
    accentText: 'text-fuchsia-500',
    badgeBg: 'bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400',
    gradient: 'from-fuchsia-600/25 via-pink-500/10 to-transparent',
    orb1: 'bg-fuchsia-500/20',
    orb2: 'bg-pink-400/15',
    icon: <Palette className="h-3.5 w-3.5" />,
    Illustration: IllustrationDesign,
  },
  {
    id: 5,
    badge: 'Ship Faster',
    badgeDot: false,
    title: 'Launch Faster.',
    highlight: 'Grow Bigger.',
    description: 'Ready-to-deploy solutions for startups and enterprises. Go from idea to live product in days, not months.',
    cta: 'Get Started',
    ctaSecondary: 'View Enterprise',
    accent: '#38bdf8',
    accentBg: 'bg-sky-500',
    accentText: 'text-sky-500',
    badgeBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
    gradient: 'from-sky-600/25 via-cyan-500/10 to-transparent',
    orb1: 'bg-sky-500/20',
    orb2: 'bg-cyan-400/15',
    icon: <Rocket className="h-3.5 w-3.5" />,
    Illustration: IllustrationRocket,
  },
  {
    id: 6,
    badge: 'Live Auctions',
    badgeDot: true,
    title: 'Bid Smart.',
    highlight: 'Win Big.',
    description: 'Real-time auctions on premium digital products. Place your bid, track live countdowns, and claim exclusive deals.',
    cta: 'Join Auction',
    ctaSecondary: 'Browse Lots',
    accent: '#f59e0b',
    accentBg: 'bg-amber-500',
    accentText: 'text-amber-500',
    badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    gradient: 'from-amber-600/25 via-yellow-500/10 to-transparent',
    orb1: 'bg-amber-500/20',
    orb2: 'bg-yellow-400/15',
    icon: <Gavel className="h-3.5 w-3.5" />,
    Illustration: IllustrationAuction,
  },
  {
    id: 7,
    badge: 'Trusted Community',
    badgeDot: false,
    title: 'Rated by',
    highlight: 'Real Buyers',
    description: 'Over 2,400 verified reviews from real customers. Every product rated, every seller accountable.',
    cta: 'Read Reviews',
    ctaSecondary: 'Write a Review',
    accent: '#eab308',
    accentBg: 'bg-yellow-500',
    accentText: 'text-yellow-500',
    badgeBg: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
    gradient: 'from-yellow-600/20 via-amber-400/10 to-transparent',
    orb1: 'bg-yellow-500/20',
    orb2: 'bg-amber-300/15',
    icon: <Star className="h-3.5 w-3.5" />,
    Illustration: IllustrationReviews,
  },
  {
    id: 8,
    badge: 'Secure Checkout',
    badgeDot: false,
    title: 'Pay Your Way,',
    highlight: 'Always Safe.',
    description: 'Card, wallet, gift card  every payment method, fully encrypted and protected. Zero-risk checkout.',
    cta: 'Shop Safely',
    ctaSecondary: 'Payment Options',
    accent: '#22c55e',
    accentBg: 'bg-green-500',
    accentText: 'text-green-500',
    badgeBg: 'bg-green-500/10 text-green-600 dark:text-green-400',
    gradient: 'from-green-600/20 via-emerald-400/10 to-transparent',
    orb1: 'bg-green-500/20',
    orb2: 'bg-emerald-300/15',
    icon: <CreditCard className="h-3.5 w-3.5" />,
    Illustration: IllustrationPayments,
  },
  {
    id: 9,
    badge: 'Digital Downloads',
    badgeDot: false,
    title: 'Buy Once.',
    highlight: 'Use Forever.',
    description: 'Instant download on all digital products  software, templates, ebooks, and more. Delivered in seconds.',
    cta: 'Browse Downloads',
    ctaSecondary: 'View All Files',
    accent: '#6366f1',
    accentBg: 'bg-indigo-500',
    accentText: 'text-indigo-500',
    badgeBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    gradient: 'from-indigo-600/22 via-violet-400/10 to-transparent',
    orb1: 'bg-indigo-500/20',
    orb2: 'bg-violet-300/15',
    icon: <Download className="h-3.5 w-3.5" />,
    Illustration: IllustrationDownloads,
  },
  {
    id: 10,
    badge: 'Loyalty Rewards',
    badgeDot: false,
    title: 'Every Purchase',
    highlight: 'Earns Points.',
    description: 'Earn points on every order. Unlock Bronze, Silver, Gold tiers and redeem rewards in the Loyalty Mall.',
    cta: 'Earn Points',
    ctaSecondary: 'View Rewards',
    accent: '#a855f7',
    accentBg: 'bg-purple-500',
    accentText: 'text-purple-500',
    badgeBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    gradient: 'from-purple-600/22 via-pink-400/10 to-transparent',
    orb1: 'bg-purple-500/20',
    orb2: 'bg-pink-400/15',
    icon: <Trophy className="h-3.5 w-3.5" />,
    Illustration: IllustrationRewards,
  },
]

// Component 
export function Hero() {
  const { goCategory, goDeals, goSearch, goAuctions, goReviews, goDigitalDownloads, goRewards } = useShopRouter()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [progress, setProgress] = useState(0)
  const progressRef = useRef<NodeJS.Timeout | null>(null)
  const startRef = useRef<number>(Date.now())

  const goToSlide = useCallback((idx: number) => {
    setCurrentSlide(idx)
    setProgress(0)
    startRef.current = Date.now()
  }, [])

  const nextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % slides.length)
  }, [currentSlide, goToSlide])

  const prevSlide = useCallback(() => {
    goToSlide((currentSlide - 1 + slides.length) % slides.length)
  }, [currentSlide, goToSlide])

  // Progress ticker
  useEffect(() => {
    setProgress(0)
    startRef.current = Date.now()
    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startRef.current
      const pct = Math.min((elapsed / SLIDE_DURATION) * 100, 100)
      setProgress(pct)
      if (pct >= 100) {
        clearInterval(progressRef.current!)
        nextSlide()
      }
    }, 50)
    return () => clearInterval(progressRef.current!)
  }, [currentSlide, nextSlide])

  const slide = slides[currentSlide]

  const handleCta = () => {
    if (slide.id === 2) goDeals()
    else if (slide.id === 6) goAuctions()
    else if (slide.id === 7) goReviews()
    else if (slide.id === 9) goDigitalDownloads()
    else if (slide.id === 10) goRewards()
    else goCategory()
  }

  const handleSecondaryCta = () => {
    if (slide.id === 2) goDeals()
    else if (slide.id === 6) goAuctions()
    else if (slide.id === 7) goReviews()
    else if (slide.id === 9) goDigitalDownloads()
    else if (slide.id === 10) goRewards()
    else goSearch()
  }

  return (
    <section className="relative overflow-hidden liquid-scene">
      {/* Animated gradient background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`bg-${slide.id}`}
          className={`absolute inset-0 bg-gradient-to-br ${slide.gradient}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
      </AnimatePresence>

      {/* Primary orbs */}
      <motion.div className={`absolute -right-16 -top-16 h-64 w-64 rounded-full ${slide.orb1} blur-3xl`}
        initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1, y: [0, -18, 0] }}
        transition={{ opacity: { duration: 0.8 }, scale: { duration: 0.8 }, y: { repeat: Infinity, duration: 5.5, ease: 'easeInOut' } }} />
      <motion.div className={`absolute -left-8 bottom-4 h-48 w-48 rounded-full ${slide.orb2} blur-2xl`}
        initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1, y: [0, -12, 0] }}
        transition={{ opacity: { duration: 0.8, delay: 0.1 }, scale: { duration: 0.8, delay: 0.1 }, y: { repeat: Infinity, duration: 7, ease: 'easeInOut', delay: 0.7 } }} />

      {/* 
 DEEP OCEAN LIQUID LAYER Heart of the design
 */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">

        {/* Aurora flow widest, slowest */}
        <div className="absolute inset-0 liquid-aurora opacity-55" />

        {/* Caustic light conic rotation overlay */}
        <div className="absolute inset-0 liquid-caustic" />

        {/* Blob depth 1 large, back-left, very slow */}
        <div className="absolute liquid-blob" style={{ width:420, height:420, top:'-8%', left:'-10%', animationDuration:'22s', animationDelay:'-3s', opacity:0.32, filter:'blur(2px)' }} />

        {/* Blob depth 2 medium, right, mid speed */}
        <div className="absolute liquid-blob-slow" style={{ width:300, height:300, top:'5%', right:'-5%', animationDuration:'17s', animationDelay:'-7s', opacity:0.42, filter:'blur(1px)' }} />

        {/* Blob depth 3 accent, center-bottom */}
        <div className="absolute liquid-blob-accent" style={{ width:240, height:240, bottom:'0%', left:'35%', animationDuration:'11s', animationDelay:'-2s', opacity:0.50 }} />

        {/* Blob depth 4 tiny top-right spark */}
        <div className="absolute liquid-blob-accent" style={{ width:110, height:110, top:'20%', right:'25%', animationDuration:'8s', animationDelay:'-5s', opacity:0.45 }} />

        {/* Blob depth 5 mid-left whisper */}
        <div className="absolute liquid-blob-slow" style={{ width:180, height:180, top:'50%', left:'10%', animationDuration:'25s', animationDelay:'-12s', opacity:0.28, filter:'blur(3px)' }} />

        {/* Concentric ripple rings */}
        <motion.div className="absolute rounded-full" style={{ width:80, height:80, top:'35%', left:'50%', marginLeft:-40, marginTop:-40, border:'1.5px solid oklch(0.637 0.176 162 / 50%)' }}
          animate={{ scale:[1,2.2], opacity:[0.6,0] }} transition={{ repeat:Infinity, duration:3.5, ease:'easeOut' }} />
        <motion.div className="absolute rounded-full" style={{ width:80, height:80, top:'35%', left:'50%', marginLeft:-40, marginTop:-40, border:'1.5px solid oklch(0.637 0.176 162 / 35%)' }}
          animate={{ scale:[1,3.4], opacity:[0.35,0] }} transition={{ repeat:Infinity, duration:3.5, ease:'easeOut', delay:1.2 }} />
        <motion.div className="absolute rounded-full" style={{ width:80, height:80, top:'35%', left:'50%', marginLeft:-40, marginTop:-40, border:'1.5px solid oklch(0.637 0.176 162 / 20%)' }}
          animate={{ scale:[1,4.8], opacity:[0.18,0] }} transition={{ repeat:Infinity, duration:3.5, ease:'easeOut', delay:2.4 }} />

        {/* Floating particles plankton drift */}
        {[
          { w:5, h:5, top:'15%', left:'18%', dur:4.2, delay:0 },
          { w:3, h:3, top:'72%', left:'8%',  dur:5.5, delay:-1.5 },
          { w:6, h:6, top:'30%', left:'82%', dur:3.8, delay:-0.8 },
          { w:4, h:4, top:'60%', left:'75%', dur:6.1, delay:-3 },
          { w:3, h:3, top:'85%', left:'45%', dur:4.8, delay:-2 },
          { w:5, h:5, top:'10%', left:'60%', dur:5.2, delay:-4 },
          { w:2, h:2, top:'45%', left:'28%', dur:3.5, delay:-1 },
          { w:4, h:4, top:'55%', left:'92%', dur:7,   delay:-5 },
        ].map((p, i) => (
          <motion.div key={i}
            className={`absolute rounded-full ${i%3===0?'liquid-particle-jade':i%3===1?'liquid-particle-emerald':'liquid-particle-mint'}`}
            style={{ width:p.w, height:p.h, top:p.top, left:p.left, opacity:0.5 }}
            animate={{ y:[0,-20,-8,0], x:[0,6,-4,0], scale:[1,1.2,0.9,1], opacity:[0.4,0.8,0.5,0.4] }}
            transition={{ repeat:Infinity, duration:p.dur, delay:p.delay, ease:'easeInOut' }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 px-4 py-8 sm:px-8 sm:py-12 md:px-12 md:py-16 lg:py-20 max-w-7xl mx-auto">
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-6 sm:gap-8 lg:gap-12">

          {/* Left: Text */}
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <AnimatePresence mode="wait">
              <motion.div
                key={`text-${slide.id}`}
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 18 }}
                transition={{ duration: 0.35 }}
              >
                {/* Badge */}
                <motion.div
                  className={`mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] sm:text-[11px] font-bold ${slide.badgeBg} backdrop-blur-md shadow-sm border border-white/10`}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                >
                  {slide.badgeDot && (
                    <motion.span
                      className="h-1.5 w-1.5 rounded-full bg-current"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    />
                  )}
                  {slide.icon}
                  {slide.badge}
                </motion.div>

                {/* Title */}
                <motion.h1
                  className="mb-3 text-[24px] xs:text-[28px] sm:text-[32px] md:text-[40px] lg:text-[46px] xl:text-[52px] font-extrabold leading-tight tracking-tight text-foreground"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {slide.title}
                  <br />
                  <motion.span
                    className="text-gradient-animated"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.18 }}
                  >
                    {slide.highlight}
                  </motion.span>
                </motion.h1>

                {/* Description */}
                <motion.p
                  className="mb-6 text-xs sm:text-sm md:text-base leading-relaxed text-muted-foreground max-w-xl mx-auto sm:mx-0"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.22 }}
                >
                  {slide.description}
                </motion.p>

                {/* CTAs */}
                <motion.div
                  className="flex items-center justify-center sm:justify-start gap-2.5"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.28 }}
                >
                  <Button
                    size="sm"
                    className="btn-liquid gap-1.5 text-white text-xs sm:text-sm font-bold shadow-lg px-5 py-2 sm:py-2.5"
                    style={{ backgroundColor: slide.accent, boxShadow: `0 6px 22px ${slide.accent}50` }}
                    onClick={handleCta}
                  >
                    {slide.cta}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-border/50 bg-background/40 backdrop-blur-md text-xs sm:text-sm px-4 py-2 sm:py-2.5 transition-all hover:bg-background/60 active:scale-95"
                    onClick={handleSecondaryCta}
                  >
                    {slide.ctaSecondary}
                  </Button>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: Illustration */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`illus-${slide.id}`}
              className="w-[120px] h-[120px] xs:w-[150px] xs:h-[150px] sm:w-[180px] sm:h-[180px] md:w-[240px] md:h-[240px] lg:w-[300px] lg:h-[300px] xl:w-[350px] xl:h-[350px] flex-shrink-0"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              transition={{ duration: 0.45, type: 'spring', stiffness: 260, damping: 18, bounce: 0.45 }}
            >
              <slide.Illustration />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="mt-4 flex items-center justify-between">
          {/* Dot indicators */}
          <div className="flex items-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className="relative overflow-hidden rounded-full transition-all duration-300"
                style={{
                  width: i === currentSlide ? 24 : 6,
                  height: 6,
                  backgroundColor: i === currentSlide ? slide.accent : undefined,
                }}
              >
                {i !== currentSlide && (
                  <span className="absolute inset-0 rounded-full bg-muted-foreground/30 hover:bg-muted-foreground/50 transition-colors" />
                )}
                {i === currentSlide && (
                  <motion.span
                    className="absolute inset-y-0 left-0 rounded-full opacity-40"
                    style={{ backgroundColor: slide.accent, width: `${progress}%` }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Slide counter + arrows */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold tabular-nums text-muted-foreground w-9 text-center">
              {String(currentSlide + 1).padStart(2, '0')}/{String(slides.length).padStart(2, '0')}
            </span>
            <button
              onClick={prevSlide}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/50 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-90"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextSlide}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/50 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-90"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Progress bar liquid shimmer strip at bottom */}
      <div className="relative h-1 w-full overflow-hidden" style={{ background: 'oklch(0.18 0.008 162 / 12%)' }}>
        {/* Glowing fill */}
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${slide.accent}aa, ${slide.accent}, ${slide.accent}cc)`,
            boxShadow: `0 0 8px 2px ${slide.accent}60`,
          }}
          transition={{ ease: 'linear' }}
        />
        {/* Aurora shimmer sweep on top */}
        <motion.div
          className="absolute inset-y-0 w-16 rounded-full"
          style={{
            left: `${progress}%`,
            background: `linear-gradient(90deg, transparent, ${slide.accent}80, transparent)`,
            transform: 'translateX(-50%)',
          }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
        />
      </div>
    </section>
  )
}

