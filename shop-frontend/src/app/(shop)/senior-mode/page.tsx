'use client'

import { useState } from 'react'
import { Glasses, Type, Volume2, Sun, Moon, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function SeniorModePage() {
  const [settings, setSettings] = useState({
    largeText: true,
    highContrast: false,
    voiceAssist: true,
    simpleMode: true,
  })

  const toggle = (key: string) => {
    setSettings({ ...settings, [key]: !settings[key as keyof typeof settings] })
  }

  const save = () => {
    toast.success('Senior mode settings saved!')
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Glasses className="h-8 w-8 text-purple-600" />
          Senior Mode
        </h1>
        <p className="text-muted-foreground">
          Larger fonts, voice assistant, simplified navigation, health essentials
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Accessibility Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Type className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Large Text</p>
                <p className="text-sm text-muted-foreground">Increase font size</p>
              </div>
            </div>
            <Switch checked={settings.largeText} onCheckedChange={() => toggle('largeText')} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sun className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium">High Contrast</p>
                <p className="text-sm text-muted-foreground">Better visibility</p>
              </div>
            </div>
            <Switch checked={settings.highContrast} onCheckedChange={() => toggle('highContrast')} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Volume2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Voice Assistant</p>
                <p className="text-sm text-muted-foreground">Read product details aloud</p>
              </div>
            </div>
            <Switch checked={settings.voiceAssist} onCheckedChange={() => toggle('voiceAssist')} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium">Simple Mode</p>
                <p className="text-sm text-muted-foreground">Reduced interface elements</p>
              </div>
            </div>
            <Switch checked={settings.simpleMode} onCheckedChange={() => toggle('simpleMode')} />
          </div>

          <Button className="w-full" size="lg" onClick={save}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
