'use client'

import { useState } from 'react'
import { Wrench, Camera, Clock, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function ApplianceRepairPage() {
  const [applianceType, setApplianceType] = useState('')
  const [problem, setProblem] = useState('')
  const [urgency, setUrgency] = useState('normal')
  const [technicians, setTechnicians] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const findTechnicians = async () => {
    if (!applianceType || !problem) {
      toast.error('Please fill all fields')
      return
    }

    setLoading(true)
    
    try {
      const res = await fetch('/api/lifestyle/appliance-repair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applianceType, problem, urgency })
      })
      
      if (res.ok) {
        const data = await res.json()
        setTechnicians(data.technicians || [])
      }
    } catch (error) {
      toast.error('Failed to find technicians')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Wrench className="h-8 w-8 text-orange-600" />
          Appliance Repair
        </h1>
        <p className="text-muted-foreground">
          AC broke? Find verified technicians in 2 taps
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Describe the Problem</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {['AC', 'Fridge', 'Washing Machine', 'TV', 'Microwave', 'Geyser'].map((type) => (
              <button
                key={type}
                onClick={() => setApplianceType(type)}
                className={`p-3 rounded-lg border text-sm font-medium ${
                  applianceType === type 
                    ? 'bg-orange-100 border-orange-500 text-orange-700' 
                    : 'hover:bg-muted'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <Textarea 
            placeholder="Describe the problem (e.g., 'AC not cooling, water leaking')"
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            rows={3}
          />

          <div className="flex gap-2">
            <Button 
              variant={urgency === 'emergency' ? 'destructive' : 'outline'}
              onClick={() => setUrgency('emergency')}
            >
              Emergency
            </Button>
            <Button 
              variant={urgency === 'normal' ? 'default' : 'outline'}
              onClick={() => setUrgency('normal')}
            >
              Normal
            </Button>
          </div>

          <Button 
            className="w-full" 
            size="lg"
            onClick={findTechnicians}
            disabled={loading}
          >
            {loading ? 'Finding...' : <><Camera className="h-4 w-4 mr-2" /> Find Technicians</>}
          </Button>
        </CardContent>
      </Card>

      {technicians.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold">Available Technicians ({technicians.length})</h3>
          {technicians.map((tech) => (
            <Card key={tech.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{tech.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Badge variant="secondary"> {tech.rating}</Badge>
                      <span>({tech.reviews} reviews)</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm mt-2">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {tech.eta}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {tech.baseFee}
                      </span>
                    </div>
                  </div>
                  <Button>Book Now</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
