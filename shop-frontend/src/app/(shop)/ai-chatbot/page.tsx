'use client'

import { useState } from 'react'
import { MessageCircle, Send, Bot, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function AIChatbotPage() {
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hi! I\'m Grapsee AI. I\'ll help you define your project requirements. What does your business do?' }
  ])
  const [input, setInput] = useState('')
  const [step, setStep] = useState(1)

  const questions = [
    'What does your business do?',
    'Who are your target customers?',
    'What\'s the main goal of this project?',
    'Do you have any design preferences?',
    'What\'s your budget range?',
    'When do you need this completed?'
  ]

  const sendMessage = () => {
    if (!input) return
    
    const newMessages = [...messages, { role: 'user', text: input }]
    setMessages(newMessages)
    setInput('')

    if (step < questions.length) {
      setTimeout(() => {
        setMessages([...newMessages, { role: 'bot', text: questions[step] }])
        setStep(step + 1)
      }, 500)
    } else {
      setTimeout(() => {
        setMessages([...newMessages, { 
          role: 'bot', 
          text: 'Perfect! I\'ve generated your requirement document. Click below to view it.' 
        }])
        toast.success('Requirements document ready!')
      }, 1000)
    }
  }

  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <Bot className="h-10 w-10 text-purple-600" />
          AI Requirements Chatbot
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Talk to AI, get a detailed requirement doc
        </p>
      </div>

      <Card className="h-[500px] flex flex-col">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start gap-2 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  msg.role === 'bot' ? 'bg-purple-100' : 'bg-blue-100'
                }`}>
                  {msg.role === 'bot' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </div>
                <div className={`p-3 rounded-lg ${
                  msg.role === 'bot' ? 'bg-muted' : 'bg-blue-500 text-white'
                }`}>
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              placeholder="Type your answer..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <Button onClick={sendMessage}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <Badge variant="outline">Step {step} of {questions.length}</Badge>
            {step >= questions.length && (
              <Button size="sm">View Requirements Doc</Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
