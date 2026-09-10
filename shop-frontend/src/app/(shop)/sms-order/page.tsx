'use client'

import { useState } from 'react'
import { MessageSquare, Send, CheckCircle, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function SMSOrderPage() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [response, setResponse] = useState('')

  const sendOrder = async () => {
    if (!phoneNumber || !message) {
      toast.error('Please fill all fields')
      return
    }

    try {
      const res = await fetch('/api/time-savers/sms-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, message })
      })
      
      if (res.ok) {
        const data = await res.json()
        setResponse(data.reply)
        setSent(true)
        toast.success('SMS sent!')
      }
    } catch (error) {
      toast.error('Failed to send')
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <MessageSquare className="h-8 w-8 text-green-600" />
          SMS Order
        </h1>
        <p className="text-muted-foreground">
          No internet? Send SMS "ORDER rice"  order placed, confirmed via SMS, cash on delivery
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Send Order via SMS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Your Phone Number</label>
            <Input 
              placeholder="+91 98765 43210"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">SMS Message</label>
            <Input 
              placeholder="ORDER rice 2kg dal 1kg"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Format: ORDER [item] [quantity]
            </p>
          </div>

          <Button className="w-full" size="lg" onClick={sendOrder}>
            <Send className="h-4 w-4 mr-2" />
            Send SMS Order
          </Button>

          {sent && (
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">SMS Sent!</span>
              </div>
              <p className="text-sm text-green-700">{response}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
