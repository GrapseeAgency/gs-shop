'use client'

import { motion } from 'framer-motion'

// ==========================================
// PRODUCT DETAIL ILLUSTRATIONS (35 Total)
// Extended animated SVGs for product detail pages
// ==========================================

// Product 1: Business Landing Page
export function DetailIllustrationBusinessLandingPage() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e3a5f] to-[#0f172a]">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(59,130,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
      </div>
      
      {/* Browser Frame */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="absolute top-4 left-4 right-4 bottom-4 bg-glass-deep/95 rounded-xl shadow-2xl overflow-hidden"
      >
        {/* Browser Header */}
        <div className="h-8 bg-glass-mid border-b flex items-center px-3 gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 mx-4">
            <div className="h-4 bg-glass-light rounded text-xs flex items-center justify-center text-gray-400">
              yourbusiness.com
            </div>
          </div>
        </div>
        
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="h-24 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center"
        >
          <motion.div
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="text-center"
          >
            <div className="text-white text-lg font-bold">Transform Your Business</div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1, delay: 1.5 }}
              className="h-1 bg-glass-deep/50 rounded mt-2 mx-4"
            />
          </motion.div>
        </motion.div>
        
        {/* Features Grid */}
        <div className="p-3 grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 2 + i * 0.3 }}
              className="bg-glass-very-light rounded-lg p-2"
            >
              <motion.div
                animate={{ backgroundColor: ['#e5e7eb', '#d1d5db', '#e5e7eb'] }}
                transition={{ repeat: Infinity, duration: 2, delay: i * 0.5 }}
                className="w-6 h-6 rounded mb-1.5"
              />
              <div className="h-2 bg-glass-light rounded w-full mb-1" />
              <div className="h-2 bg-glass-light rounded w-2/3" />
            </motion.div>
          ))}
        </div>
        
        {/* CTA Button */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 3.5, type: 'spring' }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ 
              boxShadow: [
                '0 0 0 0 rgba(59,130,246,0.4)',
                '0 0 0 15px rgba(59,130,246,0)',
                '0 0 0 0 rgba(59,130,246,0)'
              ]
            }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium"
          >
            Get Started 
          </motion.div>
        </motion.div>
      </motion.div>
      
      {/* Floating Elements */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-blue-400/30 rounded-full"
          style={{ top: `${20 + i * 30}%`, left: `${10 + i * 40}%` }}
          animate={{ 
            y: [0, -30, 0],
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 4 + i,
            delay: i * 0.5 
          }}
        />
      ))}
    </div>
  )
}

// Product 2: E-commerce Website
export function DetailIllustrationEcommerce() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#1a0a2e] via-[#2d1b4e] to-[#1a0a2e]">
      {/* Shopping Flow Animation */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Phone [] */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative w-48 h-72 bg-gray-900 rounded-3xl p-2 shadow-2xl"
        >
          <div className="w-full h-full bg-glass-deep rounded-2xl overflow-hidden">
            {/* App Header */}
            <div className="h-8 bg-purple-600 flex items-center px-2">
              <div className="text-white text-xs font-bold">ShopApp</div>
            </div>
            
            {/* Product Card */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="p-2"
            >
              <motion.div
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg mb-2 flex items-center justify-center"
              >
                <span className="text-2xl"></span>
              </motion.div>
              <div className="h-2 bg-glass-light rounded w-3/4 mb-1" />
              <div className="h-2 bg-gray-300 rounded w-1/2" />
            </motion.div>
            
            {/* Add to Cart Button */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 2, type: 'spring' }}
              className="mx-2 bg-purple-600 text-white text-xs py-2 rounded text-center"
            >
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                 Add to Cart
              </motion.span>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Arrow Flow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
          className="mx-4"
        >
          <motion.div
            animate={{ x: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="text-3xl text-white/50"
          >
            
          </motion.div>
        </motion.div>
        
        {/* Cart/Checkout */}
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 3 }}
          className="relative w-48 h-72 bg-gray-900 rounded-3xl p-2 shadow-2xl"
        >
          <div className="w-full h-full bg-glass-deep rounded-2xl overflow-hidden">
            <div className="h-8 bg-green-600 flex items-center px-2">
              <div className="text-white text-xs font-bold">Checkout</div>
            </div>
            
            {/* Cart Items */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3.5 }}
              className="p-2 space-y-2"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center"></div>
                <div className="flex-1">
                  <div className="h-2 bg-glass-light rounded w-full" />
                  <div className="h-2 bg-gray-300 rounded w-8 mt-1" />
                </div>
              </div>
              
              {/* Payment Success */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 4, type: 'spring' }}
                className="mt-4 bg-green-100 rounded-lg p-2 text-center"
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 0.5, delay: 4.2 }}
                  className="text-green-600 text-lg"
                >
                  
                </motion.div>
                <div className="text-green-700 text-xs mt-1">Order Confirmed!</div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
      
      {/* Background Particles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-purple-400 rounded-full"
          style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
          animate={{ 
            y: [0, -100],
            opacity: [0.5, 0]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 3 + Math.random() * 2,
            delay: Math.random() * 2
          }}
        />
      ))}
    </div>
  )
}

// Product 3: Corporate Website
export function DetailIllustrationCorporateWebsite() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#0c141c] via-[#1a2d3d] to-[#0c141c]">
      {/* Professional Page Builder */}
      <div className="absolute inset-4 bg-glass-deep/95 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="h-10 bg-slate-800 flex items-center px-4 justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-20 h-3 bg-glass-deep/30 rounded"
            />
            {['About', 'Services', 'Contact'].map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.2 }}
                className="text-white/70 text-xs"
              >
                {item}
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Hero with Professional Elements */}
        <div className="h-28 bg-gradient-to-br from-slate-700 to-slate-800 p-4">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <div className="text-white text-lg font-bold">Enterprise Solutions</div>
            <div className="flex gap-2 mt-2">
              {['Trust', 'Scale', 'Support'].map((tag, i) => (
                <motion.div
                  key={tag}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.5 + i * 0.3, type: 'spring' }}
                  className="bg-glass-deep/20 px-3 py-1 rounded text-white text-xs"
                >
                   {tag}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
        
        {/* Corporate Stats */}
        <div className="p-3 grid grid-cols-4 gap-2">
          {[
            { value: '500+', label: 'Clients' },
            { value: '99.9%', label: 'Uptime' },
            { value: '24/7', label: 'Support' },
            { value: '50+', label: 'Awards' }
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 2 + i * 0.2 }}
              className="text-center p-2 bg-slate-50 rounded"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 2.5 + i * 0.2, type: 'spring' }}
                className="text-slate-700 font-bold text-sm"
              >
                {stat.value}
              </motion.div>
              <div className="text-slate-400 text-xs">{stat.label}</div>
            </motion.div>
          ))}
        </div>
        
        {/* Contact CTA */}
        <motion.div
          initial={{ y: 50 }}
          animate={{ y: 0 }}
          transition={{ delay: 3.5, type: 'spring' }}
          className="absolute bottom-4 left-4 right-4 bg-slate-800 rounded-lg p-3 flex items-center justify-between"
        >
          <div className="text-white text-sm">Ready to scale your business?</div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-600 text-white px-4 py-1.5 rounded text-xs"
          >
            Contact Sales
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}

