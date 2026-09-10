'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Bot, User, Minus, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ChatMessage {
  id: string
  role: 'bot' | 'user'
  text: string
  time: string
}

const BOT_WELCOME = "Hi there! Welcome to Grapsee Shop. I'm your AI assistant. How can I help you today?"

const QUICK_REPLIES = ['Pricing', 'Delivery', 'Returns', 'Payment', 'Rewards']

function getTimeStr(): string {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

const STORAGE_KEY = 'grapsee-chat-history'

function loadChatHistory(): ChatMessage[] | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch { /* ignore */ }
  return null
}

function saveChatHistory(messages: ChatMessage[]) {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30)))
  } catch { /* ignore */ }
}

export function SupportChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return loadChatHistory() || [{ id: '0', role: 'bot', text: BOT_WELCOME, time: getTimeStr() }]
  })
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Persist chat history
  useEffect(() => {
    saveChatHistory(messages)
  }, [messages])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus()
    }
  }, [isOpen, isMinimized])

  const sendMessage = async (text: string) => {
    if (!text.trim()) return
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: text.trim(), time: getTimeStr() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    try {
      // Build history from last 10 messages for context
      const history = messages.slice(-10).map(m => ({
        role: m.role === 'bot' ? 'assistant' : 'user',
        content: m.text,
      }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim(), history }),
      })

      const data = await res.json()
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: data.message || "I'm having trouble right now. Please try again!",
        time: getTimeStr(),
      }
      setMessages(prev => [...prev, botMsg])
    } catch {
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: "I'm having trouble connecting right now. Please try again in a moment, or contact us at support@grapsee.shop.",
        time: getTimeStr(),
      }
      setMessages(prev => [...prev, botMsg])
    } finally {
      setIsTyping(false)
    }
  }

  const handleSend = () => {
    sendMessage(input)
  }

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 active:scale-95"
            onClick={() => setIsOpen(true)}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            whileHover={{ scale: 1.05 }}
          >
            <MessageCircle className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[8px] text-white">1</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-3xl border-t border-border/50 bg-background shadow-2xl"
            style={{ maxHeight: isMinimized ? '56px' : '75vh' }}
            initial={{ y: '100%' }}
            animate={{ y: 0, maxHeight: isMinimized ? '56px' : '75vh' }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/30 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-foreground">Grapsee Support</h3>
                    <span className="flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[8px] font-semibold text-primary">
                      <Sparkles className="h-2.5 w-2.5" />
                      AI
                    </span>
                  </div>
                  <p className="text-[10px] text-emerald-500 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsMinimized(!isMinimized)}>
                  <Minus className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            {!isMinimized && (
              <>
                <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ maxHeight: 'calc(75vh - 120px)' }}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {msg.role === 'bot' && (
                        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted text-foreground rounded-bl-md'
                      }`}>
                        <p className="text-[13px] leading-relaxed whitespace-pre-line">{msg.text}</p>
                        <p className={`text-[9px] mt-1 ${msg.role === 'user' ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                          {msg.time}
                        </p>
                      </div>
                      {msg.role === 'user' && (
                        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                  {isTyping && (
                    <motion.div className="flex gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                      <div className="rounded-2xl rounded-bl-md bg-muted px-4 py-3">
                        <div className="flex gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Quick Replies */}
                <div className="flex gap-2 overflow-x-auto px-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {QUICK_REPLIES.map((topic) => (
                    <button
                      key={topic}
                      className="flex-shrink-0 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary hover:bg-primary/10 active:scale-95 transition-all"
                      onClick={() => sendMessage(topic)}
                      disabled={isTyping}
                    >
                      {topic}
                    </button>
                  ))}
                </div>

                {/* Input */}
                <div className="border-t border-border/30 px-4 py-2 safe-area-bottom">
                  <div className="flex gap-2">
                    <Input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !isTyping && handleSend()}
                      placeholder="Type a message..."
                      className="flex-1 bg-muted/50 h-10 text-sm"
                      disabled={isTyping}
                    />
                    <Button size="icon" onClick={handleSend} disabled={!input.trim() || isTyping} className="h-10 w-10 flex-shrink-0">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
