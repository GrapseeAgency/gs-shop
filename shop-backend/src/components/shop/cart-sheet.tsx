'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight, Save, RotateCcw, Download } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useShopStore } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import { formatPrice } from '@/components/shop/product-card'
import { toast } from 'sonner'

export function CartSheet() {
  const { cart, cartOpen, setCartOpen, removeFromCart, updateQuantity, getCartTotal, clearCart } = useShopStore()
  const { goCheckout, goCategory } = useShopRouter()
  const total = getCartTotal()
  const [saving, setSaving] = useState(false)
  const [restoring, setRestoring] = useState(false)

  const handleCheckout = () => {
    setCartOpen(false)
    goCheckout()
  }

  const handleSaveCart = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/cart/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          sessionId: 'default',
        }),
      })
      if (res.ok) {
        const data = await res.json()
        toast.success('Cart saved!', {
          description: `${data.itemCount} items saved for later.`,
        })
      } else {
        toast.error('Failed to save cart')
      }
    } catch {
      toast.error('Failed to save cart')
    } finally {
      setSaving(false)
    }
  }

  const handleRestoreCart = async () => {
    setRestoring(true)
    try {
      const res = await fetch('/api/cart/save?sessionId=default')
      if (res.ok) {
        const data = await res.json()
        if (data.found && Array.isArray(data.items) && data.items.length > 0) {
          // Merge saved items with current (empty) cart
          const mergeRes = await fetch('/api/cart/merge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              savedItems: data.items,
              currentItems: cart,
            }),
          })
          if (mergeRes.ok) {
            const mergeData = await mergeRes.json()
            // Add each merged item to the store
            for (const item of mergeData.items) {
              useShopStore.getState().addToCart({
                productId: item.productId,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                imageUrl: item.imageUrl,
              })
            }
            toast.success('Cart restored!', {
              description: `${mergeData.totalItems} items restored.`,
            })
          }
        } else {
          toast.info('No saved cart found', {
            description: 'Save your cart first to restore it later.',
          })
        }
      }
    } catch {
      toast.error('Failed to restore cart')
    } finally {
      setRestoring(false)
    }
  }

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent side="right" className="flex w-full flex-col bg-background sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Your Cart
          </SheetTitle>
          <SheetDescription>
            {cart.length === 0
              ? 'Your cart is empty'
              : `${cart.length} item${cart.length > 1 ? 's' : ''} in your cart`}
          </SheetDescription>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center py-8">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <ShoppingCart className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="mb-2 text-sm font-medium text-foreground">Cart is empty</p>
            <p className="mb-4 text-xs text-muted-foreground">
              Browse our products and add items to your cart
            </p>
            <div className="flex flex-col gap-2 w-full max-w-[200px]">
              <Button
                onClick={() => {
                  setCartOpen(false)
                  goCategory()
                }}
                variant="outline"
                className="gap-2 w-full"
              >
                Start Shopping
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleRestoreCart}
                variant="ghost"
                className="gap-2 w-full text-primary hover:text-primary"
                disabled={restoring}
              >
                {restoring ? (
                  <RotateCcw className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {restoring ? 'Restoring...' : 'Restore Cart'}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto custom-scrollbar -mx-4 px-4">
              <AnimatePresence mode="popLayout">
                {cart.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex gap-3 py-3"
                  >
                    {/* Item image/placeholder */}
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-lg"></span>
                      )}
                    </div>

                    {/* Item details */}
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-medium text-foreground line-clamp-1">
                          {item.name}
                        </h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 flex-shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      <span className="text-sm font-semibold text-primary">
                        {formatPrice(item.price)}
                      </span>

                      {/* Quantity controls */}
                      <div className="mt-auto flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium text-foreground">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <span className="ml-auto text-sm font-medium text-foreground">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="border-t border-border/50 pt-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="text-lg font-bold text-foreground">
                  {formatPrice(total)}
                </span>
              </div>
              <p className="mb-4 text-xs text-muted-foreground">
                Taxes and shipping calculated at checkout
              </p>
              <SheetFooter className="flex-col gap-2 p-0 sm:flex-col">
                <Button
                  onClick={handleCheckout}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  size="lg"
                >
                  Proceed to Checkout
                </Button>
                <div className="flex w-full gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSaveCart}
                    className="flex-1 gap-1.5 text-xs"
                    disabled={saving}
                  >
                    <Save className={`h-3.5 w-3.5 ${saving ? 'animate-pulse' : ''}`} />
                    {saving ? 'Saving...' : 'Save Cart'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearCart}
                    className="flex-1 text-xs text-muted-foreground hover:text-destructive"
                  >
                    Clear Cart
                  </Button>
                </div>
              </SheetFooter>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