// Product 4: Portfolio Website
export function DetailIllustrationPortfolioWebsite() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#1a1a2e] via-[#2d2d44] to-[#1a1a2e]">
      {/* Gallery Showcase */}
      <div className="absolute inset-4">
        {/* Masonry Grid */}
        <div className="grid grid-cols-3 gap-2 h-full">
          {[
            { h: 'h-full', delay: 0, icon: '' },
            { h: 'h-1/2', delay: 0.3, icon: '' },
            { h: 'h-3/4', delay: 0.6, icon: '' },
            { h: 'h-1/2', delay: 0.9, icon: '' },
            { h: 'h-full', delay: 1.2, icon: '' },
            { h: 'h-1/3', delay: 1.5, icon: '' }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: item.delay, duration: 0.5 }}
              className={`${item.h} bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center relative overflow-hidden group`}
            >
              <motion.span
                animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 3, delay: i * 0.5 }}
                className="text-3xl opacity-70"
              >
                {item.icon}
              </motion.span>
            </motion.div>
          ))}
        </div>
        
        {/* Floating Name */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute top-2 left-2 bg-glass-deep/90 backdrop-blur px-4 py-2 rounded-lg shadow-lg"
        >
          <div className="text-gray-800 font-bold text-sm">Creative Portfolio</div>
        </motion.div>
      </div>
    </div>
  )
}

