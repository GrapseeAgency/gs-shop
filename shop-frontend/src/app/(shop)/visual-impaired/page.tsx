'use client'

import { useState } from 'react'
import { Eye, Volume2, Mic, Type, Headphones } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function VisualImpairedPage() {
  const [features, setFeatures] = useState({
    screenReader: true,
    voiceNav: true,
    audioDesc: true,
    highContrast: true,
  })

  const toggle = (key: string) => {
    setFeatures({ ...features, [key]: !features[key as keyof typeof features] })
  }

  const demoAudio = () => {
    toast.success('Playing audio description...')
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Eye className="h-8 w-8 text-indigo-600" />
          Visual Impaired Mode
        </h1>
        <p className="text-muted-foreground">
          Screen reader ready, audio descriptions, voice navigation, Braille support
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Headphones className="h-5 w-5" />
            Accessibility Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Volume2 className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Screen Reader</p>
                <p className="text-sm text-muted-foreground">Read all text aloud</p>
              </div>
            </div>
            <Switch checked={features.screenReader} onCheckedChange={() => toggle('screenReader')} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mic className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Voice Navigation</p>
                <p className="text-sm text-muted-foreground">Control with voice commands</p>
              </div>
            </div>
            <Switch checked={features.voiceNav} onCheckedChange={() => toggle('voiceNav')} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Type className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium">High Contrast</p>
                <p className="text-sm text-muted-foreground">Maximum visibility</p>
              </div>
            </div>
            <Switch checked={features.highContrast} onCheckedChange={() => toggle('highContrast')} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Headphones className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-medium">Audio Descriptions</p>
                <p className="text-sm text-muted-foreground">Describe product images</p>
              </div>
            </div>
            <Switch checked={features.audioDesc} onCheckedChange={() => toggle('audioDesc')} />
          </div>

          <Button className="w-full" size="lg" onClick={demoAudio}>
            <Volume2 className="h-4 w-4 mr-2" />
            Demo Audio Description
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
