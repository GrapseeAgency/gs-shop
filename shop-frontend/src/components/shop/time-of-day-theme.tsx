'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon, Sunrise, Sunset } from 'lucide-react'

export function TimeOfDayTheme() {
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'night' | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const updateTimeOfDay = () => {
      const hour = new Date().getHours()
      
      if (hour >= 5 && hour < 12) {
        setTimeOfDay('morning')
      } else if (hour >= 12 && hour < 17) {
        setTimeOfDay('afternoon')
      } else if (hour >= 17 && hour < 21) {
        setTimeOfDay('evening')
      } else {
        setTimeOfDay('night')
      }
    }

    updateTimeOfDay()
    const interval = setInterval(updateTimeOfDay, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [])

  if (!mounted || !timeOfDay) return null

  const themes = {
    morning: {
      icon: Sunrise,
      greeting: 'Good Morning!',
      subtext: 'Fresh start, new deals',
      bgGradient: 'from-orange-100 to-yellow-50',
      accentColor: 'text-orange-600'
    },
    afternoon: {
      icon: Sun,
      greeting: 'Good Afternoon!',
      subtext: 'Midday shopping spree',
      bgGradient: 'from-blue-50 to-cyan-50',
      accentColor: 'text-blue-600'
    },
    evening: {
      icon: Sunset,
      greeting: 'Good Evening!',
      subtext: 'Wind down with great finds',
      bgGradient: 'from-purple-100 to-pink-50',
      accentColor: 'text-purple-600'
    },
    night: {
      icon: Moon,
      greeting: 'Good Night!',
      subtext: 'Late night deals await',
      bgGradient: 'from-slate-100 to-gray-50',
      accentColor: 'text-indigo-600'
    }
  }

  const theme = themes[timeOfDay]
  const Icon = theme.icon

  return (
    <div className={`p-4 rounded-xl bg-gradient-to-r ${theme.bgGradient} transition-all duration-500`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full bg-glass-deep/50 ${theme.accentColor}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className={`font-semibold ${theme.accentColor}`}>{theme.greeting}</p>
          <p className="text-xs text-muted-foreground">{theme.subtext}</p>
        </div>
      </div>
    </div>
  )
}

