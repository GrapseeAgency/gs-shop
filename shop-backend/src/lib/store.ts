import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useState, useEffect } from 'react'

// Types
export interface Product {
  id: string
  productId?: string  // For compatibility
  name: string
  slug: string
  description: string
  price: number
  comparePrice?: number
  categoryId: string
  category?: { id: string; name: string }  // For compatibility
  imageUrl?: string
  images?: string
  features?: string
  techStack?: string
  deliveryTime?: string
  isFeatured: boolean
  isActive: boolean
  isNew: boolean
  isTrending: boolean
  isFlashDeal: boolean
  flashExpiresAt?: Date
  isVIPOnly: boolean
  isLuxury: boolean
  luxuryExpiresAt?: Date
  isOnSale: boolean
  isMock: boolean
  discount: number
  inventory: number
  reserved: number
  rating: number
  reviewCount: number
  views: number
  tags?: string
  order: number
  weight?: number
  expiryDate?: Date
  ingredients?: string
  stock?: number
  color?: string
  size?: string
  ecoScore?: number
  carbonFootprint?: number
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  iconSvg?: string
  iconLottie?: string
  iconType: string
  imageUrl?: string
  bannerUrl?: string
  mobileBannerUrl?: string
  color?: string
  gradient?: string
  textColor?: string
  order: number
  isFeatured: boolean
  showInMenu: boolean
  parentId?: string
  _count?: {
    products?: number
  }
  createdAt: Date
  updatedAt: Date
}

export interface CartItem {
  id: string
  cartId: string
  productId: string
  productName: string
  name: string  // For compatibility
  price: number
  quantity: number
  imageUrl?: string
  product?: Product
  createdAt: Date
  updatedAt: Date
}

export interface WishlistItem {
  id: string
  userId: string
  productId: string
  name?: string
  price?: number
  comparePrice?: number
  imageUrl?: string
  createdAt: Date
  addedAt: Date  // For sorting
  product?: Product
}

export interface RecommendedProduct {
  id: string
  name: string
  price: number
  comparePrice?: number
  imageUrl?: string
  rating?: number
  category?: string
  score?: number
  reason?: string
}

export type ViewType = 'grid' | 'list' | 'card' | 'live' | 'reviews' | 'flash-sale' | 'bundles' | 
  'seasonal' | 'community' | 'affiliate' | 'wishboard' | 'style-guide' | 'accessibility' | 
  'cookies' | 'sitemap' | 'verify-age' | 'product-videos' | 'group-buy' | 'trade-in' | 
  'installment' | 'seller-center' | 'digital-downloads' | 'product-quiz' | 'loyalty-calculator' | 
  'shipping-calculator' | 'store-pickup' | 'outfit-maker' | 'email-subscribe' | 'seller-profile' | 
  'order-tracking' | 'mystery-box' | 'preorder' | 'gift-registry' | 'eco-shop' | 'price-match' | 
  'deal-calendar' | 'stock-notifications' | 'product-configurator' | 'customer-photos' | 
  'seller-onboarding' | 'try-before-buy' | 'price-drop' | 'loyalty-mall' | 'gift-wrapping' | 
  'warranty-center' | 'charity-shop' | 'rental' | 'student-discount' | 'price-guarantee' | 
  'review-megaphone' | 'mystery-reward' | 'dark-store' | 'home' | 'category' | 'product' | 'search' | 
  'checkout' | 'order-success' | 'wishlist' | 'profile' | 'orders' | 'contact' | 'settings' | 
  'deals' | 'luxury' | 'brands' | 'rewards' | 'cart' | 'about' | 'privacy' | 'terms' | 
  'recently-viewed' | 'compare' | 'gift-cards' | 'referrals' | 'notifications' | 'stores' | 
  'price-alerts' | 'wallet' | 'auctions' | 'spin-win' | 'collections' | 'blog' | 'help' | 
  'returns' | 'track' | 'voucher' | 'vip' | 'faq'

// Store interface
interface ShopStore {
  // Current view state
  currentView: ViewType
  view: ViewType
  searchQuery: string
  selectedCategory: string | null
  selectedCategoryId: string | null
  selectedProduct: Product | null
  priceRange: [number, number]
  sortBy: 'name' | 'price' | 'rating' | 'newest' | 'popular'
  sortOrder: 'asc' | 'desc'
  
