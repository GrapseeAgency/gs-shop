'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Share2, Copy, Check, QrCode, Link2, Eye, X, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { useShopStore } from '@/lib/store'
import { formatPrice } from '@/components/shop/product-card'
import { toast } from 'sonner'

interface WishlistShareProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WishlistShare({ open, onOpenChange }: WishlistShareProps) {
  const { wishlist } = useShopStore()
  const [name, setName] = useState('')
  const [shareUrl, setShareUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [step, setStep] = useState<'name' | 'preview' | 'shared'>('name')

  const handleShare = async () => {
    if (wishlist.length === 0) return

    setSharing(true)
    try {
      const items = wishlist.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        imageUrl: item.imageUrl,
      }))

      const res = await fetch('/api/wishlist/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          name: name.trim() || 'My Wishlist',
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const url = `${window.location.origin}/wishlist/shared/${data.token}`
        setShareUrl(url)
        setStep('shared')
        toast.success('Wishlist shared!', {
          description: `Share link created for ${data.itemCount} items.`,
        })
      } else {
        toast.error('Failed to share wishlist')
      }
    } catch {
      toast.error('Failed to share wishlist')
    } finally {
      setSharing(false)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy link')
    }
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: name || 'My Grapsee Shop Wishlist',
          text: `Check out my wishlist with ${wishlist.length} items on Grapsee Shop!`,
          url: shareUrl,
        })
      } catch {
        // User cancelled share
      }
    } else {
      handleCopyLink()
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(() => {
      setStep('name')
      setShareUrl('')
      setCopied(false)
    }, 300)
  }

  const totalValue = wishlist.reduce((sum, item) => sum + item.price, 0)

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="mx-auto max-h-[85vh] w-full max-w-lg rounded-t-2xl bg-background">
        <SheetHeader className="pb-2">
          <SheetTitle className="flex items-center gap-2 text-base">
            <Share2 className="h-4 w-4 text-primary" />
            Share Wishlist
          </SheetTitle>
          <SheetDescription className="text-xs">
            Create a shareable link for your wishlist
          </SheetDescription>
        </SheetHeader>

        <AnimatePresence mode="wait">
          {step === 'name' && (
            <motion.div
              key="name"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4 py-4"
            >
              {/* Name Input */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground">
                  Wishlist Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="My Wishlist"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="rounded-xl border border-border/50 bg-muted/30 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">
                    {name || 'My Wishlist'}
                  </span>
                  <Badge variant="secondary" className="text-[10px]">
                    {wishlist.length} items
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Total value: {formatPrice(totalValue)}
                </p>
                <div className="mt-2 flex gap-1">
                  {wishlist.slice(0, 4).map((item) => (
                    <div
                      key={item.productId}
                      className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-primary/20 to-primary/5"
                    >
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-xs"></span>
                      )}
                    </div>
                  ))}
                  {wishlist.length > 4 && (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-xs font-medium text-muted-foreground">
                      +{wishlist.length - 4}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep('preview')}
                >
                  <Eye className="mr-1.5 h-3.5 w-3.5" />
                  Preview
                </Button>
                <Button
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={handleShare}
                  disabled={sharing || wishlist.length === 0}
                >
                  {sharing ? (
                    <span className="animate-pulse">Creating...</span>
                  ) : (
                    <>
                      <Link2 className="mr-1.5 h-3.5 w-3.5" />
                      Share
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'preview' && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-3 py-4"
            >
              <h4 className="text-sm font-semibold text-foreground">
                {name || 'My Wishlist'}  -  Preview
              </h4>
              <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-2">
                {wishlist.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center gap-3 rounded-xl bg-muted/30 p-2.5"
                  >
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-sm"></span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground line-clamp-1">{item.name}</p>
                      <p className="text-xs font-semibold text-primary">{formatPrice(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep('name')}>
                  Back
                </Button>
                <Button
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={handleShare}
                  disabled={sharing}
                >
                  {sharing ? 'Creating...' : 'Create Share Link'}
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'shared' && (
            <motion.div
              key="shared"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4 py-4"
            >
              {/* Success */}
              <div className="flex flex-col items-center gap-2 rounded-xl bg-emerald-500/10 p-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
                  <Check className="h-6 w-6 text-emerald-500" />
                </div>
                <p className="text-sm font-semibold text-foreground">Wishlist Shared!</p>
                <p className="text-xs text-muted-foreground">
                  Anyone with the link can view your wishlist
                </p>
              </div>

              {/* Share URL */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Share Link
                </label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={shareUrl}
                    className="text-xs bg-muted/50"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyLink}
                    className="flex-shrink-0"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* QR Code Placeholder */}
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/50 p-4">
                <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-muted">
                  <QrCode className="h-10 w-10 text-muted-foreground" />
                </div>
                <p className="text-[10px] text-muted-foreground">Scan QR code to share</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 gap-1.5"
                  onClick={handleCopyLink}
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied ? 'Copied!' : 'Copy Link'}
                </Button>
                <Button
                  className="flex-1 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={handleNativeShare}
                >
                  <Share2 className="h-3.5 w-3.5" />
                  Share
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  )
}

