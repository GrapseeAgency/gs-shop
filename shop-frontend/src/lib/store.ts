import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useSyncExternalStore } from 'react'

export type ViewType =
  | 'home'
  | 'category'
  | 'product'
  | 'search'
  | 'checkout'
  | 'order-success'
  | 'wishlist'
  | 'profile'
  | 'orders'
  | 'contact'
  | 'settings'
  | 'deals'
  | 'luxury'
  | 'brands'
  | 'rewards'
  | 'cart'
  | 'about'
  | 'privacy'
  | 'terms'
  | 'recently-viewed'
  | 'compare'
  | 'gift-cards'
  | 'referrals'
  | 'notifications'
  | 'stores'
  | 'price-alerts'
  | 'wallet'
  | 'auctions'
  | 'spin-win'
  | 'collections'
  | 'blog'
  | 'help'
  | 'returns'
  | 'track'
  | 'voucher'
  | 'vip'
  | 'faq'
  | 'live'
  | 'reviews'
  | 'flash-sale'
  | 'bundles'
  | 'seasonal'
  | 'community'
  | 'affiliate'
  | 'wishboard'
  | 'style-guide'
  | 'accessibility'
  | 'cookies'
  | 'sitemap'
  | 'verify-age'
  | 'product-videos'
  | 'seller-center'
  | 'digital-downloads'
  | 'group-buy'
  | 'trade-in'
  | 'installment'
  | 'loyalty-calculator'
  | 'shipping-calculator'
  | 'store-pickup'
  | 'product-quiz'
  | 'outfit-maker'
  | 'email-subscribe'
  | 'seller-profile'
  | 'order-tracking'
  | 'mystery-box'
  | 'preorder'
  | 'gift-registry'
  | 'eco-shop'
  | 'price-match'
  | 'deal-calendar'
  | 'stock-notifications'
  | 'product-configurator'
  | 'customer-photos'
  | 'seller-onboarding'
  | 'try-before-buy'
  | 'price-drop'
  | 'loyalty-mall'
  | 'gift-wrapping'
  | 'warranty-center'
  | 'charity-shop'
  | 'rental'
  | 'student-discount'
  | 'price-guarantee'
  | 'review-megaphone'
  | 'mystery-reward'
  | 'dark-store'

// Hydration hook to prevent SSR/client mismatch
const emptySubscribe = () => () => {}

export function useHydration() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
}

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  imageUrl: string | null
}

export interface WishlistItem {
  productId: string
  name: string
  price: number
  comparePrice: number | null
  imageUrl: string | null
  addedAt: number
}

export interface RecentlyViewedItem {
  productId: string
  name: string
  price: number
  imageUrl: string | null
  viewedAt: number
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  comparePrice: number | null
  categoryId: string
  imageUrl: string | null
  images: string | null
  features: string | null
  techStack: string | null
  deliveryTime: string | null
  isFeatured: boolean
  isActive: boolean
  isNew: boolean
  isTrending: boolean
  isFlashDeal: boolean
  discount: number
  rating: number
  reviewCount: number
  tags: string | null
  order: number
  createdAt: string
  updatedAt: string
  category?: {
    id: string
    name: string
    slug: string
    icon: string | null
    color: string | null
  }
  // Phase I: Architecture & One-of-a-kind
  architectureStyle?: string | null
  folderStructure?: string | null
  showOneOfAKind?: boolean
  isUnique?: boolean
  // Product Visibility (after purchase)
  isSold?: boolean
  isPubliclyVisible?: boolean
  buyerUsername?: string | null
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  imageUrl: string | null
  order: number
  _count?: {
    products: number
  }
}

interface ShopState {
  view: ViewType
  previousView: ViewType
  selectedCategoryId: string | null
  selectedProduct: Product | null
  searchQuery: string
  cart: CartItem[]
  cartOpen: boolean
  lastOrderId: string | null
  wishlist: WishlistItem[]
  recentlyViewed: RecentlyViewedItem[]
  rewardsPoints: number
  newsletterSubscribed: boolean
  theme: 'dark' | 'light'
  compareList: string[]
  recentSearches: string[]
  cookieConsent: boolean
  accessibilityMode: {
    fontSize: 'normal' | 'large' | 'xl'
    highContrast: boolean
    reducedMotion: boolean
  }

  // New state fields
  selectedSellerId: string | null
  outfitItems: string[]
  emailPopupDismissed: boolean
  ageVerified: boolean

  // New state (Task 5)
  trialItems: string[]
  mysteryRewardClaimed: boolean
  studentVerified: boolean
  darkStoreOpen: boolean

  setView: (view: ViewType) => void
  goBack: () => void
  setSelectedCategoryId: (id: string | null) => void
  setSelectedProduct: (product: Product | null) => void
  setSearchQuery: (query: string) => void
  setCartOpen: (open: boolean) => void
  setLastOrderId: (id: string | null) => void
  setRewardsPoints: (points: number) => void
  addRewardsPoints: (points: number) => void
  setNewsletterSubscribed: (val: boolean) => void
  setTheme: (theme: 'dark' | 'light') => void
  toggleTheme: () => void