  // Data
  products: Product[]
  categories: Category[]
  cartItems: CartItem[]
  wishlistItems: WishlistItem[]
  recommendations: RecommendedProduct[]
  wishlist: WishlistItem[]
  cart: CartItem[]
  recentlyViewed: Product[]
  lastOrderId: string | null
  rewardsPoints: number
  theme: 'light' | 'dark' | 'system'
  
  // Additional state
  recentSearches: string[]
  compareList: Product[]
  outfitItems: string[]
  trialItems: string[]
  studentVerified: boolean
  newsletterSubscribed: boolean
  cookieConsent: boolean
  emailPopupDismissed: boolean
  darkStoreOpen: boolean
  mysteryRewardClaimed: boolean
  
  // UI state
  sidebarOpen: boolean
  cartOpen: boolean
  loading: boolean
  error: string | null
  
  // Actions - View and Navigation
  setCurrentView: (view: ViewType) => void
  setView: (view: ViewType) => void
  setSearchQuery: (query: string) => void
  setSelectedCategory: (categoryId: string | null) => void
  setSelectedCategoryId: (categoryId: string | null) => void
  setSelectedProduct: (product: Product | null) => void
  setPriceRange: (range: [number, number]) => void
  setSortBy: (sortBy: 'name' | 'price' | 'rating' | 'newest' | 'popular') => void
  setSortOrder: (order: 'asc' | 'desc') => void
  setLastOrderId: (orderId: string | null) => void
  
  // Data setters
  setProducts: (products: Product[]) => void
  setCategories: (categories: Category[]) => void
  setCartItems: (items: CartItem[]) => void
  setWishlistItems: (items: WishlistItem[]) => void
  setRecommendations: (items: RecommendedProduct[]) => void
  
  // UI actions
  toggleSidebar: () => void
  toggleCart: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  toggleTheme: () => void
  
  // Cart actions
  addToCart: (product: Product | any, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateCartQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getCartCount: () => number
  getCartTotal: () => number
  
  // Wishlist actions
  addToWishlist: (product: Product | any) => void
  removeFromWishlist: (productId: string) => void
  toggleWishlist: (product: Product) => void
  clearWishlist: () => void
  isInWishlist: (productId: string) => boolean
  
  // Compare actions
  addToCompare: (product: Product) => void
  removeFromCompare: (productId: string) => void
  isInCompare: (productId: string) => boolean
  
  // Outfit actions
  addToOutfit: (product: Product) => void
  removeFromOutfit: (productId: string) => void
  clearOutfit: () => void
  
  // Trial actions
  addToTrial: (product: Product) => void
  removeFromTrial: (productId: string) => void
  clearTrial: () => void
  isInTrial: (productId: string) => boolean
  
  // Recently viewed
  addToRecentlyViewed: (product: Product) => void
  clearRecentlyViewed: () => void
  
  // Search actions
  addRecentSearch: (query: string) => void
  clearRecentSearches: () => void
  
  // Other actions
  setStudentVerified: (verified: boolean) => void
  setNewsletterSubscribed: (subscribed: boolean) => void
  setCookieConsent: (consent: boolean) => void
  setEmailPopupDismissed: (dismissed: boolean) => void
  setDarkStoreOpen: (open: boolean) => void
  setMysteryRewardClaimed: (claimed: boolean) => void
  setCartOpen: (open: boolean) => void
  addRewardsPoints: (points: number) => void
  clearCompare: () => void
  getWishlistCount: () => number
  updateQuantity: (productId: string, quantity: number) => void
  goBack: () => void
  
  // Navigation helpers
  goProduct: (productId: string) => void
  goCategory: (categorySlug: string) => void
  goSearch: (query: string) => void
}

// Create store
export const useShopStore = create<ShopStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentView: 'grid',
      view: 'grid',
      searchQuery: '',
      selectedCategory: null,
      selectedCategoryId: null,
      selectedProduct: null,
      priceRange: [0, 100000],
      sortBy: 'name',
      sortOrder: 'asc',
      
      products: [],
      categories: [],
      cartItems: [],
      wishlistItems: [],
      recommendations: [],
      wishlist: [],
      cart: [],
      recentlyViewed: [],
      lastOrderId: null,
      rewardsPoints: 0,
      theme: 'system',
      
      recentSearches: [],
      compareList: [],
      outfitItems: [],
      trialItems: [],
      studentVerified: false,
      newsletterSubscribed: false,
      cookieConsent: false,
      emailPopupDismissed: false,
      darkStoreOpen: false,
      mysteryRewardClaimed: false,
      
