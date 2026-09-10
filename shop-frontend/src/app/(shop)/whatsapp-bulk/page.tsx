'use client'

import { useState } from 'react'
import { MessageCircle, Send, CheckCircle, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function WhatsAppBulkPage() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [catalogNumbers, setCatalogNumbers] = useState('')
  const [sent, setSent] = useState(false)

  const sendOrder = async () => {
    if (!phoneNumber || !catalogNumbers) {
      toast.error('Please fill all fields')
      return
    }

    try {
      const res = await fetch('/api/time-savers/whatsapp-bulk-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, message: catalogNumbers })
      })
      
      if (res.ok) {
        setSent(true)
        toast.success('Order placed via WhatsApp!')
      }
    } catch (error) {
      toast.error('Failed to send')
    }
  }

  const catalog = [
    { id: 1, name: 'Rice 5kg', price: 250 },
    { id: 2, name: 'Dal 1kg', price: 120 },
    { id: 3, name: 'Oil 1L', price: 140 },
    { id: 4, name: 'Sugar 2kg', price: 80 },
    { id: 5, name: 'Salt 1kg', price: 20 },
    { id: 6, name: 'Tea 250g', price: 60 },
  ]

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <MessageCircle className="h-8 w-8 text-green-600" />
          WhatsApp Bulk Order
        </h1>
        <p className="text-muted-foreground">
          Business sends catalog via WhatsApp  Reply "1,3,7"  order placed
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Product Catalog</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {catalog.map((item) => (
                <div key={item.id} className="flex justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <span className="font-medium">{item.id}. {item.name}</span>
                  </div>
                  <Badge>{item.price}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Place Order
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Your WhatsApp Number</label>
              <Input 
                placeholder="+91 98765 43210"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Item Numbers (e.g., 1,3,5)</label>
              <Input 
                placeholder="Enter item numbers"
                value={catalogNumbers}
                onChange={(e) => setCatalogNumbers(e.target.value)}
              />
            </div>

            <Button className="w-full" size="lg" onClick={sendOrder}>
              <Send className="h-4 w-4 mr-2" />
              Order via WhatsApp
            </Button>

            {sent && (
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-green-800">Order sent! Check WhatsApp for confirmation.</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