  addToCompare: (productId: string) => void
  removeFromCompare: (productId: string) => void
  isInCompare: (productId: string) => boolean
  clearCompare: () => void

  addRecentSearch: (query: string) => void
  clearRecentSearches: () => void

  setCookieConsent: (val: boolean) => void
  setAccessibilityMode: (mode: Partial<ShopState['accessibilityMode']>) => void

  // New actions
  setSelectedSellerId: (id: string | null) => void
  addToOutfit: (productId: string) => void
  removeFromOutfit: (productId: string) => void
  clearOutfit: () => void
  setEmailPopupDismissed: (val: boolean) => void
  setAgeVerified: (val: boolean) => void

  // New actions (Task 5)
  addToTrial: (productId: string) => void
  removeFromTrial: (productId: string) => void
  clearTrial: () => void
  isInTrial: (productId: string) => boolean
  setMysteryRewardClaimed: (val: boolean) => void
  setStudentVerified: (val: boolean) => void
  setDarkStoreOpen: (val: boolean) => void

  addToCart: (item: Omit<CartItem, 'id'>) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, qty: number) => void
  clearCart: () => void
  getCartTotal: () => number
  getCartCount: () => number

  addToWishlist: (item: Omit<WishlistItem, 'addedAt'>) => void
  removeFromWishlist: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => void
  getWishlistCount: () => number

  addToRecentlyViewed: (item: Omit<RecentlyViewedItem, 'viewedAt'>) => void
  clearRecentlyViewed: () => void
}

const MAX_RECENTLY_VIEWED = 10