// Product 5: SaaS Dashboard
export function DetailIllustrationSaaSDashboard() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
      <div className="absolute inset-3 grid grid-cols-3 grid-rows-3 gap-2">
        {/* Chart Widget */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="col-span-2 bg-glass-deep/95 rounded-lg p-2 shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-medium text-gray-700">Revenue</div>
            <div className="text-xs text-green-600">+12.5%</div>
          </div>
          <svg viewBox="0 0 100 40" className="w-full">
            <motion.path
              d="M0 35 L20 25 L40 30 L60 15 L80 20 L100 10"
              stroke="#10b981"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: 1 }}
            />
          </svg>
        </motion.div>
        
        {/* Stats Cards */}
        {['Users', 'Sales', 'Growth'].map((label, i) => (
          <motion.div
            key={label}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 + i * 0.2 }}
            className="bg-glass-deep/95 rounded-lg p-2 shadow-lg"
          >
            <div className="text-gray-400 text-xs">{label}</div>
            <div className="text-lg font-bold text-gray-800">{['2.4K', '$45K', '+28%'][i]}</div>
          </motion.div>
        ))}
        
        {/* Activity Feed */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="col-span-1 row-span-2 bg-glass-deep/95 rounded-lg p-2 shadow-lg"
        >
          <div className="text-xs font-medium text-gray-700 mb-2">Recent Activity</div>
          {['New signup', 'Payment received', 'Upgrade'].map((act, i) => (
            <motion.div
              key={act}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1.5 + i * 0.3 }}
              className="flex items-center gap-1.5 mb-1.5"
            >
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-xs"></div>
              <div className="text-xs text-gray-600">{act}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

// Product 6: iOS & Android App
export function DetailIllustrationiOSAndroidApp() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#064e3b]">
      <div className="absolute inset-0 flex items-center justify-center gap-4">
        {/* iPhone */}
        <motion.div
          initial={{ x: -50, rotate: -5, opacity: 0 }}
          animate={{ x: 0, rotate: -3, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative w-40 h-72 bg-gray-900 rounded-[2rem] p-2 shadow-2xl border-4 border-gray-800"
        >
          <div className="w-full h-full bg-glass-deep rounded-[1.5rem] overflow-hidden">
            <div className="h-6 bg-emerald-500 flex items-center justify-center">
              <span className="text-white text-xs">iOS</span>
            </div>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="p-2"
            >
              <div className="h-16 bg-emerald-100 rounded-lg mb-2 flex items-center justify-center text-2xl"></div>
              <div className="h-2 bg-glass-light rounded" />
            </motion.div>
          </div>
        </motion.div>
        
        {/* Android */}
        <motion.div
          initial={{ x: 50, rotate: 5, opacity: 0 }}
          animate={{ x: 0, rotate: 3, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="relative w-40 h-72 bg-gray-800 rounded-xl p-2 shadow-2xl border-4 border-gray-700"
        >
          <div className="w-full h-full bg-glass-deep rounded-lg overflow-hidden">
            <div className="h-6 bg-green-600 flex items-center justify-center">
              <span className="text-white text-xs">Android</span>
            </div>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, delay: 0.5 }}
              className="p-2"
            >
              <div className="h-16 bg-green-100 rounded-lg mb-2 flex items-center justify-center text-2xl"></div>
              <div className="h-2 bg-glass-light rounded" />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// Product 7: MVP App Prototype
export function DetailIllustrationMVPAppPrototype() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#14532d] via-[#166534] to-[#14532d]">
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div className="relative w-56 h-80 bg-glass-deep rounded-xl shadow-xl p-3">
          <div className="text-center text-xs text-green-600 font-medium mb-2">MVP Builder</div>
          <div className="h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg mb-2 flex items-center justify-center">
            <motion.span
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-white font-bold"
            >
              Your App
            </motion.span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <motion.div
              animate={{ backgroundColor: ['#dcfce7', '#bbf7d0', '#dcfce7'] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="h-16 bg-green-100 rounded flex items-center justify-center text-lg"
            >
              
            </motion.div>
            <motion.div
              animate={{ backgroundColor: ['#dcfce7', '#bbf7d0', '#dcfce7'] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
              className="h-16 bg-green-100 rounded flex items-center justify-center text-lg"
            >
              
            </motion.div>
          </div>
          <motion.div className="mt-2 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white text-sm">
            Launch 
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

// Product 8: Food Delivery App
export function DetailIllustrationFoodDeliveryApp() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#7c2d12] via-[#9a3412] to-[#7c2d12]">
      <div className="absolute inset-4">
        <div className="absolute inset-0 bg-amber-50 rounded-xl overflow-hidden">
          {/* Restaurant */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="absolute left-4 top-8 bg-glass-deep rounded-lg p-2 shadow-lg"
          >
            <div className="text-2xl mb-1"></div>
            <div className="text-xs text-gray-600">Restaurant</div>
          </motion.div>
          
          {/* Delivery Person */}
          <motion.div
            animate={{ x: [0, 100, 200], y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, repeatDelay: 1 }}
            className="absolute left-8 top-14"
          >
            <div className="bg-orange-500 text-white rounded-full p-2 shadow-lg">
              <span className="text-lg"></span>
            </div>
          </motion.div>
          
          {/* Customer */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1, type: 'spring' }}
            className="absolute right-4 top-8 bg-glass-deep rounded-lg p-2 shadow-lg"
          >
            <div className="text-2xl mb-1"></div>
            <div className="text-xs text-gray-600">You</div>
          </motion.div>
          
          {/* Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, repeat: Infinity, repeatDelay: 2 }}
            className="absolute bottom-4 left-4 right-4 bg-glass-deep/90 rounded-lg p-2 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full"
                />
                <span className="text-sm text-gray-700">On the way</span>
              </div>
              <span className="text-sm text-orange-600 font-medium">15 min</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

// Product 9: CI/CD Pipeline
export function DetailIllustrationCICDPipeline() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#2e1065] via-[#4c1d95] to-[#2e1065]">
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div className="flex items-center gap-2 w-full max-w-md">
          {[
            { name: 'Build', icon: '', color: 'from-blue-500 to-blue-600' },
            { name: 'Test', icon: '', color: 'from-green-500 to-green-600' },
            { name: 'Deploy', icon: '', color: 'from-purple-500 to-purple-600' },
            { name: 'Monitor', icon: '', color: 'from-pink-500 to-pink-600' }
          ].map((stage, i) => (
            <div key={stage.name} className="flex-1 flex flex-col items-center">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.8, type: 'spring' }}
                className={`w-14 h-14 rounded-lg bg-gradient-to-br ${stage.color} flex items-center justify-center text-2xl shadow-lg`}
              >
                {stage.icon}
              </motion.div>
              <div className="mt-2 text-white/80 text-xs font-medium">{stage.name}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Progress Bar */}
      <motion.div
        initial={{ width: '0%' }}
        animate={{ width: '100%' }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute bottom-4 left-4 right-4 h-2 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-full"
      />
    </div>
  )
}

// Product 10: Cloud Infrastructure
export function DetailIllustrationCloudInfrastructure() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#1e1b4b]">
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Central Cloud */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="relative"
        >
          <div className="text-6xl"></div>
          <motion.div
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 bg-glass-deep/20 rounded-full blur-xl"
          />
        </motion.div>
        
        {/* Connected Servers */}
        {[
          { pos: 'top-8 left-8', icon: '', delay: 0 },
          { pos: 'top-8 right-8', icon: '', delay: 0.5 },
          { pos: 'bottom-20 left-12', icon: '', delay: 1 },
          { pos: 'bottom-20 right-12', icon: '', delay: 1.5 }
        ].map((server, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: server.delay, type: 'spring' }}
            className={`absolute ${server.pos} bg-glass-deep/10 backdrop-blur rounded-lg p-2`}
          >
            <div className="text-2xl">{server.icon}</div>
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: server.delay }}
              className="w-2 h-2 bg-green-400 rounded-full mt-1 mx-auto"
            />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Product 11: Docker & Kubernetes
export function DetailIllustrationDockerKubernetes() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#1e3a8a] via-[#3b82f6] to-[#1e3a8a]">
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Kubernetes Logo */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute w-48 h-48"
        >
          {[...Array(7)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-4 h-4 bg-glass-deep rounded-full"
              style={{
                top: '50%',
                left: '50%',
                transform: `rotate(${i * 51.4}deg) translateX(80px) translateY(-50%)`
              }}
            />
          ))}
        </motion.div>
        
        {/* Docker Containers */}
        {['', '', ''].map((icon, i) => (
          <motion.div
            key={i}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.5, type: 'spring' }}
            className="absolute bg-glass-deep rounded-lg p-2 shadow-lg"
            style={{ 
              bottom: '20%',
              left: `${25 + i * 25}%`
            }}
          >
            <div className="text-2xl">{icon}</div>
          </motion.div>
        ))}
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl"></div>
      </div>
    </div>
  )
}

// Product 12: Brand Identity Design
export function DetailIllustrationBrandIdentityDesign() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#831843] via-[#be185d] to-[#831843]">
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Logo Evolution */}
        <div className="relative w-64 h-64">
          {/* Outer Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 border-4 border-white/20 rounded-full"
          />
          
          {/* Inner Elements */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <div className="text-6xl"></div>
          </motion.div>
          
          {/* Color Palette */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
            {['#be185d', '#db2777', '#f472b6', '#fbcfe8'].map((color, i) => (
              <motion.div
                key={color}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1 + i * 0.2 }}
                className="w-6 h-6 rounded-full shadow-lg"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Typography */}
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute top-4 left-4 bg-glass-deep/90 rounded-lg p-3 shadow-lg"
      >
        <div className="text-2xl font-bold text-gray-800">Brand</div>
        <div className="text-sm text-gray-500">Logo Design</div>
      </motion.div>
    </div>
  )
}