      sidebarOpen: false,
      cartOpen: false,
      loading: false,
      error: null,
      
      // View actions
      setCurrentView: (view) => set({ currentView: view, view }),
      setView: (view) => set({ view }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedCategory: (categoryId) => set({ selectedCategory: categoryId, selectedCategoryId: categoryId }),
      setSelectedCategoryId: (categoryId) => set({ selectedCategoryId: categoryId }),
      setSelectedProduct: (product) => set({ selectedProduct: product }),
      setPriceRange: (range) => set({ priceRange: range }),
      setSortBy: (sortBy) => set({ sortBy }),
      setSortOrder: (order) => set({ sortOrder: order }),
      setLastOrderId: (orderId) => set({ lastOrderId: orderId }),
      
      // Data actions
      setProducts: (products) => set({ products }),
      setCategories: (categories) => set({ categories }),
      setCartItems: (items) => set({ cartItems: items, cart: items }),
      setWishlistItems: (items) => set({ wishlistItems: items, wishlist: items }),
      setRecommendations: (items) => set({ recommendations: items }),
      
      // UI actions
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      toggleCart: () => set((state) => ({ cartOpen: !state.cartOpen })),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      toggleTheme: () => set((state) => ({ 
        theme: state.theme === 'light' ? 'dark' : state.theme === 'dark' ? 'system' : 'light' 
      })),
      
      // Cart actions
      addToCart: (product, quantity = 1) => {
        const productId = product.productId || product.id
        const { cartItems } = get()
        const existingItem = cartItems.find(item => item.productId === productId)
        
        if (existingItem) {
          const updatedItems = cartItems.map(item =>
            item.productId === productId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
          set({ cartItems: updatedItems, cart: updatedItems })
        } else {
          const newItem: CartItem = {
            id: `cart_${Date.now()}_${Math.random()}`,
            cartId: 'default',
            productId,
            productName: product.name,
            name: product.name,
            price: product.price,
            quantity,
            imageUrl: product.imageUrl,
            product,
            createdAt: new Date(),
            updatedAt: new Date()
          }
          const updatedItems = [...cartItems, newItem]
          set({ cartItems: updatedItems, cart: updatedItems })
        }
      },
      
      removeFromCart: (productId) => {
        const updatedItems = get().cartItems.filter(item => item.productId !== productId)
        set({ cartItems: updatedItems, cart: updatedItems })
      },
      
      updateCartQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId)
          return
        }
        