export const useShopStore = create<ShopState>()(
  persist(
    (set, get) => ({
      view: 'home' as ViewType,
      previousView: 'home' as ViewType,
      selectedCategoryId: null as string | null,
      selectedProduct: null as Product | null,
      searchQuery: '',
      cart: [] as CartItem[],
      cartOpen: false,
      lastOrderId: null as string | null,
      wishlist: [] as WishlistItem[],
      recentlyViewed: [] as RecentlyViewedItem[],
      rewardsPoints: 0,
      newsletterSubscribed: false,
      theme: 'light' as 'dark' | 'light',
      compareList: [] as string[],
      recentSearches: [] as string[],
      cookieConsent: false,
      accessibilityMode: { fontSize: 'normal' as const, highContrast: false, reducedMotion: false },

      // New state fields
      selectedSellerId: null as string | null,
      outfitItems: [] as string[],
      emailPopupDismissed: false,
      ageVerified: false,

      // New state (Task 5)
      trialItems: [] as string[],
      mysteryRewardClaimed: false,
      studentVerified: false,
      darkStoreOpen: false,

      setView: (view) => set((state) => ({
        view,
        previousView: state.view,
      })),

      goBack: () => {
        const { previousView } = get()
        set({ view: previousView, previousView: 'home' })
      },

      setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),
      setSelectedProduct: (product) => set({ selectedProduct: product }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setCartOpen: (open) => set({ cartOpen: open }),
      setLastOrderId: (id) => set({ lastOrderId: id }),
      setRewardsPoints: (points) => set({ rewardsPoints: points }),
      addRewardsPoints: (points) => set((state) => ({ rewardsPoints: state.rewardsPoints + points })),
      setNewsletterSubscribed: (val) => set({ newsletterSubscribed: val }),

      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

      // Compare
      addToCompare: (productId) => {
        const { compareList } = get()
        if (compareList.length >= 3) return
        if (compareList.includes(productId)) return
        set({ compareList: [...compareList, productId] })
      },

      removeFromCompare: (productId) => {
        set({ compareList: get().compareList.filter((id) => id !== productId) })
      },

      isInCompare: (productId) => {
        return get().compareList.includes(productId)
      },

      clearCompare: () => set({ compareList: [] }),

      // Recent Searches
      addRecentSearch: (query) => {
        const { recentSearches } = get()
        const trimmed = query.trim().toLowerCase()
        if (!trimmed) return
        const filtered = recentSearches.filter((s) => s !== trimmed)
        set({ recentSearches: [trimmed, ...filtered].slice(0, 10) })
      },

      clearRecentSearches: () => set({ recentSearches: [] }),

      setCookieConsent: (val) => set({ cookieConsent: val }),
      setAccessibilityMode: (mode) => set((state) => ({
        accessibilityMode: { ...state.accessibilityMode, ...mode },
      })),

      // New actions
      setSelectedSellerId: (id) => set({ selectedSellerId: id }),
      addToOutfit: (productId) => {
        const { outfitItems } = get()
        if (outfitItems.includes(productId)) return
        set({ outfitItems: [...outfitItems, productId] })
      },
      removeFromOutfit: (productId) => {
        set({ outfitItems: get().outfitItems.filter((id) => id !== productId) })
      },
      clearOutfit: () => set({ outfitItems: [] }),
      setEmailPopupDismissed: (val) => set({ emailPopupDismissed: val }),
      setAgeVerified: (val) => set({ ageVerified: val }),

      // New actions (Task 5)
      addToTrial: (productId) => {
        const { trialItems } = get()
        if (trialItems.includes(productId)) return
        set({ trialItems: [...trialItems, productId] })
      },
      removeFromTrial: (productId) => {
        set({ trialItems: get().trialItems.filter((id) => id !== productId) })
      },
      clearTrial: () => set({ trialItems: [] }),
      isInTrial: (productId) => {
        return get().trialItems.includes(productId)
      },
      setMysteryRewardClaimed: (val) => set({ mysteryRewardClaimed: val }),
      setStudentVerified: (val) => set({ studentVerified: val }),
      setDarkStoreOpen: (val) => set({ darkStoreOpen: val }),

      addToCart: async (item) => {
        // Ensure quantity is valid (default to 1 if NaN or undefined)
        const safeQuantity = typeof item.quantity === 'number' && !isNaN(item.quantity) && item.quantity > 0
          ? item.quantity
          : 1
        const safeItem = { ...item, quantity: safeQuantity }

        // Phase II: Stock validation check inventory before adding to cart
        try {
          const response = await fetch(`/api/inventory/${item.productId}`)
          if (!response.ok) {
            throw new Error('Failed to check inventory')
          }
          const inventoryData = await response.json()

          if (!inventoryData.isAvailable || inventoryData.isSoldOut) {
            throw new Error('Product is out of stock')
          }

          const { cart } = get()
          const existing = cart.find((c) => c.productId === item.productId)
          const currentQtyInCart = existing ? existing.quantity : 0
          const newTotalQty = currentQtyInCart + safeQuantity
          
          // Phase II: Quantity limit check prevent exceeding available inventory
          const availableStock = inventoryData.inventory
          if (newTotalQty > availableStock) {
            throw new Error(`Only ${availableStock} items available. You already have ${currentQtyInCart} in cart.`)
          }
          
          if (existing) {
            set({
              cart: cart.map((c) =>
                c.productId === item.productId
                  ? { ...c, quantity: c.quantity + safeQuantity }
                  : c
              ),
            })
          } else {
            const cartItem: CartItem = {
              ...safeItem,
              id: `${item.productId}-${Date.now()}`,
            }
            set({ cart: [...cart, cartItem] })
          }
          // Earn 10 points per item added
          get().addRewardsPoints(10)
          return { success: true }
        } catch (error) {
          return { success: false, error: error instanceof Error ? error.message : 'Failed to add to cart' }
        }
      },

      removeFromCart: (id) => {
        set({ cart: get().cart.filter((c) => c.id !== id) })
      },

      updateQuantity: (id, qty) => {
        if (qty <= 0) {
          get().removeFromCart(id)
          return
        }
        set({
          cart: get().cart.map((c) => (c.id === id ? { ...c, quantity: qty } : c)),
        })
      },

      clearCart: () => set({ cart: [] }),

      getCartTotal: () => {
        return get().cart.reduce((total, item) => total + item.price * item.quantity, 0)
      },

      getCartCount: () => {
        return get().cart.reduce((count, item) => count + item.quantity, 0)
      },

      // Wishlist
      addToWishlist: (item) => {
        const { wishlist } = get()
        if (wishlist.find((w) => w.productId === item.productId)) return
        set({
          wishlist: [
            { ...item, addedAt: Date.now() },
            ...wishlist,
          ],
        })
      },

      removeFromWishlist: (productId) => {
        set({ wishlist: get().wishlist.filter((w) => w.productId !== productId) })
      },

      isInWishlist: (productId) => {
        return get().wishlist.some((w) => w.productId === productId)
      },

      clearWishlist: () => set({ wishlist: [] }),

      getWishlistCount: () => get().wishlist.length,

      // Recently Viewed
      addToRecentlyViewed: (item) => {
        const { recentlyViewed } = get()
        const filtered = recentlyViewed.filter((r) => r.productId !== item.productId)
        set({
          recentlyViewed: [
            { ...item, viewedAt: Date.now() },
            ...filtered,
          ].slice(0, MAX_RECENTLY_VIEWED),
        })
      },

      clearRecentlyViewed: () => set({ recentlyViewed: [] }),
    }),
    {
      name: 'grapsee-shop-cart',
      partialize: (state) => ({
        cart: state.cart,
        lastOrderId: state.lastOrderId,
        wishlist: state.wishlist,
        recentlyViewed: state.recentlyViewed,
        rewardsPoints: state.rewardsPoints,
        newsletterSubscribed: state.newsletterSubscribed,
        // NOTE: theme is intentionally NOT persisted always starts light, user toggles per session
        compareList: state.compareList,
        recentSearches: state.recentSearches,
        cookieConsent: state.cookieConsent,
        accessibilityMode: state.accessibilityMode,
        outfitItems: state.outfitItems,
        emailPopupDismissed: state.emailPopupDismissed,
        ageVerified: state.ageVerified,
        trialItems: state.trialItems,
        mysteryRewardClaimed: state.mysteryRewardClaimed,
        studentVerified: state.studentVerified,
      }),
      skipHydration: true,
    }
  )
)

// Rehydrate the store on client side only
if (typeof window !== 'undefined') {
  useShopStore.persist.rehydrate()
}