// Product 13: UI/UX Audit
export function DetailIllustrationUIUXAudit() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#701a75] via-[#a21caf] to-[#701a75]">
      <div className="absolute inset-4">
        {/* Audit Report Interface */}
        <div className="bg-glass-deep/95 rounded-xl h-full p-3 shadow-2xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-fuchsia-100 rounded-lg flex items-center justify-center text-lg"></div>
            <div className="text-sm font-bold text-gray-800">UX Audit Report</div>
          </div>
          
          {/* Score Cards */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label: 'Usability', score: 92, color: 'bg-green-500' },
              { label: 'Design', score: 78, color: 'bg-yellow-500' },
              { label: 'Speed', score: 85, color: 'bg-blue-500' }
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + i * 0.3, type: 'spring' }}
                className="bg-glass-very-light rounded-lg p-2 text-center"
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.score}%` }}
                  transition={{ delay: 1 + i * 0.2, duration: 1 }}
                  className={`h-1.5 ${item.color} rounded-full mb-1`}
                />
                <div className="text-xs text-gray-500">{item.label}</div>
                <div className="text-lg font-bold text-gray-800">{item.score}%</div>
              </motion.div>
            ))}
          </div>
          
          {/* Issues List */}
          <div className="space-y-1.5">
            {[
              { issue: 'Button contrast low', type: 'warning' },
              { issue: 'Missing alt text', type: 'error' },
              { issue: 'Form validation OK', type: 'success' }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 2 + i * 0.3 }}
                className={`flex items-center gap-2 p-1.5 rounded text-xs ${
                  item.type === 'error' ? 'bg-red-50 text-red-700' :
                  item.type === 'warning' ? 'bg-yellow-50 text-yellow-700' :
                  'bg-green-50 text-green-700'
                }`}
              >
                <span>{item.type === 'success' ? '' : item.type === 'warning' ? '' : ''}</span>
                <span>{item.issue}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Product 14: Mobile App UI Kit
export function DetailIllustrationMobileAppUIKit() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#881337] via-[#be123c] to-[#881337]">
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Component Grid */}
        <div className="grid grid-cols-3 gap-2 p-4">
          {[
            { icon: '', label: 'Buttons', delay: 0 },
            { icon: '', label: 'Inputs', delay: 0.2 },
            { icon: '', label: 'Sliders', delay: 0.4 },
            { icon: '', label: 'Lists', delay: 0.6 },
            { icon: '', label: 'Cards', delay: 0.8 },
            { icon: '', label: 'Badges', delay: 1 },
            { icon: '', label: 'Charts', delay: 1.2 },
            { icon: '', label: 'Themes', delay: 1.4 },
            { icon: '', label: 'Effects', delay: 1.6 }
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: item.delay, type: 'spring' }}
              whileHover={{ scale: 1.05 }}
              className="bg-glass-deep/90 rounded-lg p-2 flex flex-col items-center justify-center cursor-pointer shadow-lg"
            >
              <motion.span
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
                className="text-xl mb-1"
              >
                {item.icon}
              </motion.span>
              <span className="text-xs text-gray-700">{item.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Phone Frame */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ delay: 2 }}
        className="absolute inset-0 border-8 border-white rounded-3xl m-4 pointer-events-none"
      />
    </div>
  )
}

// Product 15: AI Chatbot Integration
export function DetailIllustrationAIChatbotIntegration() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#0c4a6e] via-[#075985] to-[#0c4a6e]">
      <div className="absolute inset-4 bg-glass-deep/95 rounded-xl shadow-2xl overflow-hidden">
        {/* Chat Interface */}
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="bg-sky-600 text-white px-3 py-2 flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-6 h-6 bg-glass-deep/20 rounded-full flex items-center justify-center text-sm"
            >
              
            </motion.div>
            <span className="text-sm font-medium">AI Assistant</span>
          </div>
          
          {/* Messages */}
          <div className="flex-1 p-3 space-y-2 overflow-hidden">
            {/* User Message */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex justify-end"
            >
              <div className="bg-sky-100 rounded-lg px-3 py-1.5 max-w-[70%]">
                <span className="text-sm text-gray-700">How do I track orders?</span>
              </div>
            </motion.div>
            
            {/* Bot Thinking */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="flex justify-start"
            >
              <div className="bg-glass-mid rounded-lg px-3 py-1.5">
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="text-sm text-gray-500"
                >
                    
                </motion.div>
              </div>
            </motion.div>
            
            {/* Bot Response */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 2.5 }}
              className="flex justify-start"
            >
              <div className="bg-glass-mid rounded-lg px-3 py-1.5 max-w-[70%]">
                <span className="text-sm text-gray-700">Go to My Orders  Track Order </span>
              </div>
            </motion.div>
          </div>
          
          {/* Input */}
          <div className="p-2 border-t">
            <div className="bg-glass-mid rounded-full px-3 py-1.5 flex items-center gap-2">
              <div className="text-gray-400 text-sm">Type a message...</div>
              <motion.div
                animate={{ x: [0, 3, 0] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="ml-auto text-sky-600"
              >
                
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Product 16: ML Data Pipeline
export function DetailIllustrationMLDataPipeline() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#1e1b4b]">
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Data Flow Visualization */}
        <div className="flex items-center gap-4">
          {/* Input Data */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-indigo-500/30 rounded-lg flex items-center justify-center text-3xl mb-2">
              
            </div>
            <div className="text-white/70 text-xs">Raw Data</div>
          </motion.div>
          
          {/* Arrow */}
          <motion.div
            animate={{ x: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="text-white/50 text-2xl"
          >
            
          </motion.div>
          
          {/* Processing */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-purple-500/30 rounded-lg flex items-center justify-center relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="text-3xl"
              >
                
              </motion.div>
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="absolute inset-0 border-2 border-purple-400 rounded-lg"
              />
            </div>
            <div className="text-white/70 text-xs mt-2">ML Processing</div>
          </motion.div>
          
          {/* Arrow */}
          <motion.div
            animate={{ x: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0.5 }}
            className="text-white/50 text-2xl"
          >
            
          </motion.div>
          
          {/* Output */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1, type: 'spring' }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-green-500/30 rounded-lg flex items-center justify-center text-3xl mb-2">
              
            </div>
            <div className="text-white/70 text-xs">Insights</div>
          </motion.div>
        </div>
        
        {/* Data Points Animation */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-glass-deep/30 rounded-full"
            style={{ top: `${20 + i * 15}%`, left: `${10 + i * 20}%` }}
            animate={{ 
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 2 + i * 0.5,
              delay: i * 0.3
            }}
          />
        ))}
      </div>
    </div>
  )
}

// Product 17: SEO Optimization Package
export function DetailIllustrationSEOOptimizationPackage() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#7c2d12] via-[#c2410c] to-[#7c2d12]">
      <div className="absolute inset-4">
        {/* Search Results Animation */}
        <div className="bg-glass-deep/95 rounded-xl h-full p-3 shadow-2xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 bg-glass-mid rounded-full px-3 py-1.5 text-xs text-gray-500">
               How to improve SEO...
            </div>
          </div>
          
          {/* Search Results */}
          <div className="space-y-2">
            {/* Position 3 - Before */}
            <motion.div
              initial={{ y: 0 }}
              animate={{ y: 80, opacity: 0.5 }}
              transition={{ delay: 2, duration: 1 }}
              className="p-2 border border-gray-200 rounded"
            >
              <div className="text-xs text-gray-800">Your Site (Before)</div>
              <div className="text-xs text-gray-500">Position #8</div>
            </motion.div>
            
            {/* Competitors */}
            {['Competitor A', 'Competitor B'].map((comp, i) => (
              <div key={comp} className="p-2 border border-gray-200 rounded">
                <div className="text-xs text-gray-800">{comp}</div>
                <div className="text-xs text-gray-500">Position #{i + 1}</div>
              </div>
            ))}
            
            {/* Your Site - After (moves to #1) */}
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 3, type: 'spring' }}
              className="p-2 border-2 border-green-500 bg-green-50 rounded"
            >
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="text-green-600"
                >
                  
                </motion.div>
                <div>
                  <div className="text-xs font-bold text-gray-800">Your Site (After)</div>
                  <div className="text-xs text-green-600">Position #1 </div>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 4 }}
            className="mt-3 grid grid-cols-2 gap-2"
          >
            <div className="bg-green-100 rounded p-2 text-center">
              <div className="text-lg font-bold text-green-700">+340%</div>
              <div className="text-xs text-green-600">Traffic</div>
            </div>
            <div className="bg-blue-100 rounded p-2 text-center">
              <div className="text-lg font-bold text-blue-700">#1</div>
              <div className="text-xs text-blue-600">Ranking</div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

// Product 18: Social Media Strategy
export function DetailIllustrationSocialMediaStrategy() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#9a3412] via-[#ea580c] to-[#9a3412]">
      <div className="absolute inset-4">
        {/* Content Calendar */}
        <div className="bg-glass-deep/95 rounded-xl h-full p-3 shadow-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-bold text-gray-800">Content Calendar</div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              className="text-xl"
            >
              
            </motion.div>
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-3">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
              <div key={day} className="text-center text-xs text-gray-500 py-1">{day}</div>
            ))}
            {[...Array(14)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.05, type: 'spring' }}
                className={`aspect-square rounded flex items-center justify-center text-xs ${
                  [3, 5, 7, 10, 12].includes(i) 
                    ? 'bg-orange-100 text-orange-700' 
                    : 'bg-glass-very-light text-gray-400'
                }`}
              >
                {[3, 5, 7, 10, 12].includes(i) ? '' : i + 1}
              </motion.div>
            ))}
          </div>
          
          {/* Engagement Stats */}
          <div className="flex gap-2">
            {[
              { icon: '', value: '2.4K', label: 'Likes' },
              { icon: '', value: '842', label: 'Comments' },
              { icon: '', value: '1.1K', label: 'Shares' }
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 2 + i * 0.2 }}
                className="flex-1 bg-glass-very-light rounded-lg p-2 text-center"
              >
                <div className="text-lg">{stat.icon}</div>
                <div className="text-xs font-bold text-gray-800">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Product 19: Mini Landing Page
export function DetailIllustrationMiniLandingPage() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#1e40af] via-[#3b82f6] to-[#1e40af]">
      <div className="absolute inset-4 bg-glass-deep rounded-xl shadow-2xl overflow-hidden">
        {/* Quick Landing Page */}
        <motion.div
          initial={{ y: 50 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring' }}
          className="h-full flex flex-col items-center justify-center p-4"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl mb-3"
          >
            
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg font-bold text-gray-800 text-center mb-2"
          >
            Your Brand
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-xs text-gray-500 text-center mb-4"
          >
            Beautiful landing page in 24h
          </motion.p>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1, type: 'spring' }}
            className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-medium"
          >
            Get Started
          </motion.div>
        </motion.div>
      </div>
      
      {/* Speed Badge */}
      <motion.div
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold shadow-lg"
      >
        24h Delivery!
      </motion.div>
    </div>
  )
}

// Product 20: Starter Business Site
export function DetailIllustrationStarterBusinessSite() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#0f766e] via-[#14b8a6] to-[#0f766e]">
      <div className="absolute inset-4 flex gap-2">
        {/* Multiple Pages Preview */}
        {[
          { name: 'Home', color: 'from-teal-500 to-teal-600', delay: 0 },
          { name: 'About', color: 'from-teal-600 to-teal-700', delay: 0.3 },
          { name: 'Contact', color: 'from-teal-700 to-teal-800', delay: 0.6 }
        ].map((page, i) => (
          <motion.div
            key={page.name}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: page.delay, type: 'spring' }}
            className={`flex-1 bg-gradient-to-b ${page.color} rounded-lg p-2 shadow-lg`}
            style={{ transform: `scale(${1 - i * 0.05})` }}
          >
            <div className="h-full bg-glass-deep/90 rounded p-1.5">
              <div className={`h-8 bg-gradient-to-r ${page.color} rounded mb-1.5 flex items-center justify-center text-white text-xs`}>
                {page.name}
              </div>
              <div className="space-y-1">
                <div className="h-1.5 bg-glass-light rounded" />
                <div className="h-1.5 bg-glass-light rounded w-2/3" />
                <div className="h-1.5 bg-glass-light rounded" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Business Badge */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.5, type: 'spring' }}
        className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-glass-deep px-4 py-1.5 rounded-full shadow-lg"
      >
        <span className="text-teal-700 text-xs font-bold"> Perfect for Startups</span>
      </motion.div>
    </div>
  )
}

// Product 21: Link in Bio Page
export function DetailIllustrationLinkInBioPage() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#be185d] via-[#ec4899] to-[#be185d]">
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Phone [] */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring' }}
          className="w-48 h-72 bg-glass-deep rounded-3xl shadow-2xl p-3"
        >
          {/* Profile */}
          <div className="text-center mb-3">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full mx-auto mb-2 flex items-center justify-center text-2xl"
            >
              
            </motion.div>
            <div className="text-sm font-bold text-gray-800">@username</div>
            <div className="text-xs text-gray-500">Creator | Influencer</div>
          </div>
          
          {/* Links */}
          <div className="space-y-2">
            {[
              { icon: '', label: 'YouTube', color: 'bg-red-100 text-red-600' },
              { icon: '', label: 'Instagram', color: 'bg-purple-100 text-purple-600' },
              { icon: '', label: 'Twitter', color: 'bg-blue-100 text-blue-600' },
              { icon: '', label: 'Shop', color: 'bg-green-100 text-green-600' }
            ].map((link, i) => (
              <motion.div
                key={link.label}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.2 }}
                whileHover={{ scale: 1.02 }}
                className={`${link.color} rounded-lg py-2 px-3 flex items-center gap-2 cursor-pointer`}
              >
                <span>{link.icon}</span>
                <span className="text-xs font-medium">{link.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// Product 22: Simple To-Do App
export function DetailIllustrationSimpleTodoApp() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#047857] via-[#10b981] to-[#047857]">
      <div className="absolute inset-4 bg-glass-deep rounded-xl shadow-2xl p-3">
        {/* App Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-bold text-gray-800">My Tasks</div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center"
          >
            +
          </motion.button>
        </div>
        
        {/* Tasks */}
        <div className="space-y-2">
          {[
            { text: 'Design homepage', done: true, delay: 0 },
            { text: 'Write blog post', done: true, delay: 0.3 },
            { text: 'Review code', done: false, delay: 0.6 },
            { text: 'Team meeting', done: false, delay: 0.9 }
          ].map((task, i) => (
            <motion.div
              key={task.text}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: task.delay }}
              className="flex items-center gap-2 p-2 bg-glass-very-light rounded-lg"
            >
              <motion.div
                initial={false}
                animate={{ 
                  backgroundColor: task.done ? '#10b981' : 'transparent',
                  borderColor: task.done ? '#10b981' : '#d1d5db'
                }}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center text-white text-xs`}
              >
                {task.done && ''}
              </motion.div>
              <span className={`text-sm ${task.done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                {task.text}
              </span>
            </motion.div>
          ))}
        </div>
        
        {/* Progress */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-3"
        >
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>2/4</span>
          </div>
          <div className="h-2 bg-glass-light rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '50%' }}
              transition={{ delay: 2, duration: 0.5 }}
              className="h-full bg-emerald-500 rounded-full"
            />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// Product 23: Basic Calculator App
export function DetailIllustrationBasicCalculatorApp() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#374151] via-[#6b7280] to-[#374151]">
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Calculator */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring' }}
          className="bg-gray-800 rounded-2xl p-3 shadow-2xl"
        >
          {/* Display */}
          <div className="bg-gray-900 rounded-lg p-3 mb-2 text-right">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-3xl text-white font-mono"
            >
              1,337
            </motion.div>
          </div>
          
          {/* Buttons */}
          <div className="grid grid-cols-4 gap-1.5">
            {['C', '', '', '-', '7', '8', '9', '+', '4', '5', '6', '=', '1', '2', '3', '0'].map((btn, i) => (
              <motion.button
                key={btn}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.03, type: 'spring' }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`w-10 h-10 rounded-lg text-sm font-medium ${
                  btn === '=' ? 'bg-orange-500 text-white row-span-2 h-[82px]' :
                  ['C', '', '', '-', '+'].includes(btn) ? 'bg-orange-400 text-white' :
                  'bg-gray-600 text-white'
                }`}
              >
                {btn}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// Product 24: Expense Tracker Lite
export function DetailIllustrationExpenseTrackerLite() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#059669] via-[#34d399] to-[#059669]">
      <div className="absolute inset-4 bg-glass-deep rounded-xl shadow-2xl p-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-bold text-gray-800"> Expenses</div>
          <div className="text-xs text-emerald-600">Jan 2026</div>
        </div>
        
        {/* Balance Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring' }}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg p-3 mb-3 text-white"
        >
          <div className="text-xs opacity-80">Total Balance</div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-2xl font-bold"
          >
            $1,234.56
          </motion.div>
        </motion.div>
        
        {/* Mini Chart */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Spending Trend</span>
          </div>
          <svg viewBox="0 0 100 30" className="w-full h-8">
            <motion.path
              d="M0 25 L20 20 L40 22 L60 15 L80 18 L100 10"
              stroke="#10b981"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, delay: 1 }}
            />
          </svg>
        </div>
        
        {/* Recent Transactions */}
        <div className="space-y-1.5">
          {[
            { icon: '', name: 'Lunch', amount: -12.50, time: '2h ago' },
            { icon: '', name: 'Uber', amount: -24.00, time: '5h ago' },
            { icon: '', name: 'Salary', amount: 2500, time: '1d ago' }
          ].map((tx, i) => (
            <motion.div
              key={tx.name}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1.5 + i * 0.2 }}
              className="flex items-center justify-between p-2 bg-glass-very-light rounded-lg"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-glass-light rounded-full flex items-center justify-center">{tx.icon}</div>
                <div>
                  <div className="text-xs font-medium text-gray-800">{tx.name}</div>
                  <div className="text-xs text-gray-400">{tx.time}</div>
                </div>
              </div>
              <div className={`text-xs font-bold ${tx.amount > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Product 25: Auto Backup Script
export function DetailIllustrationAutoBackupScript() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#4c1d95] via-[#7c3aed] to-[#4c1d95]">
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Backup Flow Animation */}
        <div className="relative">
          {/* Source Server */}
          <motion.div
            initial={{ x: -80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: 'spring' }}
            className="absolute left-0 top-1/2 -translate-y-1/2 text-center"
          >
            <div className="w-20 h-20 bg-gray-800 rounded-lg flex flex-col items-center justify-center shadow-lg border-2 border-gray-600">
              <span className="text-2xl mb-1"></span>
              <span className="text-xs text-gray-400">Server</span>
            </div>
          </motion.div>
          
          {/* Data Transfer Animation */}
          <div className="absolute left-20 top-1/2 -translate-y-1/2 w-32">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-violet-400 rounded-full"
                  animate={{ 
                    x: [0, 20, 0],
                    opacity: [0.3, 1, 0.3]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 1.5,
                    delay: i * 0.2
                  }}
                />
              ))}
            </div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-1 bg-violet-500/50 rounded-full mt-2"
            />
          </div>
          
          {/* Cloud Storage */}
          <motion.div
            initial={{ x: 80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-center"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="w-20 h-20 bg-gradient-to-b from-violet-400 to-purple-600 rounded-2xl flex flex-col items-center justify-center shadow-2xl"
            >
              <span className="text-2xl mb-1"></span>
              <span className="text-xs text-white">Cloud</span>
            </motion.div>
          </motion.div>
          
          {/* Center Checkmark */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 2, type: 'spring' }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg z-10"
          >
            <motion.div
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 2.5, duration: 0.5 }}
              className="text-white text-xl"
            >
              
            </motion.div>
          </motion.div>
        </div>
        
        {/* Status Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-glass-deep/90 backdrop-blur px-4 py-2 rounded-full shadow-lg"
        >
          <div className="text-violet-700 text-xs font-medium flex items-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-3 h-3 border-2 border-violet-600 border-t-transparent rounded-full"
            />
            Auto Backup Active
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// Product 26: Server Monitor Bot
export function DetailIllustrationServerMonitorBot() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#1e1b4b] via-[#4338ca] to-[#1e1b4b]">
      <div className="absolute inset-4 bg-glass-deep/95 rounded-xl shadow-2xl p-3">
        {/* Bot Header */}
        <div className="flex items-center gap-2 mb-3">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-xl"
          >
            
          </motion.div>
          <div>
            <div className="text-sm font-bold text-gray-800">Server Monitor Bot</div>
            <div className="text-xs text-gray-500">24/7 Monitoring Active</div>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-2 h-2 bg-green-500 rounded-full"
            />
            <span className="text-xs text-green-600">Online</span>
          </div>
        </div>
        
        {/* Server Status Grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {[
            { label: 'CPU', value: '42%', color: 'bg-blue-500', delay: 0 },
            { label: 'Memory', value: '68%', color: 'bg-yellow-500', delay: 0.2 },
            { label: 'Disk', value: '23%', color: 'bg-green-500', delay: 0.4 },
            { label: 'Network', value: '85%', color: 'bg-purple-500', delay: 0.6 }
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: stat.delay, type: 'spring' }}
              className="bg-glass-very-light rounded-lg p-2"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-600">{stat.label}</span>
                <span className="text-xs font-bold text-gray-800">{stat.value}</span>
              </div>
              <div className="h-2 bg-glass-light rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: stat.value }}
                  transition={{ delay: stat.delay + 0.5, duration: 1 }}
                  className={`h-full ${stat.color} rounded-full`}
                />
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Alert Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
          className="bg-glass-very-light rounded-lg p-2"
        >
          <div className="text-xs font-medium text-gray-700 mb-2">Recent Alerts</div>
          {[
            { time: '2 min ago', msg: 'CPU spike detected', type: 'warning' },
            { time: '15 min ago', msg: 'Backup completed', type: 'success' }
          ].map((alert, i) => (
            <motion.div
              key={i}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1.2 + i * 0.2 }}
              className={`flex items-center gap-2 p-1.5 rounded text-xs ${
                alert.type === 'warning' ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'
              }`}
            >
              <span>{alert.type === 'warning' ? '' : ''}</span>
              <span className="flex-1">{alert.msg}</span>
              <span className="text-gray-400">{alert.time}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

// Product 27: Icon Pack Starter
export function DetailIllustrationIconPackStarter() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#be123c] via-[#fb7185] to-[#be123c]">
      <div className="absolute inset-4 flex items-center justify-center">
        {/* Icon Grid */}
        <div className="grid grid-cols-4 gap-3">
          {['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''].map((icon, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                delay: i * 0.05, 
                type: 'spring',
                stiffness: 200
              }}
              whileHover={{ 
                scale: 1.2, 
                rotate: [0, -10, 10, 0],
                transition: { duration: 0.3 }
              }}
              className="w-12 h-12 bg-glass-deep/90 rounded-xl flex items-center justify-center text-2xl shadow-lg cursor-pointer"
            >
              {icon}
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Pack Label */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-glass-deep/90 backdrop-blur px-4 py-2 rounded-full shadow-lg"
      >
        <div className="text-rose-700 text-sm font-bold">50+ Icons Included</div>
      </motion.div>
    </div>
  )
}

