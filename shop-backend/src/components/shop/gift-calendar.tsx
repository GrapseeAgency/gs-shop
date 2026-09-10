'use client'

import { useState } from 'react'
import { Calendar, Gift, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export function GiftCalendar() {
  const [events, setEvents] = useState<any[]>([
    { id: '1', name: "Mom's Birthday", date: '2026-06-15', type: 'birthday', daysLeft: 21 },
    { id: '2', name: 'Wedding Anniversary', date: '2026-07-20', type: 'anniversary', daysLeft: 56 }
  ])
  const [newEvent, setNewEvent] = useState({ name: '', date: '', type: 'birthday' })

  const addEvent = () => {
    if (!newEvent.name || !newEvent.date) {
      toast.error('Please fill in all fields')
      return
    }

    const daysLeft = Math.ceil(
      (new Date(newEvent.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )

    setEvents(prev => [...prev, { ...newEvent, id: Date.now().toString(), daysLeft }])
    setNewEvent({ name: '', date: '', type: 'birthday' })
    toast.success('Event added!')
  }

  const getSuggestions = (type: string) => {
    const suggestions: Record<string, string[]> = {
      birthday: ['Gift Cards', 'Personalized Items', 'Tech Gadgets', 'Books'],
      anniversary: ['Romantic Gifts', 'Experience Vouchers', 'Jewelry', 'Home Decor'],
      wedding: ['Cash Gifts', 'Home Appliances', 'Furniture', 'Honeymoon Fund'],
      holiday: ['Festive Hampers', 'Seasonal Decor', 'Party Supplies']
    }
    return suggestions[type] || suggestions.birthday
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Calendar className="h-4 w-4" />
          Gift Calendar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Event */}
        <div className="flex gap-2">
          <Input
            placeholder="Event name"
            value={newEvent.name}
            onChange={(e) => setNewEvent(prev => ({ ...prev, name: e.target.value }))}
          />
          <Input
            type="date"
            value={newEvent.date}
            onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
          />
          <Button onClick={addEvent}>Add</Button>
        </div>

        {/* Upcoming Events */}
        <div className="space-y-2">
          {events
            .sort((a, b) => a.daysLeft - b.daysLeft)
            .map((event) => (
            <div 
              key={event.id} 
              className={`p-3 rounded-lg border ${
                event.daysLeft <= 14 ? 'border-amber-500 bg-amber-50' : 'border-muted'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{event.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(event.date).toLocaleDateString()}  {event.daysLeft} days left
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {event.daysLeft <= 14 && (
                    <Badge variant="secondary" className="gap-1">
                      <Bell className="h-3 w-3" />
                      Soon!
                    </Badge>
                  )}
                  <Button size="sm" variant="outline">
                    <Gift className="h-3 w-3 mr-1" />
                    Gifts
                  </Button>
                </div>
              </div>

              {/* Suggestions */}
              {event.daysLeft <= 14 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {getSuggestions(event.type).map((suggestion) => (
                    <span key={suggestion} className="text-xs bg-white px-2 py-1 rounded">
                      {suggestion}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {events.length === 0 && (
          <p className="text-center text-muted-foreground py-4">
            No upcoming events. Add birthdays, anniversaries, and more!
          </p>
        )}
      </CardContent>
    </Card>
  )
}
