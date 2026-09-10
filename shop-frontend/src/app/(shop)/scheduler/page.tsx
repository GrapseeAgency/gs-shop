'use client'

import { useState } from 'react'
import { Calendar, Clock, Users, Globe, Check, Video, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

export default function SchedulerPage() {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')
  const [booking, setBooking] = useState(false)

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ]

  const bookAppointment = async () => {
    if (!selectedDate || !selectedSlot) {
      toast.error('Please select date and time')
      return
    }
    setBooking(true)
    
    try {
      const res = await fetch('/api/scheduler/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slot: `${selectedDate}T${selectedSlot}`,
          attendeeInfo: { name: 'User', email: 'user@example.com' }
        })
      })
      
      if (res.ok) {
        toast.success('Appointment booked! Check your email.')
      }
    } catch (error) {
      toast.error('Failed to book')
    }
    setBooking(false)
  }

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <Calendar className="h-10 w-10 text-orange-600" />
          Appointment Scheduler
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Let clients book meetings with you. Like Calendly, but yours.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Select Date & Time
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium">Date</label>
              <Input 
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Available Slots</label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-2 rounded-lg border text-sm transition-all ${
                      selectedSlot === slot 
                        ? 'border-orange-500 bg-orange-50 font-medium' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="h-4 w-4" />
              <span>Timezone: Asia/Dhaka (GMT+6)</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Your Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium">Your Name</label>
              <Input placeholder="Full Name" />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input type="email" placeholder="email@example.com" />
            </div>
            <div>
              <label className="text-sm font-medium">Meeting Type</label>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" className="flex-1">
                  <Video className="h-4 w-4 mr-2" />
                  Video Call
                </Button>
                <Button variant="outline" className="flex-1">
                  <Phone className="h-4 w-4 mr-2" />
                  Phone
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Notes</label>
              <Textarea placeholder="What should we discuss?" rows={3} />
            </div>

            <Button 
              className="w-full" 
              size="lg"
              onClick={bookAppointment}
              disabled={booking}
            >
              {booking ? 'Booking...' : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Confirm Booking
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8 bg-gradient-to-r from-orange-50 to-amber-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">Get Your Own Scheduler</h3>
              <p className="text-muted-foreground">799/month - Unlimited bookings, custom branding</p>
            </div>
            <Button size="lg">Get Started</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