// Product 28: Wireframe Kit Lite
export function DetailIllustrationWireframeKitLite() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#9f1239] via-[#e11d48] to-[#9f1239]">
      <div className="absolute inset-4">
        {/* Wireframe Components */}
        <div className="grid grid-cols-2 gap-3 h-full">
          {/* Wireframe Cards */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <div className="border-2 border-dashed border-white/40 rounded-lg p-3 h-20 flex flex-col justify-center gap-2">
              <div className="h-2 bg-glass-deep/30 rounded w-3/4" />
              <div className="h-2 bg-glass-deep/30 rounded w-1/2" />
            </div>
            <div className="border-2 border-dashed border-white/40 rounded-lg p-3 h-16 flex flex-col justify-center gap-2">
              <div className="h-2 bg-glass-deep/30 rounded" />
              <div className="h-2 bg-glass-deep/30 rounded w-2/3" />
            </div>
          </motion.div>
          
          {/* UI Components Preview */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-glass-deep/10 rounded-lg p-3 space-y-2"
          >
            <div className="h-8 bg-rose-500/80 rounded flex items-center justify-center text-white text-xs">Header</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="h-12 bg-glass-deep/20 rounded" />
              <div className="h-12 bg-glass-deep/20 rounded" />
            </div>
            <div className="h-8 bg-glass-deep/30 rounded" />
          </motion.div>
        </div>
        
        {/* Kit Label */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, type: 'spring' }}
          className="absolute bottom-2 right-2 bg-glass-deep px-3 py-1.5 rounded-lg shadow-lg"
        >
          <div className="text-rose-700 text-xs font-bold">Wireframe Kit</div>
        </motion.div>
      </div>
    </div>
  )
}

