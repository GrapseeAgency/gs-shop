'use client'

import { useState, useEffect } from 'react'
import { Eye, Zap, ShoppingCart, Users, Baby, Moon, WifiOff, Signal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

const MODES = [
  { 
    id: 'browse', 
    name: 'Browse Mode', 
    icon: Eye,
    description: 'Relaxed, exploratory shopping with recommendations',
    features: ['Animations enabled', 'Full recommendations', 'Grid layout', 'Discovery focused']
  },
  { 
    id: 'buy', 
    name: 'Buy Mode', 
    icon: ShoppingCart,
    description: 'Fast, minimal interface for quick purchases',
    features: ['No animations', 'Minimal recommendations', 'List layout', 'One-click checkout']
  },
  { 
    id: 'elderly', 
    name: 'Elderly Mode', 
    icon: Users,
    description: 'Large text, simple navigation, voice support',
    features: ['Extra large text', 'High contrast', 'Voice enabled', 'Simplified UI']
  },
  { 
    id: 'power', 
    name: 'Power User', 
    icon: Zap,
    description: 'Keyboard shortcuts, batch ops, advanced filters',
    features: ['Keyboard shortcuts', 'Batch operations', 'Spreadsheet view', 'Quick filters']
  },
  { 
    id: 'dark-room', 
    name: 'Dark Room', 
    icon: Moon,
    description: 'Ultra-dark OLED black for late-night shopping',
    features: ['True black background', 'Reduced brightness', 'Eye strain reduction', 'Battery saving']
  },
  { 
    id: 'low-bandwidth', 
    name: 'Low Bandwidth', 
    icon: Signal,
    description: 'Compressed images, no animations for slow connections',
    features: ['Compressed images', 'No animations', 'Fast loading', 'Text priority']
  }
]

export default function PersonaModePage() {
  const [currentMode, setCurrentMode] = useState('browse')
  const [autoDetect, setAutoDetect] = useState(false)

  useEffect(() => {
    fetchCurrentMode()
  }, [])

  const fetchCurrentMode = async () => {
    try {
      const res = await fetch('/api/adaptive/persona-mode')
      if (res.ok) {
        const data = await res.json()
        setCurrentMode(data.mode)
        setAutoDetect(data.autoDetect)
      }
    } catch (error) {
      console.error('Error fetching mode:', error)
    }
  }

  const setMode = async (modeId: string) => {
    try {
      const res = await fetch('/api/adaptive/persona-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: modeId, autoDetect })
      })

      if (res.ok) {
        setCurrentMode(modeId)
        toast.success(`Switched to ${MODES.find(m => m.id === modeId)?.name}`)
      }
    } catch (error) {
      toast.error('Failed to switch mode')
    }
  }

  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Eye className="h-6 w-6 text-blue-500" />
          Adaptive Persona Mode
        </h1>
        <p className="text-muted-foreground">
          Customize your shopping experience based on your current needs
        </p>
      </div>

      {/* Auto Detect */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto-Detect Mode</p>
              <p className="text-sm text-muted-foreground">
                AI automatically switches modes based on your behavior
              </p>
            </div>
            <Switch checked={autoDetect} onCheckedChange={setAutoDetect} />
          </div>
        </CardContent>
      </Card>

      {/* Mode Grid */}
      <div className="grid gap-4">
        {MODES.map((mode) => {
          const Icon = mode.icon
          const isActive = currentMode === mode.id
          
          return (
            <Card 
              key={mode.id}
              className={`cursor-pointer transition-all ${isActive ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => setMode(mode.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-muted'}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{mode.name}</h3>
                      {isActive && <Badge>Active</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{mode.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {mode.features.map((feature, i) => (
                        <span key={i} className="text-xs bg-muted px-2 py-1 rounded">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Current Mode Preview */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Current Mode: {MODES.find(m => m.id === currentMode)?.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`p-4 rounded-lg ${currentMode === 'dark-room' ? 'bg-black text-white' : 'bg-muted'}`}>
            <p className={`${currentMode === 'elderly' ? 'text-xl' : 'text-sm'}`}>
              This is how the interface will look in {MODES.find(m => m.id === currentMode)?.name}.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
