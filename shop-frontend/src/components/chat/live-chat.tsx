'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, Send, X, User, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export function LiveChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<any[]>([
    { id: 1, sender: 'AGENT', message: 'Hi! Welcome to Grapsee Shop. How can we help you today?', timestamp: new Date() }
  ])
  const [input, setInput] = useState('')
  const [roomId] = useState(`room_${Date.now()}`)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Poll for new messages from Grapsee support
  useEffect(() => {
    if (!isOpen) return
    
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/chat/webhook?userId=guest&customerEmail=guest@example.com`)
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.messages) {
            setMessages(data.messages)
          }
          // Handle notifications
          if (data.success && data.notifications && data.notifications.length > 0) {
            // Show notification to user
            data.notifications.forEach((notif: any) => {
              toast.success(notif.title, {
                description: notif.message,
                duration: 5000
              })
            })
          }
        }
      } catch (error) {
        // Silent fail - polling continues
      }
    }, 3000) // Poll every 3 seconds
    
    return () => clearInterval(interval)
  }, [isOpen])

  const sendMessage = async () => {
    if (!input.trim()) return
    
    const userMessage = {
      id: Date.now(),
      senderId: 'customer',
      content: input,
      type: 'text' as const,
      timestamp: new Date().toISOString(),
      isRead: false
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput('')
    
    // Send to Grapsee Support via API
    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          userId: 'guest',
          customerEmail: 'guest@example.com',
          customerName: 'Guest User',
          productName: 'General Inquiry'
        })
      })
      
      if (!res.ok) {
        toast.error('Failed to send message')
      }
    } catch (error) {
      toast.error('Network error')
    }
  }

  if (!isOpen) {
    return (
      <Button
        className="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg"
        onClick={() => setIsOpen(true)}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 h-96 shadow-xl z-50">
      <CardHeader className="flex flex-row items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Bot className="h-4 w-4" />
          Grapsee Support
        </CardTitle>
        <Button variant="ghost" size="sm" className="text-white" onClick={() => setIsOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="p-0 flex flex-col h-[calc(100%-60px)]">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start gap-2 max-w-[80%] ${msg.sender === 'USER' ? 'flex-row-reverse' : ''}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.sender === 'USER' ? 'bg-blue-100' : 'bg-purple-100'
                }`}>
                  {msg.sender === 'USER' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className={`p-3 rounded-lg text-sm ${
                  msg.sender === 'USER' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100'
                }`}>
                  <p>{msg.message}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-3 border-t flex gap-2">
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1"
          />
          <Button size="icon" onClick={sendMessage}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
