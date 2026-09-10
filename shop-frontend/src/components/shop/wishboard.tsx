'use client'

import { motion } from 'framer-motion'
import { Heart, ArrowLeft, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useShopRouter } from '@/hooks/use-shop-router'
import { useShopStore } from '@/lib/store'
import { formatPrice } from '@/components/shop/product-card'

export function WishboardPage() {
  const { goBack, goProduct, goCategory } = useShopRouter()
  const { wishlist, removeFromWishlist, addToCart } = useShopStore()

  return (
    <motion.div className="px-4 py-6 pb-20" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-4 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={goBack}><ArrowLeft className="h-5 w-5" /></Button>
        <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Heart className="h-5 w-5 text-rose-500 fill-rose-500" />
          Wish Board
        </h1>
        <span className="ml-auto text-xs text-muted-foreground">{wishlist.length} items</span>
      </div>

      {wishlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-rose-500/10">
            <Heart className="h-10 w-10 text-rose-500/40" />
          </div>
          <h2 className="text-base font-semibold text-foreground">Your wish board is empty</h2>
          <p className="text-sm text-muted-foreground max-w-xs">Save products you love and come back to them anytime.</p>
          <Button onClick={() => goCategory()} className="bg-primary text-primary-foreground gap-2">
            <Plus className="h-4 w-4" />Explore Products
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {wishlist.map((item) => (
            <motion.div
              key={item.productId}
              className="rounded-2xl border border-border/50 bg-card overflow-hidden"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="h-32 bg-primary/5 flex items-center justify-center cursor-pointer" onClick={() => goProduct(item.productId)}>
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <Heart className="h-8 w-8 text-muted-foreground/30" />
                )}
              </div>
              <div className="p-2.5">
                <p className="text-xs font-semibold text-foreground line-clamp-2 mb-1">{item.name}</p>
                <p className="text-sm font-bold text-primary mb-2">{formatPrice(item.price)}</p>
                <div className="flex gap-1.5">
                  <Button size="sm" className="flex-1 h-7 text-[10px]" onClick={() => addToCart({ productId: item.productId, name: item.name, price: item.price, quantity: 1, imageUrl: item.imageUrl })}>Add to Cart</Button>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => removeFromWishlist(item.productId)}>
                    <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

