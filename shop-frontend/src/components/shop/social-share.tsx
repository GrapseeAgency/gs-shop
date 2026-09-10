'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Share2,
  MessageCircle,
  Facebook,
  Twitter,
  Link2,
  Mail,
  Check,
  QrCode,
  X,
} from 'lucide-react'

interface SocialShareProps {
  url?: string
  title?: string
  text?: string
  className?: string
}

export function SocialShare({
  url = typeof window !== 'undefined' ? window.location.href : '',
  title = 'Check this out!',
  text = '',
  className = '',
}: SocialShareProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [shareCount, setShareCount] = useState(0)

  const shareUrl = encodeURIComponent(url)
  const shareTitle = encodeURIComponent(title)
  const shareText = encodeURIComponent(text || title)

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setShareCount((prev) => prev + 1)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const textArea = document.createElement('textarea')
      textArea.value = url
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setShareCount((prev) => prev + 1)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [url])

  const nativeShare = useCallback(async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text: text || title,
          url,
        })
        setShareCount((prev) => prev + 1)
      } catch {
        // User cancelled or error
      }
    } else {
      setIsOpen(true)
    }
  }, [title, text, url])

  const shareToWhatsApp = () => {
    window.open(`https://wa.me/?text=${shareTitle}%20${shareUrl}`, '_blank')
    setShareCount((prev) => prev + 1)
    setIsOpen(false)
  }

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, '_blank')
    setShareCount((prev) => prev + 1)
    setIsOpen(false)
  }

  const shareToTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`, '_blank')
    setShareCount((prev) => prev + 1)
    setIsOpen(false)
  }

  const shareToEmail = () => {
    window.open(`mailto:?subject=${shareTitle}&body=${shareText}%20${shareUrl}`, '_self')
    setShareCount((prev) => prev + 1)
    setIsOpen(false)
  }

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-emerald-500',
      action: shareToWhatsApp,
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600',
      action: shareToFacebook,
    },
    {
      name: 'X / Twitter',
      icon: Twitter,
      color: 'bg-foreground',
      action: shareToTwitter,
    },
    {
      name: copied ? 'Copied!' : 'Copy Link',
      icon: copied ? Check : Link2,
      color: copied ? 'bg-emerald-500' : 'bg-muted',
      action: copyLink,
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'bg-sky-500',
      action: shareToEmail,
    },
    {
      name: 'QR Code',
      icon: QrCode,
      color: 'bg-violet-500',
      action: () => {}, // QR placeholder
    },
  ]

  return (
    <>
      {/* Share Button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={nativeShare}
        className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 border border-border text-sm text-foreground hover:bg-muted transition ${className}`}
      >
        <motion.div
          animate={isOpen ? { rotate: 90 } : { rotate: 0 }}
        >
          <Share2 className="w-4 h-4" />
        </motion.div>
        <span className="text-xs font-medium">Share</span>
        {shareCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] flex items-center justify-center"
          >
            {shareCount}
          </motion.span>
        )}
      </motion.button>

      {/* Share Sheet */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/50"
            />
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-2xl border-t border-border shadow-2xl"
            >
              <div className="p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-foreground">Share</h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Share Options Grid */}
                <div className="grid grid-cols-3 gap-4">
                  {shareOptions.map((option, idx) => (
                    <motion.button
                      key={option.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={option.action}
                      className="flex flex-col items-center gap-2 py-2 active:scale-95 transition"
                    >
                      <div className={`w-12 h-12 rounded-xl ${option.color} flex items-center justify-center shadow-md`}>
                        <option.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-[10px] text-muted-foreground text-center leading-tight">{option.name}</span>
                    </motion.button>
                  ))}
                </div>

                {/* URL Preview */}
                <div className="mt-4 p-3 bg-muted/50 rounded-xl">
                  <p className="text-[10px] text-muted-foreground mb-1">Sharing link:</p>
                  <p className="text-xs text-foreground truncate">{url}</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

