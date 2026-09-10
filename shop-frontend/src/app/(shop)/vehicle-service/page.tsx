'use client'

import { useState, useEffect } from 'react'
import { Car, Wrench, Calendar, AlertCircle, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function VehicleServicePage() {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
    try {
      const res = await fetch('/api/reminders/vehicle-service')
      if (res.ok) {
        const data = await res.json()
        setVehicles(data.vehicles || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const addVehicle = async (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Vehicle added!')
    setShowAdd(false)
    fetchVehicles()
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Car className="h-8 w-8 text-blue-600" />
          Vehicle Service Tracker
        </h1>
        <p className="text-muted-foreground">
          Never miss a service or oil change again
        </p>
      </div>

      <Button 
        className="mb-4" 
        onClick={() => setShowAdd(!showAdd)}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Vehicle
      </Button>

      {showAdd && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <form onSubmit={addVehicle} className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Vehicle Name</label>
                <Input placeholder="e.g., My Honda City" />
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <select className="w-full p-2 border rounded-md">
                  <option value="car">Car</option>
                  <option value="bike">Bike</option>
                  <option value="scooter">Scooter</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Last Service Date</label>
                <Input type="date" />
              </div>
              <div>
                <label className="text-sm font-medium">Current Odometer</label>
                <Input type="number" placeholder="e.g., 45000" />
              </div>
              <div className="col-span-2">
                <Button type="submit" className="w-full">Add Vehicle</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {vehicles.map((vehicle) => (
          <Card key={vehicle.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Car className={`h-8 w-8 ${
                    vehicle.daysUntil <= 0 ? 'text-red-500' :
                    vehicle.daysUntil <= 30 ? 'text-yellow-500' : 'text-green-500'
                  }`} />
                  <div>
                    <p className="font-medium">{vehicle.vehicleName}</p>
                    <p className="text-sm text-muted-foreground">
                      Next service due in {vehicle.daysUntil} days
                    </p>
                  </div>
                </div>
                <Badge variant={
                  vehicle.daysUntil <= 0 ? 'destructive' :
                  vehicle.daysUntil <= 30 ? 'default' : 'secondary'
                }>
                  {vehicle.daysUntil <= 0 ? 'OVERDUE' : 
                   vehicle.daysUntil <= 30 ? 'DUE SOON' : 'OK'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}

        {vehicles.length === 0 && !loading && (
          <Card className="p-8 text-center">
            <Wrench className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No vehicles added yet</p>
            <p className="text-sm text-muted-foreground">
              Add your vehicle to track service schedules
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}
