'use client'

import { useState } from 'react'
import { Cpu, HardDrive, Zap, Box, Layers, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

const COMPONENTS = {
  cpu: ['Intel i5', 'Intel i7', 'Intel i9', 'AMD Ryzen 5', 'AMD Ryzen 7', 'AMD Ryzen 9'],
  gpu: ['RTX 4060', 'RTX 4070', 'RTX 4080', 'RTX 4090', 'RX 7600', 'RX 7700 XT'],
  ram: ['16GB DDR5', '32GB DDR5', '64GB DDR5'],
  storage: ['512GB NVMe', '1TB NVMe', '2TB NVMe', '4TB NVMe'],
  psu: ['550W', '650W', '750W', '850W', '1000W'],
  motherboard: ['B650', 'X670', 'Z790', 'B760'],
  case: ['Mid Tower', 'Full Tower', 'Mini ITX']
}

const PRICES: Record<string, number> = {
  'Intel i5': 25000, 'Intel i7': 45000, 'Intel i9': 65000,
  'AMD Ryzen 5': 22000, 'AMD Ryzen 7': 40000, 'AMD Ryzen 9': 60000,
  'RTX 4060': 35000, 'RTX 4070': 55000, 'RTX 4080': 95000, 'RTX 4090': 175000,
  '16GB DDR5': 8000, '32GB DDR5': 15000, '64GB DDR5': 35000,
  '512GB NVMe': 6000, '1TB NVMe': 10000, '2TB NVMe': 18000, '4TB NVMe': 35000,
  '550W': 5000, '650W': 7000, '750W': 9000, '850W': 12000, '1000W': 18000,
  'B650': 15000, 'X670': 28000, 'Z790': 30000, 'B760': 14000,
  'Mid Tower': 6000, 'Full Tower': 10000, 'Mini ITX': 8000
}

export default function PCBuilderPage() {
  const [build, setBuild] = useState<Record<string, string>>({})
  const [warnings, setWarnings] = useState<string[]>([])
  const [calculating, setCalculating] = useState(false)

  const selectComponent = (category: string, value: string) => {
    setBuild(prev => ({ ...prev, [category]: value }))
    setWarnings([])
  }

  const calculateBuild = async () => {
    setCalculating(true)
    
    try {
      const res = await fetch('/api/modular/pc-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ build })
      })

      if (res.ok) {
        const data = await res.json()
        setWarnings(data.warnings || [])
        
        if (data.warnings.length > 0) {
          toast.warning('Compatibility issues found!')
        } else {
          toast.success('Build looks great!')
        }
      }
    } catch (error) {
      toast.error('Failed to calculate')
    } finally {
      setCalculating(false)
    }
  }

  const totalPrice = Object.values(build).reduce((sum, component) => sum + (PRICES[component] || 0), 0)
  const completedComponents = Object.keys(build).length
  const progress = (completedComponents / 7) * 100

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Cpu className="h-6 w-6 text-blue-500" />
          PC Builder Wizard
        </h1>
        <p className="text-muted-foreground">
          Build your dream PC with AI compatibility checking
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Component Selection */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Cpu className="h-4 w-4" />
                Processor (CPU)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {COMPONENTS.cpu.map(cpu => (
                  <Button
                    key={cpu}
                    variant={build.cpu === cpu ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => selectComponent('cpu', cpu)}
                  >
                    {cpu}
                    <span className="ml-2 text-xs opacity-70">{PRICES[cpu]?.toLocaleString()}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Graphics Card (GPU)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {COMPONENTS.gpu.map(gpu => (
                  <Button
                    key={gpu}
                    variant={build.gpu === gpu ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => selectComponent('gpu', gpu)}
                  >
                    {gpu}
                    <span className="ml-2 text-xs opacity-70">{PRICES[gpu]?.toLocaleString()}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="h-4 w-4" />
                RAM
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {COMPONENTS.ram.map(ram => (
                  <Button
                    key={ram}
                    variant={build.ram === ram ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => selectComponent('ram', ram)}
                  >
                    {ram}
                    <span className="ml-2 text-xs opacity-70">{PRICES[ram]?.toLocaleString()}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <HardDrive className="h-4 w-4" />
                Storage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {COMPONENTS.storage.map(storage => (
                  <Button
                    key={storage}
                    variant={build.storage === storage ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => selectComponent('storage', storage)}
                  >
                    {storage}
                    <span className="ml-2 text-xs opacity-70">{PRICES[storage]?.toLocaleString()}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Power Supply (PSU)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {COMPONENTS.psu.map(psu => (
                  <Button
                    key={psu}
                    variant={build.psu === psu ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => selectComponent('psu', psu)}
                  >
                    {psu}
                    <span className="ml-2 text-xs opacity-70">{PRICES[psu]?.toLocaleString()}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Build Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={progress} />
              <p className="text-sm text-muted-foreground">{completedComponents}/7 components selected</p>

              <div className="space-y-2">
                {Object.entries(build).map(([category, value]) => (
                  <div key={category} className="flex justify-between text-sm">
                    <span className="capitalize text-muted-foreground">{category}:</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-blue-600">{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              {warnings.length > 0 && (
                <div className="bg-amber-50 p-3 rounded-lg space-y-2">
                  <p className="text-sm font-medium text-amber-800"> Warnings:</p>
                  {warnings.map((w, i) => (
                    <p key={i} className="text-xs text-amber-700">{w}</p>
                  ))}
                </div>
              )}

              <Button 
                className="w-full" 
                onClick={calculateBuild}
                disabled={completedComponents < 3 || calculating}
              >
                {calculating ? 'Checking...' : 'Check Compatibility'}
              </Button>

              <Button 
                variant="outline" 
                className="w-full"
                disabled={completedComponents < 7}
              >
                Add to Cart
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
