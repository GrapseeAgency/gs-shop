'use client'

import { useState } from 'react'
import { Cat, Dog, ShoppingBag, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function PetSuppliesPage() {
  const [petType, setPetType] = useState('dog')
  const [autoPilot, setAutoPilot] = useState(false)
  const [loading, setLoading] = useState(false)

  const setupAutoPilot = async () => {
    setLoading(true)
    
    try {
      const res = await fetch('/api/lifestyle/pet-supply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          petType,
          breed: 'Mixed',
          age: 2,
          weight: 10
        })
      })
      
      if (res.ok) {
        setAutoPilot(true)
        toast.success('Pet Auto-Pilot enabled!')
      }
    } catch (error) {
      toast.error('Setup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Dog className="h-8 w-8 text-amber-600" />
          Pet Supply Auto-Pilot
        </h1>
        <p className="text-muted-foreground">
          Automatic food and supply delivery for your furry friends
        </p>
      </div>

      {!autoPilot ? (
        <Card>
          <CardHeader>
            <CardTitle>Set Up Auto-Pilot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center gap-4 mb-6">
              <button
                onClick={() => setPetType('dog')}
                className={`p-4 rounded-lg flex flex-col items-center ${petType === 'dog' ? 'bg-amber-100 border-2 border-amber-500' : 'bg-muted'}`}
              >
                <Dog className="h-8 w-8 mb-2" />
                <span>Dog</span>
              </button>
              <button
                onClick={() => setPetType('cat')}
                className={`p-4 rounded-lg flex flex-col items-center ${petType === 'cat' ? 'bg-amber-100 border-2 border-amber-500' : 'bg-muted'}`}
              >
                <Cat className="h-8 w-8 mb-2" />
                <span>Cat</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Breed</label>
                <Input placeholder="e.g., Labrador" />
              </div>
              <div>
                <label className="text-sm font-medium">Age (years)</label>
                <Input type="number" placeholder="2" />
              </div>
              <div>
                <label className="text-sm font-medium">Weight (kg)</label>
                <Input type="number" placeholder="10" />
              </div>
              <div>
                <label className="text-sm font-medium">Special Needs</label>
                <Input placeholder="None" />
              </div>
            </div>

            <Button 
              className="w-full" 
              size="lg"
              onClick={setupAutoPilot}
              disabled={loading}
            >
              {loading ? 'Setting up...' : <><ShoppingBag className="h-4 w-4 mr-2" /> Enable Auto-Pilot</>}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6 text-center">
              <Badge className="mb-2 bg-green-500">ACTIVE</Badge>
              <h3 className="text-lg font-semibold">Auto-Pilot Enabled!</h3>
              <p className="text-muted-foreground">
                We'll automatically reorder {petType} supplies every month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Deliveries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between p-3 bg-muted rounded-lg">
                  <span>Monthly Food Supply</span>
                  <Badge>Next: {new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString()}</Badge>
                </div>
                <div className="flex justify-between p-3 bg-muted rounded-lg">
                  <span>Treats & Toys</span>
                  <Badge variant="secondary">Every 2 months</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