// Product 29: AI Text Summarizer
export function DetailIllustrationAITextSummarizer() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#0c4a6e] via-[#0ea5e9] to-[#0c4a6e]">
      <div className="absolute inset-4 flex gap-3">
        {/* Original Text */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: 'spring' }}
          className="flex-1 bg-glass-deep/95 rounded-xl p-3 shadow-lg"
        >
          <div className="text-xs font-bold text-gray-800 mb-2"> Original Text</div>
          <div className="space-y-1">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ width: 0 }}
                animate={{ width: `${70 + Math.random() * 30}%` }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="h-2 bg-glass-light rounded"
              />
            ))}
          </div>
          <div className="text-xs text-gray-400 mt-2">350 words</div>
        </motion.div>
        
        {/* AI Processing */}
        <div className="flex flex-col items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="text-4xl mb-2"
          >
            
          </motion.div>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-white/70 text-xs"
          >
            Processing...
          </motion.div>
          <motion.div
            animate={{ x: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="text-white/50 text-xl mt-1"
          >
            
          </motion.div>
        </div>
        
        {/* Summary */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 1.5, type: 'spring' }}
          className="flex-1 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl p-3 shadow-lg text-white"
        >
          <div className="text-xs font-bold mb-2"> Summary</div>
          <div className="space-y-1">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 2 + i * 0.2 }}
                className="flex items-center gap-1"
              >
                <span className="text-sky-200">-</span>
                <div className="h-2 bg-glass-deep/30 rounded flex-1" />
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3 }}
            className="text-xs text-sky-200 mt-2"
          >
            50 words (85% reduction)
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

