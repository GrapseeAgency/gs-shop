'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare, MapPin, HelpCircle, Phone, X, ChevronUp,
  Send, Clock, Ticket, Bot, User as UserIcon, CircleDot, ChevronRight,
  AlertCircle, CheckCircle2, Loader2, Minimize2, Truck, RefreshCw, CreditCard, Package
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useShopRouter } from '@/hooks/use-shop-router'

interface ChatMessage {
  id: string
  role: 'user' | 'bot'
  text: string
  timestamp: number
}

interface SupportTicket {
  id: string
  subject: string
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  updatedAt: string
}

const faqQuickReplies = [
  { id: 'shipping', label: 'Shipping Info', icon: Truck, answer: 'Standard shipping takes 3-5 business days. Express delivery is available for 1-2 day delivery. Free shipping on orders over $50!' },
  { id: 'returns', label: 'Returns Policy', icon: RefreshCw, answer: 'We offer a 30-day hassle-free return policy. Items must be in original condition. Refunds are processed within 5-7 business days.' },
  { id: 'payment', label: 'Payment Methods', icon: CreditCard, answer: 'We accept Visa, Mastercard, PayPal, Apple Pay, and Grapsee Wallet. All transactions are secured with 256-bit SSL encryption.' },
  { id: 'order', label: 'Track My Order', icon: Package, answer: 'You can track your order in the Orders section of your profile. You\'ll also receive email updates at each shipping milestone.' },
]

const botResponses: Record<string, string> = {
  shipping: 'Standard shipping takes 3-5 business days. Express delivery is available for 1-2 day delivery. Free shipping on orders over $50!',
  returns: 'We offer a 30-day hassle-free return policy. Items must be in original condition. Refunds are processed within 5-7 business days.',
  payment: 'We accept Visa, Mastercard, PayPal, Apple Pay, and Grapsee Wallet. All transactions are secured with 256-bit SSL encryption.',
  refund: 'Refunds are processed within 5-7 business days to your original payment method. Grapsee Wallet refunds are instant.',
  pricing: 'Our prices are competitive and include all taxes. Premium members get an additional 10% off on all products.',
  default: 'Thanks for reaching out! Let me connect you with a support agent. Estimated wait time is about 2 minutes. In the meantime, you can check our Help Center for quick answers.',
}

const [tickets, setTickets] = useState<SupportTicket[]>([]);