        const updatedItems = get().cartItems.map(item =>
          item.productId === productId ? { ...item, quantity } : item
        )
        set({ cartItems: updatedItems, cart: updatedItems })
      },
      
      clearCart: () => set({ cartItems: [], cart: [] }),
      
      getCartCount: () => {
        return get().cartItems.reduce((total, item) => total + item.quantity, 0)
      },
      
      getCartTotal: () => {
        return get().cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
      },
      
      // Wishlist actions
      addToWishlist: (product) => {
        const productId = product.productId || product.id
        const { wishlistItems } = get()
        const exists = wishlistItems.some(item => item.productId === productId)
        
        if (!exists) {
          const newItem: WishlistItem = {
            id: `wishlist_${Date.now()}_${Math.random()}`,
            userId: 'current_user',
            productId,
            name: product.name,
            price: product.price,
            comparePrice: product.comparePrice,
            imageUrl: product.imageUrl,
            createdAt: new Date(),
            addedAt: new Date(),
            product
          }
          const updatedItems = [...wishlistItems, newItem]
          set({ wishlistItems: updatedItems, wishlist: updatedItems })
        }
      },
      
      removeFromWishlist: (productId) => {
        const updatedItems = get().wishlistItems.filter(item => item.productId !== productId)
        set({ wishlistItems: updatedItems, wishlist: updatedItems })
      },
      
      toggleWishlist: (product) => {
        const productId = product.productId || product.id
        const { wishlistItems } = get()
        const exists = wishlistItems.some(item => item.productId === productId)
        
        if (exists) {
          get().removeFromWishlist(productId)
        } else {
          get().addToWishlist(product)
        }
      },
      
      clearWishlist: () => set({ wishlistItems: [], wishlist: [] }),
      
      isInWishlist: (productId) => {
        return get().wishlistItems.some(item => item.productId === productId)
      },
      
      // Compare actions
      addToCompare: (product) => {
        const { compareList } = get()
        if (!compareList.some(item => item.id === product.id)) {
          set({ compareList: [...compareList, product] })
        }
      },
      
      removeFromCompare: (productId) => {
        set((state) => ({
          compareList: state.compareList.filter(item => item.id !== productId)
        }))
      },
      
      isInCompare: (productId) => {
        return get().compareList.some(item => item.id === productId)
      },
      
      // Outfit actions
      addToOutfit: (product) => {
        const { outfitItems } = get()
        if (!outfitItems.includes(product.id)) {
          set({ outfitItems: [...outfitItems, product.id] })
        }
      },
      
      removeFromOutfit: (productId) => {
        set((state) => ({
          outfitItems: state.outfitItems.filter(item => item !== productId)
        }))
      },
      
      clearOutfit: () => set({ outfitItems: [] }),
      
      // Trial actions
      addToTrial: (product) => {
        const { trialItems } = get()
        if (!trialItems.includes(product.id)) {
          set({ trialItems: [...trialItems, product.id] })
        }
      },
      
      removeFromTrial: (productId) => {
        set((state) => ({
          trialItems: state.trialItems.filter(item => item !== productId)
        }))
      },
      
      clearTrial: () => set({ trialItems: [] }),
      
      isInTrial: (productId) => {
        return get().trialItems.includes(productId)
      },
      
      // Recently viewed
      addToRecentlyViewed: (product) => {
        const { recentlyViewed } = get()
        const filtered = recentlyViewed.filter(item => item.id !== product.id)
        set({ recentlyViewed: [product, ...filtered].slice(0, 10) })
      },
      
      clearRecentlyViewed: () => set({ recentlyViewed: [] }),
      
      // Search actions
      addRecentSearch: (query) => {
        const { recentSearches } = get()
        const filtered = recentSearches.filter(search => search !== query)
        set({ recentSearches: [query, ...filtered].slice(0, 10) })
      },
      
      clearRecentSearches: () => set({ recentSearches: [] }),
      
      // Other actions
      setStudentVerified: (verified) => set({ studentVerified: verified }),
      setNewsletterSubscribed: (subscribed) => set({ newsletterSubscribed: subscribed }),
      setCookieConsent: (consent) => set({ cookieConsent: consent }),
      setEmailPopupDismissed: (dismissed) => set({ emailPopupDismissed: dismissed }),
      setDarkStoreOpen: (open) => set({ darkStoreOpen: open }),
      setMysteryRewardClaimed: (claimed) => set({ mysteryRewardClaimed: claimed }),
      setCartOpen: (open) => set({ cartOpen: open }),
      addRewardsPoints: (points) => set((state) => ({ rewardsPoints: state.rewardsPoints + points })),
      clearCompare: () => set({ compareList: [] }),
      getWishlistCount: () => get().wishlistItems.length,
      updateQuantity: (productId, quantity) => get().updateCartQuantity(productId, quantity),
      goBack: () => window.history.back(),
      
      // Navigation helpers
      goProduct: (productId) => {
        window.location.href = `/product/${productId}`
      },
      
      goCategory: (categorySlug) => {
        window.location.href = `/category/${categorySlug}`
      },
      
      goSearch: (query) => {
        window.location.href = `/search?q=${encodeURIComponent(query)}`
      }
    }),
    {
      name: 'shop-store',
      partialize: (state) => ({
        cartItems: state.cartItems,
        wishlistItems: state.wishlistItems,
        currentView: state.currentView,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
        theme: state.theme,
        recentSearches: state.recentSearches,
        studentVerified: state.studentVerified,
        newsletterSubscribed: state.newsletterSubscribed,
        recentlyViewed: state.recentlyViewed
      })
    }
  )
)

// Hydration hook for SSR
export const useHydration = () => {
  const [hydrated, setHydrated] = useState(false)
  
  useEffect(() => {
    setHydrated(true)
  }, [])
  
  return hydrated
}

// Helper functions
export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price)
}

export const calculateDiscount = (price: number, comparePrice?: number) => {
  if (!comparePrice || comparePrice <= price) return 0
  return Math.round(((comparePrice - price) / comparePrice) * 100)
}

export const isInStock = (product: Product) => {
  return product.inventory > product.reserved
}

export const getLowStockWarning = (product: Product) => {
  const available = product.inventory - product.reserved
  return available <= 5 && available > 0
}