// Product 30: Smart Email Classifier
export function DetailIllustrationSmartEmailClassifier() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#1e40af] via-[#60a5fa] to-[#1e40af]">
      <div className="absolute inset-4 bg-glass-deep/95 rounded-xl shadow-2xl p-3">
        {/* Email Client Header */}
        <div className="flex items-center gap-2 mb-3 pb-2 border-b">
          <div className="text-sm font-bold text-gray-800"> Smart Inbox</div>
          <div className="flex gap-1 ml-auto">
            {['All', 'Important', 'Spam'].map((tab, i) => (
              <motion.div
                key={tab}
                whileHover={{ scale: 1.05 }}
                className={`px-2 py-1 rounded text-xs ${i === 1 ? 'bg-blue-100 text-blue-700' : 'text-gray-500'}`}
              >
                {tab}
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Email List */}
        <div className="space-y-1.5">
          {[
            { from: 'Boss', subject: 'Q4 Report', type: 'important', time: '10:30 AM' },
            { from: 'Team', subject: 'Meeting notes', type: 'normal', time: '9:15 AM' },
            { from: 'Unknown', subject: 'Win prize!', type: 'spam', time: '8:45 AM' },
            { from: 'Client', subject: 'New project', type: 'important', time: 'Yesterday' }
          ].map((email, i) => (
            <motion.div
              key={i}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.2 }}
              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer ${
                email.type === 'important' ? 'bg-amber-50 border-l-4 border-amber-500' :
                email.type === 'spam' ? 'bg-red-50 opacity-60' :
                'bg-glass-very-light'
              }`}
            >
              <motion.div
                animate={{ 
                  rotate: email.type === 'important' ? [0, 15, -15, 0] : 0 
                }}
                transition={{ repeat: email.type === 'important' ? Infinity : 0, duration: 2 }}
                className="w-8 h-8 rounded-full bg-glass-light flex items-center justify-center text-xs"
              >
                {email.from[0]}
              </motion.div>
              <div className="flex-1">
                <div className={`text-xs font-medium ${email.type === 'important' ? 'text-amber-700' : 'text-gray-700'}`}>
                  {email.subject}
                </div>
                <div className="text-xs text-gray-400">{email.from}</div>
              </div>
              <div className="text-xs text-gray-400">{email.time}</div>
              {email.type === 'spam' && (
                <div className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">Spam</div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Product 31: Basic Image Recognition API
export function DetailIllustrationBasicImageRecognitionAPI() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#1e3a8a] via-[#3b82f6] to-[#1e3a8a]">
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Image Upload */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring' }}
          className="relative"
        >
          {/* Image Frame */}
          <div className="w-48 h-48 bg-glass-deep/10 backdrop-blur rounded-2xl p-2 shadow-2xl border-2 border-white/30">
            <div className="w-full h-full bg-gradient-to-br from-blue-200 to-purple-200 rounded-xl flex items-center justify-center relative overflow-hidden">
              <span className="text-6xl"></span>
              
              {/* Detection Boxes */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, type: 'spring' }}
                className="absolute top-8 left-8 right-8 bottom-8 border-2 border-green-400 rounded-lg"
              >
                <div className="absolute -top-6 left-0 bg-green-500 text-white text-xs px-2 py-1 rounded">
                  Dog: 98%
                </div>
              </motion.div>
            </div>
          </div>
          
          {/* Processing Rings */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="absolute -inset-4 border-2 border-dashed border-white/30 rounded-3xl"
          />
        </motion.div>
        
        {/* API Badge */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-glass-deep px-4 py-2 rounded-full shadow-lg"
        >
          <div className="text-blue-700 text-sm font-bold flex items-center gap-2">
            <span></span>
            API Response: 120ms
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// Product 32: Meta Tags Optimizer
export function DetailIllustrationMetaTagsOptimizer() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#c2410c] via-[#fb923c] to-[#c2410c]">
      <div className="absolute inset-4 bg-glass-deep rounded-xl shadow-2xl overflow-hidden">
        {/* Browser Preview */}
        <div className="h-8 bg-glass-mid flex items-center px-2 gap-1">
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <div className="w-2 h-2 rounded-full bg-yellow-400" />
            <div className="w-2 h-2 rounded-full bg-green-400" />
          </div>
        </div>
        
        {/* Search Preview */}
        <div className="p-3">
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-4"
          >
            <div className="text-xs text-gray-800 mb-1">Before:</div>
            <div className="border border-gray-200 rounded p-2 opacity-50">
              <div className="text-blue-600 text-sm">Home - My Website</div>
              <div className="text-xs text-gray-500">Welcome to my website...</div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <div className="text-xs text-gray-800 mb-1">After Optimization:</div>
            <motion.div
              animate={{ boxShadow: ['0 0 0 0 rgba(249, 115, 22, 0.4)', '0 0 0 10px rgba(249, 115, 22, 0)', '0 0 0 0 rgba(249, 115, 22, 0)'] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="border-2 border-orange-400 rounded p-2"
            >
              <div className="text-green-600 text-sm font-medium">Best Product | Brand Name</div>
              <div className="text-xs text-gray-600">Buy the best product with free shipping...</div>
              <div className="flex gap-1 mt-1">
                <span className="text-xs bg-green-100 text-green-700 px-1.5 rounded"> 4.9</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-1.5 rounded">$29.99</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
      
      {/* Score Badge */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2.5, type: 'spring' }}
        className="absolute top-2 right-2 bg-green-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg"
      >
        98
      </motion.div>
    </div>
  )
}

// Product 33: Local SEO Booster
export function DetailIllustrationLocalSEOBooster() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#ea580c] via-[#fdba74] to-[#ea580c]">
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Map View */}
        <div className="relative w-full h-full max-w-md">
          {/* Map Background */}
          <div className="absolute inset-4 bg-amber-50 rounded-xl shadow-2xl overflow-hidden">
            {/* Grid Lines */}
            <div className="absolute inset-0 opacity-20">
              <svg className="w-full h-full">
                <defs>
                  <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#9a3412" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#mapGrid)" />
              </svg>
            </div>
            
            {/* Your Business - Center */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <motion.div
                animate={{ 
                  boxShadow: ['0 0 0 0 rgba(234, 88, 12, 0.4)', '0 0 0 20px rgba(234, 88, 12, 0)', '0 0 0 0 rgba(234, 88, 12, 0)']
                }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center text-white text-2xl shadow-lg"
              >
                
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute top-14 left-1/2 -translate-x-1/2 bg-glass-deep px-2 py-1 rounded shadow text-xs font-bold whitespace-nowrap"
              >
                Your Business
              </motion.div>
            </motion.div>
            
            {/* Competitors */}
            {[
              { x: '20%', y: '30%', delay: 0.5 },
              { x: '70%', y: '25%', delay: 0.7 },
              { x: '75%', y: '70%', delay: 0.9 }
            ].map((pos, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 0.6 }}
                transition={{ delay: pos.delay, type: 'spring' }}
                className="absolute w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-sm"
                style={{ left: pos.x, top: pos.y }}
              >
                
              </motion.div>
            ))}
            
            {/* Rating Stars */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="absolute bottom-4 left-4 bg-glass-deep rounded-lg p-2 shadow-lg"
            >
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 2 + i * 0.1 }}
                    className="text-yellow-500"
                  >
                    
                  </motion.span>
                ))}
                <span className="text-xs text-gray-700 ml-1">4.9 (128 reviews)</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Product 34: Add more products (if needed)
export function DetailIllustrationComingSoon() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-gray-600 via-gray-700 to-gray-600">
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-center text-white"
        >
          <div className="text-4xl mb-2"></div>
          <div className="text-lg font-bold">Coming Soon</div>
          <div className="text-sm opacity-70">Product illustration in progress</div>
        </motion.div>
      </div>
    </div>
  )
}

// Product 35: Placeholder
export function DetailIllustrationPlaceholder() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-gray-500 via-gray-600 to-gray-500">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-4xl mb-2"></div>
          <div className="text-lg font-bold">Product Detail</div>
          <div className="text-sm opacity-70">Illustration loading...</div>
        </div>
      </div>
    </div>
  )
}