export function SupportWidget() {
  const [expanded, setExpanded] = useState(false)
  const [visible, setVisible] = useState(false)
  const [activeTab, setActiveTab] = useState<'menu' | 'chat' | 'tickets' | 'offline'>('menu')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [offlineForm, setOfflineForm] = useState({ name: '', email: '', message: '' })
  const [offlineSubmitted, setOfflineSubmitted] = useState(false)

  // Fetch support tickets on component mount
  useEffect(() => {
    fetchSupportTickets()
  }, [])

  const fetchSupportTickets = async () => {
    try {
      const response = await fetch('/api/support/tickets')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setTickets(data.data)
        }
      }
    } catch (error) {
      console.error('Error fetching support tickets:', error)
    }
  }
  const [estimatedWait, setEstimatedWait] = useState(2)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const { goTrack, goHelp, goContact } = useShopRouter()

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, scrollToBottom])

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (visible && !expanded) {
      const timer = setTimeout(() => setVisible(false), 15000)
      return () => clearTimeout(timer)
    }
  }, [visible, expanded])

  // Simulate estimated wait time
  useEffect(() => {
    if (expanded && activeTab === 'chat') {
      const interval = setInterval(() => {
        setEstimatedWait(Math.max(1, Math.floor(Math.random() * 4) + 1))
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [expanded, activeTab])

  const addMessage = (role: 'user' | 'bot', text: string) => {
    setMessages(prev => [...prev, { id: `msg-${Date.now()}`, role, text, timestamp: Date.now() }])
  }

  const handleSendMessage = (text?: string) => {
    const msg = text || inputText.trim()
    if (!msg) return

    addMessage('user', msg)
    setInputText('')
    setIsTyping(true)

    // Find matching bot response
    setTimeout(() => {
      const lowerMsg = msg.toLowerCase()
      let response = botResponses.default
      for (const [key, val] of Object.entries(botResponses)) {
        if (key !== 'default' && lowerMsg.includes(key)) {
          response = val
          break
        }
      }
      setIsTyping(false)
      addMessage('bot', response)
    }, 1200 + Math.random() * 800)
  }

  const handleFAQClick = (faq: typeof faqQuickReplies[0]) => {
    setActiveTab('chat')
    addMessage('user', faq.label)
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      addMessage('bot', faq.answer)
    }, 800)
  }

  const handleOfflineSubmit = () => {
    if (!offlineForm.name || !offlineForm.email || !offlineForm.message) return
    setOfflineSubmitted(true)
    setTimeout(() => {
      setOfflineForm({ name: '', email: '', message: '' })
      setOfflineSubmitted(false)
    }, 3000)
  }

  const ticketStatusConfig: Record<string, { color: string; icon: React.ElementType; label: string }> = {
    'open': { color: 'text-amber-500 bg-amber-500/10', icon: AlertCircle, label: 'Open' },
    'in-progress': { color: 'text-sky-500 bg-sky-500/10', icon: Loader2, label: 'In Progress' },
    'resolved': { color: 'text-emerald-500 bg-emerald-500/10', icon: CheckCircle2, label: 'Resolved' },
    'closed': { color: 'text-muted-foreground bg-muted', icon: CircleDot, label: 'Closed' },
  }

  const menuActions = [
    { icon: MessageSquare, label: 'Live Chat', desc: 'Avg wait ~2 min', color: 'from-emerald-500 to-teal-600', action: () => setActiveTab('chat') },
    { icon: Ticket, label: 'My Tickets', desc: `${tickets.filter(t => t.status === 'open' || t.status === 'in-progress').length} active`, color: 'from-sky-500 to-blue-600', action: () => setActiveTab('tickets') },
    { icon: MapPin, label: 'Track Order', desc: 'Check delivery status', color: 'from-green-500 to-emerald-600', action: () => { goTrack(); setExpanded(false) } },
    { icon: HelpCircle, label: 'Help Center', desc: 'FAQs & guides', color: 'from-purple-500 to-violet-600', action: () => { goHelp(); setExpanded(false) } },
    { icon: Phone, label: 'Call Us', desc: 'Mon-Fri 9am-6pm', color: 'from-orange-500 to-red-500', action: () => { setExpanded(false) } },
  ]

  const formatTime = (ts: number) => {
    const d = new Date(ts)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          className="fixed bottom-20 right-3 z-30 flex flex-col items-end gap-2"
        >
          {/* Expanded Panel */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                className="w-[300px] overflow-hidden rounded-2xl border border-border/50 bg-card shadow-2xl"
              >
                {/* Panel Header */}
                <div className="flex items-center justify-between bg-gradient-to-r from-primary to-primary/80 p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-glass-deep/20">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Grapsee Support</p>
                      <div className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-[10px] text-white/80">Online  ~{estimatedWait} min wait</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setExpanded(false)} className="rounded-full p-1 text-white/60 hover:text-white hover:bg-glass-deep/10">
                      <Minimize2 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => { setExpanded(false); setActiveTab('menu') }} className="rounded-full p-1 text-white/60 hover:text-white hover:bg-glass-deep/10">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Tab Navigation */}
                {activeTab !== 'menu' && (
                  <div className="flex border-b border-border/50 bg-muted/30">
                    <button onClick={() => setActiveTab('menu')} className="px-3 py-2 text-[10px] text-muted-foreground hover:text-foreground">
                       Menu
                    </button>
                    {['chat', 'tickets'].map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab as 'chat' | 'tickets')}
                        className={`flex-1 px-3 py-2 text-[10px] font-medium capitalize ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                )}

                {/* Menu Tab */}
                {activeTab === 'menu' && (
                  <div className="max-h-[350px] overflow-y-auto p-3">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">How can we help?</p>
                    <div className="flex flex-col gap-1.5">
                      {menuActions.map((action, i) => {
                        const Icon = action.icon
                        return (
                          <motion.button
                            key={action.label}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                            onClick={action.action}
                            className="flex items-center gap-3 rounded-xl bg-background p-2.5 text-left transition-colors hover:bg-accent active:scale-[0.98]"
                          >
                            <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${action.color}`}>
                              <Icon className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-foreground">{action.label}</p>
                              <p className="text-[10px] text-muted-foreground">{action.desc}</p>
                            </div>
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                          </motion.button>
                        )
                      })}
                    </div>

                    {/* FAQ Quick Replies */}
                    <p className="mt-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Quick Answers</p>
                    <div className="flex flex-wrap gap-1.5">
                      {faqQuickReplies.map(faq => (
                        <button
                          key={faq.id}
                          onClick={() => handleFAQClick(faq)}
                          className="flex items-center gap-1 rounded-full border border-border/50 bg-background px-2.5 py-1 text-[10px] font-medium text-foreground transition-colors hover:bg-accent active:scale-95"
                        >
                          {(() => { const Icon = faq.icon; return <Icon className="h-3.5 w-3.5" />; })()}
                          {faq.label}
                        </button>
                      ))}
                    </div>

                    {/* Offline Message Link */}
                    <button
                      onClick={() => setActiveTab('offline')}
                      className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border/50 py-2 text-[10px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <Clock className="h-3 w-3" />
                      Leave an offline message
                    </button>
                  </div>
                )}

                {/* Chat Tab */}
                {activeTab === 'chat' && (
                  <div className="flex flex-col" style={{ height: '320px' }}>
                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-3">
                      {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <MessageSquare className="h-5 w-5 text-primary" />
                          </div>
                          <p className="text-xs font-semibold text-foreground">Start a conversation</p>
                          <p className="mt-0.5 text-[10px] text-muted-foreground">We typically reply in minutes</p>
                          <div className="mt-3 flex flex-wrap gap-1.5 justify-center">
                            {faqQuickReplies.map(faq => (
                              <button
                                key={faq.id}
                                onClick={() => handleFAQClick(faq)}
                                className="rounded-full border border-border/50 bg-background px-2 py-1 text-[9px] font-medium text-foreground hover:bg-accent"
                              >
                                {faq.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      {messages.map(msg => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                          <div className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${msg.role === 'bot' ? 'bg-primary/10' : 'bg-accent'}`}>
                            {msg.role === 'bot' ? <Bot className="h-3 w-3 text-primary" /> : <UserIcon className="h-3 w-3 text-foreground" />}
                          </div>
                          <div className={`max-w-[75%] rounded-2xl px-3 py-2 ${msg.role === 'bot' ? 'bg-muted rounded-tl-sm' : 'bg-primary text-primary-foreground rounded-tr-sm'}`}>
                            <p className="text-[11px] leading-relaxed">{msg.text}</p>
                            <p className={`mt-0.5 text-[8px] ${msg.role === 'bot' ? 'text-muted-foreground' : 'text-primary-foreground/60'}`}>
                              {formatTime(msg.timestamp)}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                      {isTyping && (
                        <div className="flex gap-2">
                          <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <Bot className="h-3 w-3 text-primary" />
                          </div>
                          <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5">
                            <div className="flex gap-1">
                              <motion.span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} />
                              <motion.span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} />
                              <motion.span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} />
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Chat Input */}
                    <div className="border-t border-border/50 p-2">
                      <form
                        onSubmit={(e) => { e.preventDefault(); handleSendMessage() }}
                        className="flex items-center gap-2"
                      >
                        <Input
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          placeholder="Type a message..."
                          className="h-8 bg-muted/50 text-[11px]"
                        />
                        <Button type="submit" size="icon" className="h-8 w-8 flex-shrink-0" disabled={!inputText.trim()}>
                          <Send className="h-3.5 w-3.5" />
                        </Button>
                      </form>
                    </div>
                  </div>
                )}

                {/* Tickets Tab */}
                {activeTab === 'tickets' && (
                  <div className="max-h-[320px] overflow-y-auto p-3">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Your Support Tickets</p>
                    {tickets.length === 0 ? (
                      <div className="flex flex-col items-center py-6 text-center">
                        <Ticket className="mb-2 h-8 w-8 text-muted-foreground/30" />
                        <p className="text-xs text-muted-foreground">No tickets yet</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {tickets.map(ticket => {
                          const cfg = ticketStatusConfig[ticket.status]
                          const StatusIcon = cfg.icon
                          return (
                            <button
                              key={ticket.id}
                              className="w-full rounded-xl border border-border/50 bg-background p-2.5 text-left transition-colors hover:bg-accent"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <p className="text-[10px] text-muted-foreground">{ticket.id}</p>
                                  <p className="text-xs font-medium text-foreground line-clamp-1">{ticket.subject}</p>
                                </div>
                                <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-medium ${cfg.color}`}>
                                  <StatusIcon className="h-2.5 w-2.5" />
                                  {cfg.label}
                                </span>
                              </div>
                              <p className="mt-1 text-[9px] text-muted-foreground">Updated {ticket.updatedAt}</p>
                            </button>
                          )
                        })}
                      </div>
                    )}
                    <button
                      onClick={() => { goContact(); setExpanded(false) }}
                      className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary/10 py-2 text-[11px] font-medium text-primary hover:bg-primary/20"
                    >
                      <Ticket className="h-3 w-3" />
                      Create New Ticket
                    </button>
                  </div>
                )}

                {/* Offline Message Tab */}
                {activeTab === 'offline' && (
                  <div className="max-h-[350px] overflow-y-auto p-3">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Leave a Message</p>
                    {offlineSubmitted ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center py-6 text-center"
                      >
                        <CheckCircle2 className="mb-2 h-10 w-10 text-emerald-500" />
                        <p className="text-sm font-semibold text-foreground">Message Sent!</p>
                        <p className="mt-1 text-[10px] text-muted-foreground">We&apos;ll get back to you within 24 hours</p>
                      </motion.div>
                    ) : (
                      <div className="space-y-2">
                        <Input
                          placeholder="Your name"
                          value={offlineForm.name}
                          onChange={(e) => setOfflineForm(prev => ({ ...prev, name: e.target.value }))}
                          className="h-8 bg-muted/50 text-[11px]"
                        />
                        <Input
                          placeholder="Email address"
                          type="email"
                          value={offlineForm.email}
                          onChange={(e) => setOfflineForm(prev => ({ ...prev, email: e.target.value }))}
                          className="h-8 bg-muted/50 text-[11px]"
                        />
                        <textarea
                          placeholder="How can we help?"
                          value={offlineForm.message}
                          onChange={(e) => setOfflineForm(prev => ({ ...prev, message: e.target.value }))}
                          className="min-h-[80px] w-full resize-none rounded-lg border border-input bg-muted/50 px-3 py-2 text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <Button
                          onClick={handleOfflineSubmit}
                          className="w-full"
                          size="sm"
                          disabled={!offlineForm.name || !offlineForm.email || !offlineForm.message}
                        >
                          <Send className="mr-1.5 h-3 w-3" />
                          Send Message
                        </Button>
                        <p className="text-center text-[9px] text-muted-foreground">
                          We typically respond within 24 hours
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Message Preview Bubble */}
          <AnimatePresence>
            {expanded && messages.length > 0 && !expanded && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="mr-1 max-w-[200px] rounded-xl rounded-br-sm bg-card border border-border/50 px-2.5 py-1.5 shadow-lg"
              >
                <p className="text-[10px] text-muted-foreground">
                  {messages[messages.length - 1].text.slice(0, 60)}...
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* FAB Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setExpanded(!expanded)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25"
          >
            <AnimatePresence mode="wait">
              {expanded ? (
                <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                  <X className="h-5 w-5 text-primary-foreground" />
                </motion.div>
              ) : (
                <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} className="relative">
                  <ChevronUp className="h-5 w-5 text-primary-foreground" />
                  <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-green-400 animate-pulse border-2 border-primary" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Unread indicator */}
          <AnimatePresence>
            {!expanded && messages.length > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white"
              >
                {messages.filter(m => m.role === 'bot').length}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

