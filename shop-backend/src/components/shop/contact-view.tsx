'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Send,
  Clock,
  Globe,
  Loader2,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useShopRouter } from '@/hooks/use-shop-router'
import { toast } from 'sonner'

const contactMethods = [
  { icon: Mail, label: 'Email', value: 'hello@grapsee.shop', color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
  { icon: Phone, label: 'Phone', value: '+1 (888) GRAPSEE', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
  { icon: MessageSquare, label: 'Live Chat', value: 'Available 9AM-9PM', color: 'text-violet-400', bgColor: 'bg-violet-500/10' },
  { icon: Clock, label: 'Response Time', value: 'Under 2 hours', color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
]

export function ContactView() {
  const { goBack, goHome } = useShopRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    setSending(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      })
      if (res.ok) {
        setSent(true)
        toast.success('Message sent!', { description: 'We\'ll get back to you within 2 hours.' })
      } else {
        toast.error('Failed to send message')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <motion.div
      className="px-4 py-2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => goBack()}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-lg font-bold text-foreground">Contact Us</h1>
          <p className="text-xs text-muted-foreground">We&apos;re here to help</p>
        </div>
      </div>

      {/* Contact Methods */}
      <div className="mb-4 grid grid-cols-2 gap-2">
        {contactMethods.map((method) => {
          const Icon = method.icon
          return (
            <div key={method.label} className="flex items-center gap-2 rounded-xl border border-border/50 bg-card p-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${method.bgColor}`}>
                <Icon className={`h-4 w-4 ${method.color}`} />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">{method.label}</p>
                <p className="text-xs font-medium text-foreground">{method.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Contact Form */}
      {sent ? (
        <motion.div
          className="flex flex-col items-center justify-center py-12 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Check className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mb-1 text-base font-semibold text-foreground">Message Sent!</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            We&apos;ll respond within 2 hours. Check your email for a confirmation.
          </p>
          <Button onClick={() => goHome()} className="bg-primary text-primary-foreground">
            Back to Shop
          </Button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="contact-name" className="text-foreground">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input id="contact-name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required className="bg-card" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-email" className="text-foreground">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input id="contact-email" type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-card" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-subject" className="text-foreground">Subject</Label>
            <Input id="contact-subject" placeholder="What's this about?" value={subject} onChange={(e) => setSubject(e.target.value)} className="bg-card" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-message" className="text-foreground">
              Message <span className="text-destructive">*</span>
            </Label>
            <textarea
              id="contact-message"
              placeholder="Tell us how we can help..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={4}
              className="flex w-full rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />
          </div>
          <Button
            type="submit"
            className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-11"
            disabled={sending}
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send Message
          </Button>
        </form>
      )}

      {/* Address */}
      <div className="mt-6 rounded-xl border border-border/50 bg-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Our Office</h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Grapsee Technologies Inc.<br />
          123 Digital Avenue, Suite 400<br />
          San Francisco, CA 94107<br />
          United States
        </p>
      </div>
    </motion.div>
  )
}
