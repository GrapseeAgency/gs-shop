'use client'

import { motion } from 'framer-motion'

// All 18 product illustrations - exported for use in product cards
// Force recompile

// ==========================================
// WEBSITES CATEGORY - Blue Gradient Theme
// ==========================================

// Product 1: Business Landing Page
export function IllustrationBusinessLandingPage() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#0f172a] to-[#1e3a5f]">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-cyan-500/15 rounded-full blur-3xl" />
      
      <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
        {/* Browser Window */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="w-3/5 aspect-[4/3] bg-slate-900/90 border border-blue-500/30 rounded-xl shadow-2xl overflow-hidden"
        >
          {/* Browser Header */}
          <div className="h-6 bg-slate-800 flex items-center px-3 gap-1.5">
            <div className="w-2 h-2 rounded-full bg-rose-500" />
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          
          {/* Browser Content */}
          <div className="p-3 flex flex-col gap-2 h-full">
            {/* Hero Bar */}
            <div className="h-8 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg" />
            
            {/* Content Lines */}
            <div className="flex flex-col gap-1.5 mt-1">
              <div className="h-2 bg-slate-700 rounded w-3/4" />
              <div className="h-2 bg-slate-700 rounded w-1/2" />
            </div>
            
            {/* CTA Button */}
            <div className="mt-auto mb-4 mx-auto w-16 h-5 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full" />
          </div>
        </motion.div>

        {/* Floating Cards */}
        <motion.div
          animate={{ y: [0, -10, 0], x: [0, 3, 0] }}
          transition={{ repeat: Infinity, duration: 3, delay: 0.2 }}
          className="absolute top-2 right-6 w-16 h-12 bg-slate-800/80 border border-blue-400/30 rounded-lg shadow-lg"
        />
        <motion.div
          animate={{ y: [0, 8, 0], x: [0, -3, 0] }}
          transition={{ repeat: Infinity, duration: 3.5, delay: 0.4 }}
          className="absolute bottom-4 left-6 w-14 h-10 bg-slate-800/80 border border-cyan-400/30 rounded-lg shadow-lg"
        />
      </div>
    </div>
  )
}

// Product 2: E-Commerce Website
export function IllustrationEcommerce() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#1a0a2e] to-[#2d1b4e]">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/3 w-28 h-28 bg-purple-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/3 w-28 h-28 bg-fuchsia-500/15 rounded-full blur-3xl" />
      
      <div className="relative z-10 w-full h-full flex items-center justify-center p-3">
        {/* Main Cart Container */}
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
          className="w-3/5 aspect-square bg-[#1a1035]/90 border border-purple-500/30 rounded-xl shadow-xl p-3 flex flex-col justify-between"
        >
          {/* Header */}
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <div className="w-2 h-2 rounded-full bg-fuchsia-500" />
            <div className="w-2 h-2 rounded-full bg-pink-500" />
          </div>
          
          {/* Items */}
          <div className="grid grid-cols-2 gap-2 my-auto">
            <div className="bg-[#251545] p-2 rounded-lg border border-purple-500/20">
              <div className="w-4 h-4 rounded bg-gradient-to-tr from-purple-500 to-indigo-500" />
              <div className="mt-1 h-1.5 bg-purple-300/30 rounded w-3/4" />
            </div>
            <div className="bg-[#251545] p-2 rounded-lg border border-purple-500/20">
              <div className="w-4 h-4 rounded bg-gradient-to-tr from-fuchsia-500 to-purple-500" />
              <div className="mt-1 h-1.5 bg-purple-300/30 rounded w-2/3" />
            </div>
          </div>
          
          {/* Checkout Bar */}
          <div className="h-5 bg-gradient-to-r from-purple-600 to-fuchsia-500 rounded-lg" />
        </motion.div>

        {/* Floating Product Card */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="absolute top-1 right-4 w-1/4 bg-[#251545]/90 border border-fuchsia-500/30 rounded-lg p-2"
        >
          <div className="aspect-video rounded bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-500" />
          <div className="mt-1 h-1.5 bg-purple-200/30 rounded w-3/4" />
        </motion.div>

        {/* Credit Card */}
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 3.2, delay: 0.3 }}
          className="absolute bottom-2 left-2 w-1/3 aspect-[1.6] bg-gradient-to-br from-[#3d2a5e] to-[#1a0f2e] border border-fuchsia-400/20 rounded-lg p-2"
        >
          <div className="w-4 h-3 bg-amber-400/30 rounded-sm" />
          <div className="mt-auto h-2 bg-glass-deep/20 rounded w-full" />
        </motion.div>
      </div>
    </div>
  )
}

// Product 3: Corporate Website
export function IllustrationCorporateWebsite() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#0c141c] to-[#1a2d3d]">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-sky-500/15 rounded-full blur-3xl" />
      
      <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
        {/* Building */}
        <motion.div
          animate={{ height: ['55%', '65%', '55%'] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="relative w-20 bg-gradient-to-b from-slate-600 to-slate-800 rounded-t-xl border border-slate-500/50"
        >
          {/* Windows */}
          <div className="absolute inset-2 grid grid-cols-2 gap-2 content-start pt-3">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
                className="w-4 h-4 bg-sky-400/40 rounded"
              />
            ))}
          </div>
        </motion.div>

        {/* Floating Documents */}
        <motion.div
          animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 3.5 }}
          className="absolute top-4 right-6 w-14 h-18 bg-slate-700/80 border border-slate-500/40 rounded-lg shadow-lg"
        />
        <motion.div
          animate={{ y: [0, 6, 0], rotate: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 4, delay: 0.5 }}
          className="absolute bottom-8 left-6 w-12 h-16 bg-slate-700/80 border border-slate-500/40 rounded-lg shadow-lg"
        />

        {/* Globe */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="absolute -z-10 w-32 h-32 rounded-full border-2 border-sky-500/20"
        />
      </div>
    </div>
  )
}

// Product 4: Portfolio Website
export function IllustrationPortfolioWebsite() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#1a1a2e] to-[#2d2d44]">
      {/* Background Glow */}
      <div className="absolute top-1/4 right-1/4 w-28 h-28 bg-indigo-500/15 rounded-full blur-3xl" />
      
      <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
        {/* Gallery Frame */}
        <motion.div
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ repeat: Infinity, duration: 4 }}
          className="relative w-3/5 aspect-square border-2 border-dashed border-indigo-400/30 rounded-2xl p-3"
        >
          {/* Image Grid */}
          <div className="grid grid-cols-2 gap-2 h-full">
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0 }}
              className="bg-gradient-to-br from-indigo-500/40 to-purple-500/40 rounded-lg"
            />
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0.3 }}
              className="bg-gradient-to-br from-purple-500/40 to-pink-500/40 rounded-lg"
            />
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0.6 }}
              className="bg-gradient-to-br from-pink-500/40 to-rose-500/40 rounded-lg"
            />
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0.9 }}
              className="bg-gradient-to-br from-rose-500/40 to-indigo-500/40 rounded-lg"
            />
          </div>
        </motion.div>

        {/* Floating Photos */}
        <motion.div
          animate={{ y: [0, -8, 0], x: [0, 4, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="absolute -top-1 -right-2 w-12 h-10 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-lg shadow-lg rotate-6"
        />
      </div>
    </div>
  )
}

// Product 5: SaaS Dashboard
export function IllustrationSaaSDashboard() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#0f172a] to-[#1e293b]">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/3 w-32 h-32 bg-blue-500/15 rounded-full blur-3xl" />
      
      <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
        {/* Dashboard Container */}
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 3.5 }}
          className="w-3/5 aspect-square bg-slate-900/80 border border-blue-500/20 rounded-xl p-3 flex flex-col gap-2"
        >
          {/* Header */}
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <div className="w-2 h-2 rounded-full bg-green-500" />
          </div>
          
          {/* Chart Bars */}
          <div className="flex items-end gap-1.5 h-16 mt-2 px-2">
            {[40, 70, 50, 85, 60, 90, 45].map((h, i) => (
              <motion.div
                key={i}
                animate={{ height: [`${h}%`, `${h + 15}%`, `${h}%`] }}
                transition={{ repeat: Infinity, duration: 2, delay: i * 0.1 }}
                className="flex-1 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-sm"
              />
            ))}
          </div>
          
          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-2 mt-auto">
            <div className="bg-slate-800/50 rounded-lg p-2">
              <div className="h-2 bg-slate-600 rounded w-3/4" />
              <div className="mt-1 h-4 bg-gradient-to-r from-blue-400 to-cyan-400 rounded" />
            </div>
            <div className="bg-slate-800/50 rounded-lg p-2">
              <div className="h-2 bg-slate-600 rounded w-2/3" />
              <div className="mt-1 h-4 bg-gradient-to-r from-cyan-400 to-blue-400 rounded" />
            </div>
          </div>
        </motion.div>

        {/* Floating Stat Cards */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 3, delay: 0.2 }}
          className="absolute top-3 right-4 w-14 h-10 bg-slate-800/80 border border-blue-400/30 rounded-lg"
        />
      </div>
    </div>
  )
}

// ==========================================
// MOBILE APPS CATEGORY - Emerald Gradient Theme
// ==========================================

// Product 6: iOS & Android App
export function IllustrationiOSAndroidApp() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#064e3b] to-[#065f46]">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/4 w-28 h-28 bg-emerald-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-1/4 w-28 h-28 bg-lime-500/15 rounded-full blur-3xl" />
      
      <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
        {/* Phone 1 - iOS */}
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 3.5 }}
          className="absolute left-4 w-16 h-28 bg-slate-800 border-2 border-emerald-500/30 rounded-2xl p-1.5 shadow-xl"
        >
          <div className="w-full h-full bg-gradient-to-b from-emerald-500/20 to-lime-500/20 rounded-xl flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-emerald-400/30" />
          </div>
          {/* Notch */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-6 h-1 bg-slate-700 rounded-full" />
        </motion.div>

        {/* Phone 2 - Android */}
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 3.5, delay: 0.5 }}
          className="absolute right-4 w-16 h-28 bg-slate-800 border-2 border-lime-500/30 rounded-2xl p-1.5 shadow-xl"
        >
          <div className="w-full h-full bg-gradient-to-b from-lime-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-lime-400/30" />
          </div>
          {/* Punch hole */}
          <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-slate-700 rounded-full" />
        </motion.div>

        {/* Connection Line */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <motion.path
            d="M 70,80 Q 100,60 130,80"
            stroke="url(#emeraldGrad)"
            strokeWidth="2"
            strokeDasharray="4 2"
            fill="none"
            animate={{ strokeDashoffset: [0, -12] }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          />
          <defs>
            <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#84cc16" stopOpacity="0.5" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  )
}

// Product 7: MVP App Prototype
export function IllustrationMVPAppPrototype() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#14532d] to-[#166534]">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/3 w-32 h-32 bg-lime-500/20 rounded-full blur-3xl" />
      
      <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
        {/* Wireframe Screens Behind */}
        <motion.div
          animate={{ x: [-5, 5, -5], y: [5, -5, 5], opacity: [0.3, 0.5, 0.3] }}
          transition={{ repeat: Infinity, duration: 4 }}
          className="absolute w-16 h-24 bg-slate-700/30 border border-slate-600/30 rounded-lg rotate-[-8deg]"
        />
        <motion.div
          animate={{ x: [5, -5, 5], y: [-5, 5, -5], opacity: [0.3, 0.5, 0.3] }}
          transition={{ repeat: Infinity, duration: 4, delay: 0.5 }}
          className="absolute w-16 h-24 bg-slate-700/30 border border-slate-600/30 rounded-lg rotate-[8deg]"
        />

        {/* Rocket */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
          className="relative z-20"
        >
          {/* Rocket Body */}
          <div className="w-10 h-16 bg-gradient-to-b from-lime-400 to-emerald-500 rounded-t-full rounded-b-lg relative">
            {/* Window */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-800 rounded-full border-2 border-lime-300" />
          </div>
          {/* Fins */}
          <div className="absolute bottom-0 -left-2 w-3 h-6 bg-emerald-600 rounded-l-lg" />
          <div className="absolute bottom-0 -right-2 w-3 h-6 bg-emerald-600 rounded-r-lg" />
          
          {/* Flame */}
          <motion.div
            animate={{ scaleY: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ repeat: Infinity, duration: 0.3 }}
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-4 h-6 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-b-full"
          />
        </motion.div>

        {/* Particles */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              y: [0, 30], 
              x: [0, (i - 2) * 10],
              opacity: [1, 0]
            }}
            transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
            className="absolute bottom-8 left-1/2 w-1 h-1 bg-lime-400 rounded-full"
          />
        ))}
      </div>
    </div>
  )
}

// Product 8: Food Delivery App
export function IllustrationFoodDeliveryApp() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#7c2d12] to-[#9a3412]">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/3 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl" />
      
      <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
        {/* Map Pin */}
        <motion.div
          animate={{ y: [0, -6, 0], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute top-4 right-6"
        >
          <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[16px] border-t-orange-400" />
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-orange-400 rounded-full" />
        </motion.div>

        {/* Scooter */}
        <motion.div
          animate={{ x: [0, 3, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="relative"
        >
          {/* Wheels */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="absolute bottom-0 left-0 w-6 h-6 border-3 border-orange-300 rounded-full"
          />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="absolute bottom-0 right-0 w-6 h-6 border-3 border-orange-300 rounded-full"
          />
          
          {/* Body */}
          <div className="w-20 h-12 bg-gradient-to-r from-orange-400 to-amber-500 rounded-lg relative">
            {/* Delivery Box */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-6 bg-slate-700 rounded-lg border-2 border-orange-300" />
          </div>
        </motion.div>

        {/* Floating Food */}
        <motion.div
          animate={{ y: [0, -5, 0], rotate: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
          className="absolute top-8 left-6 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full"
        />
        <motion.div
          animate={{ y: [0, 5, 0], rotate: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3, delay: 0.5 }}
          className="absolute bottom-10 right-4 w-6 h-8 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-lg"
        />
      </div>
    </div>
  )
}

// ==========================================
// DEVOPS CATEGORY - Purple Gradient Theme
// ==========================================

// Product 9: CI/CD Pipeline
export function IllustrationCICDPipeline() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#2e1065] to-[#4c1d95]">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-violet-500/20 rounded-full blur-3xl" />
      
      <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
        {/* Pipeline Tube */}
        <div className="relative w-4/5 h-8 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-purple-600 rounded-full">
          {/* Moving Dots */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ x: [0, 120] }}
              transition={{ repeat: Infinity, duration: 2, delay: i * 0.6, ease: "linear" }}
              className="absolute top-1/2 -translate-y-1/2 left-2 w-3 h-3 bg-glass-deep rounded-full shadow-lg"
            />
          ))}
        </div>

        {/* Nodes */}
        <div className="absolute top-1/2 -translate-y-1/2 left-6 w-10 h-10 bg-slate-800 border-2 border-violet-400 rounded-full flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            className="w-5 h-5 border-2 border-t-violet-400 border-r-transparent border-b-violet-400 border-l-transparent rounded-full"
          />
        </div>
        <div className="absolute top-1/2 -translate-y-1/2 right-6 w-10 h-10 bg-slate-800 border-2 border-fuchsia-400 rounded-full flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-4 h-4 bg-fuchsia-400 rounded-sm"
          />
        </div>

        {/* Gear */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
          className="absolute bottom-6 left-8 w-12 h-12"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-violet-400">
            <circle cx="12" cy="12" r="3" fill="currentColor" />
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </motion.div>
      </div>
    </div>
  )
}

// Product 10: Cloud Infrastructure
export function IllustrationCloudInfrastructure() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#1e1b4b] to-[#312e81]">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/3 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl" />
      
      <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
        {/* Cloud */}
        <motion.div
          animate={{ x: [-5, 5, -5] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="absolute top-6 flex"
        >
          <div className="w-10 h-10 bg-indigo-400/40 rounded-full" />
          <div className="w-12 h-12 bg-indigo-400/50 rounded-full -ml-4" />
          <div className="w-10 h-10 bg-indigo-400/40 rounded-full -ml-4" />
        </motion.div>

        {/* Server Racks */}
        <div className="flex gap-2 mt-8">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
              className="w-8 h-20 bg-slate-800 border border-indigo-500/30 rounded-lg p-1"
            >
              {/* Server Lights */}
              {[...Array(4)].map((_, j) => (
                <motion.div
                  key={j}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1, delay: j * 0.2 + i * 0.3 }}
                  className="w-full h-2 bg-gradient-to-r from-indigo-400 to-cyan-400 rounded mb-1"
                />
              ))}
            </motion.div>
          ))}
        </div>

        {/* Shield */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-6 right-6 w-10 h-12 bg-gradient-to-b from-cyan-400 to-indigo-500 rounded-t-full rounded-b-lg flex items-center justify-center"
        >
          <div className="w-4 h-4 border-2 border-white rounded-full" />
        </motion.div>
      </div>
    </div>
  )
}

// Product 11: Docker & Kubernetes
export function IllustrationDockerKubernetes() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#1e3a8a] to-[#3b82f6]">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl" />
      
      <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
        {/* Container Boxes */}
        <div className="relative">
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-12 h-8 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-lg mb-1"
          />
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 2, delay: 0.3 }}
            className="w-12 h-8 bg-gradient-to-r from-cyan-400 to-teal-400 rounded-lg mb-1 ml-2"
          />
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 2, delay: 0.6 }}
            className="w-12 h-8 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-lg ml-4"
          />
        </div>

        {/* Whale */}
        <motion.div
          animate={{ x: [-10, 10, -10] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
          className="absolute top-4 right-4"
        >
          <svg viewBox="0 0 48 32" className="w-16 h-10 text-blue-300">
            <path fill="currentColor" d="M44 16c0-8-6-12-12-12-4 0-8 2-10 5-2-1-4-1-6 0-6 1-10 6-10 12s4 11 10 12c2 1 4 1 6 0 2 3 6 5 10 5 6 0 12-4 12-12z" />
            <circle cx="36" cy="14" r="2" fill="#1e3a8a" />
          </svg>
        </motion.div>

        {/* Pods */}
        <div className="absolute bottom-6 left-6 flex flex-col gap-1">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
              className="w-3 h-3 bg-cyan-400 rounded-full"
            />
          ))}
        </div>

        {/* Ship Wheel */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
          className="absolute bottom-6 right-6 w-10 h-10"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full text-blue-300">
            <circle cx="12" cy="12" r="3" strokeWidth="2" />
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </motion.div>
      </div>
    </div>
  )
}

// ==========================================
// UI/UX DESIGN CATEGORY - Rose/Pink Gradient Theme
// ==========================================

// Product 12: Brand Identity Design
export function IllustrationBrandIdentityDesign() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#831843] to-[#be185d]">
      {/* Background Glow */}
      <div className="absolute top-1/4 right-1/4 w-28 h-28 bg-pink-500/20 rounded-full blur-3xl" />
      
      <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
        {/* Color Palette */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-1">
          {['#f43f5e', '#fb7185', '#f472b6', '#ec4899'].map((color, i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
              className="w-4 h-8 rounded"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        {/* Logo Mark */}
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
          className="relative w-16 h-16"
        >
          <div className="absolute inset-0 border-4 border-pink-400 rounded-full" />
          <div className="absolute inset-2 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-glass-deep rounded-full" />
        </motion.div>

        {/* Typography Lines */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
          <motion.div
            animate={{ width: ['60%', '100%', '60%'] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="h-2 bg-pink-300 rounded w-16"
          />
          <motion.div
            animate={{ width: ['40%', '80%', '40%'] }}
            transition={{ repeat: Infinity, duration: 2, delay: 0.3 }}
            className="h-2 bg-pink-300 rounded w-12"
          />
          <motion.div
            animate={{ width: ['70%', '90%', '70%'] }}
            transition={{ repeat: Infinity, duration: 2, delay: 0.6 }}
            className="h-2 bg-pink-300 rounded w-14"
          />
        </div>

        {/* Swatches */}
        <motion.div
          animate={{ rotate: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="absolute bottom-6 left-8 w-10 h-10 bg-rose-500 rounded-lg -rotate-6"
        />
        <motion.div
          animate={{ rotate: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3, delay: 0.5 }}
          className="absolute bottom-8 left-12 w-10 h-10 bg-pink-500 rounded-lg rotate-6"
        />
      </div>
    </div>
  )
}

// Product 13: UI/UX Audit
export function IllustrationUIUXAudit() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#701a75] to-[#a21caf]">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/3 w-32 h-32 bg-fuchsia-500/20 rounded-full blur-3xl" />
      
      <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
        {/* UI Interface Under Magnifying Glass */}
        <div className="relative">
          <div className="w-24 h-16 bg-slate-800 border border-fuchsia-500/30 rounded-lg p-2">
            <div className="h-2 bg-fuchsia-400/30 rounded w-3/4 mb-1" />
            <div className="h-2 bg-fuchsia-400/20 rounded w-1/2" />
            <div className="mt-2 flex gap-1">
              <div className="w-6 h-4 bg-fuchsia-500/30 rounded" />
              <div className="w-6 h-4 bg-fuchsia-500/20 rounded" />
            </div>
          </div>

          {/* Magnifying Glass */}
          <motion.div
            animate={{ x: [-5, 15, -5], y: [-5, 5, -5] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute -top-4 -left-4"
          >
            <div className="w-16 h-16 border-4 border-pink-400 rounded-full bg-pink-400/10" />
            <div className="absolute -bottom-1 -right-3 w-6 h-2 bg-pink-400 rotate-45 rounded-full" />
          </motion.div>
        </div>

        {/* Checklist */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0, 1, 1], scale: [0.5, 1, 1] }}
              transition={{ repeat: Infinity, duration: 2, delay: i * 0.5 }}
              className="flex items-center gap-2"
            >
              <div className="w-5 h-5 bg-gradient-to-br from-pink-400 to-fuchsia-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="w-8 h-2 bg-fuchsia-300/40 rounded" />
            </motion.div>
          ))}
        </div>

        {/* Score Gauge */}
        <motion.div
          animate={{ rotate: [-45, 45, -45] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="absolute bottom-6 left-6 w-12 h-12"
        >
          <div className="w-full h-full rounded-full border-4 border-t-pink-400 border-r-pink-400 border-b-transparent border-l-transparent rotate-45" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-glass-deep rounded-full" />
        </motion.div>
      </div>
    </div>
  )
}

// Product 14: Mobile App UI Kit
export function IllustrationMobileAppUIKit() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#881337] to-[#be123c]">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/3 w-28 h-28 bg-rose-500/20 rounded-full blur-3xl" />
      
      <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
        {/* Central Phone */}
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="relative w-16 h-26 bg-slate-900 border-2 border-rose-400/40 rounded-2xl p-1.5 shadow-xl"
        >
          <div className="w-full h-full bg-gradient-to-b from-rose-500/20 to-pink-500/20 rounded-xl" />
          {/* Notch */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-5 h-1 bg-slate-700 rounded-full" />
        </motion.div>

        {/* Floating Components */}
        <motion.div
          animate={{ y: [0, -6, 0], x: [0, 3, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, delay: 0.2 }}
          className="absolute top-6 right-6 w-10 h-5 bg-rose-500 rounded-lg shadow-lg"
        />
        <motion.div
          animate={{ y: [0, 5, 0], x: [0, -3, 0] }}
          transition={{ repeat: Infinity, duration: 2.8, delay: 0.4 }}
          className="absolute bottom-10 left-6 w-10 h-6 bg-slate-800 border border-rose-400/30 rounded-lg shadow-lg"
        >
          <div className="w-6 h-1 bg-rose-400/40 rounded m-1" />
          <div className="w-4 h-1 bg-rose-400/20 rounded m-1" />
        </motion.div>
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, delay: 0.6 }}
          className="absolute bottom-6 right-8 w-8 h-8 bg-rose-400/20 border-2 border-rose-400 rounded-full flex items-center justify-center shadow-lg"
        >
          <div className="w-3 h-3 bg-rose-400 rounded-sm" />
        </motion.div>

        {/* Toggle */}
        <motion.div
          animate={{ x: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }}
          className="absolute top-8 left-6 w-10 h-5 bg-slate-700 rounded-full p-1"
        >
          <div className="w-3 h-3 bg-rose-400 rounded-full" />
        </motion.div>
      </div>
    </div>
  )
}

// ==========================================
// AI & ML CATEGORY - Cyan/Indigo Gradient Theme
// ==========================================

// Product 15: AI Chatbot Integration
export function IllustrationAIChatbotIntegration() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#0c4a6e] to-[#075985]">
      {/* Background Glow */}
      <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-sky-500/20 rounded-full blur-3xl" />
      
      <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
        {/* Chat Bubble */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="relative w-20 h-16 bg-gradient-to-br from-sky-400 to-cyan-400 rounded-2xl rounded-bl-none p-3 shadow-xl"
        >
          {/* Neural Network Inside */}
          <div className="relative w-full h-full">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
                className="absolute w-2 h-2 bg-glass-deep rounded-full"
                style={{ top: `${20 + i * 15}%`, left: `${15 + (i % 2) * 60}%` }}
              />
            ))}
            <svg className="absolute inset-0 w-full h-full">
              <motion.path
                d="M 6,8 L 26,16 M 6,24 L 26,16"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="1"
                animate={{ pathLength: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            </svg>
          </div>
        </motion.div>

        {/* Robot Head */}
        <motion.div
          animate={{ y: [0, 4, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, delay: 0.5 }}
          className="absolute bottom-8 left-6 w-12 h-12 bg-slate-800 border-2 border-sky-400 rounded-xl flex flex-col items-center justify-center"
        >
          {/* Eyes */}
          <div className="flex gap-2">
            <motion.div
              animate={{ scaleY: [1, 0.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-2.5 h-2.5 bg-cyan-400 rounded-full"
            />
            <motion.div
              animate={{ scaleY: [1, 0.1, 1] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0.1 }}
              className="w-2.5 h-2.5 bg-cyan-400 rounded-full"
            />
          </div>
          {/* Antenna */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-sky-400" />
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
        </motion.div>

        {/* Message Dots */}
        <div className="absolute top-6 right-6 flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
              className="w-2 h-2 bg-sky-400 rounded-full"
            />
          ))}
        </div>

        {/* Sparkles */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 2, delay: i * 0.5 }}
            className="absolute w-2 h-2"
            style={{
              top: `${20 + i * 25}%`,
              right: `${10 + i * 15}%`
            }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-cyan-300">
              <path d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10Z" />
            </svg>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Product 16: ML Data Pipeline
export function IllustrationMLDataPipeline() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#1e1b4b] to-[#312e81]">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl" />
      
      <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
        {/* Database Cylinder */}
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute left-4 w-10 h-14 bg-gradient-to-b from-slate-700 to-slate-800 rounded-lg border border-indigo-400/30"
        >
          <div className="w-full h-3 bg-indigo-400/20 rounded-t-lg" />
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ repeat: Infinity, duration: 1, delay: i * 0.3 }}
              className="mt-1 mx-1 h-2 bg-indigo-400/30 rounded"
            />
          ))}
        </motion.div>

        {/* Pipeline */}
        <div className="w-16 h-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mx-2">
          <motion.div
            animate={{ x: [0, 48] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="w-3 h-full bg-glass-deep/50 rounded-full"
          />
        </div>

        {/* Gears */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
          className="w-10 h-10"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-cyan-400">
            <circle cx="12" cy="12" r="3" fill="currentColor" />
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </motion.div>

        {/* ML Model Box */}
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
          className="mx-2 w-12 h-12 bg-slate-800 border-2 border-cyan-400/40 rounded-lg flex items-center justify-center"
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="3" strokeWidth="2" />
            <path d="M12 4v2M12 18v2M4 12h2M18 12h2" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </motion.div>

        {/* Output Chart */}
        <div className="absolute right-4 flex items-end gap-1 h-12">
          {[40, 70, 50, 85, 60].map((h, i) => (
            <motion.div
              key={i}
              animate={{ height: [`${h}%`, `${h + 20}%`, `${h}%`] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.1 }}
              className="w-2 bg-gradient-to-t from-cyan-400 to-indigo-400 rounded-t"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ==========================================
// SEO & MARKETING CATEGORY - Amber/Orange Gradient Theme
// ==========================================

// Product 17: SEO Optimization Package
export function IllustrationSEOOptimizationPackage() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#7c2d12] to-[#c2410c]">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/3 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl" />
      
      <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
        {/* Magnifying Glass */}
        <motion.div
          animate={{ x: [-8, 8, -8], y: [-4, 4, -4] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="relative"
        >
          <div className="w-16 h-16 border-4 border-amber-400 rounded-full bg-amber-400/10" />
          <div className="absolute -bottom-2 -right-4 w-6 h-2 bg-amber-400 rotate-45 rounded-full" />
        </motion.div>

        {/* Upward Graph */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2">
          <svg viewBox="0 0 60 40" className="w-20 h-12">
            <motion.path
              d="M 5,35 L 20,25 L 35,15 L 50,5"
              stroke="url(#orangeGrad)"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              animate={{ pathLength: [0, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
            <motion.polygon
              points="45,0 50,5 55,5 50,10"
              fill="#f97316"
              animate={{ y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 1 }}
            />
            <defs>
              <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#f97316" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Search Results Lines */}
        <div className="absolute left-6 bottom-10 flex flex-col gap-1.5">
          <motion.div
            animate={{ width: ['80%', '100%', '80%'], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="h-2 bg-amber-300/50 rounded w-16"
          />
          <motion.div
            animate={{ width: ['60%', '85%', '60%'], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2, delay: 0.3 }}
            className="h-2 bg-amber-300/40 rounded w-12"
          />
          <motion.div
            animate={{ width: ['70%', '90%', '70%'], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2, delay: 0.6 }}
            className="h-2 bg-amber-300/30 rounded w-14"
          />
        </div>

        {/* Target */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-6 right-6 w-10 h-10"
        >
          <div className="absolute inset-0 border-2 border-orange-400 rounded-full" />
          <div className="absolute inset-2 border-2 border-amber-400 rounded-full" />
          <div className="absolute inset-4 bg-orange-400 rounded-full" />
          <motion.div
            animate={{ x: [-2, 2, -2], y: [-2, 2, -2] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"
          />
        </motion.div>
      </div>
    </div>
  )
}

// Product 18: Social Media Strategy
export function IllustrationSocialMediaStrategy() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#9a3412] to-[#ea580c]">
      {/* Background Glow */}
      <div className="absolute bottom-1/4 right-1/4 w-28 h-28 bg-amber-500/20 rounded-full blur-3xl" />
      
      <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
        {/* Social Icons */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
          {['#f43f5e', '#3b82f6', '#10b981', '#f59e0b'].map((color, i) => (
            <motion.div
              key={i}
              animate={{ x: [0, 4, 0], scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2, delay: i * 0.2 }}
              className="w-7 h-7 rounded-lg shadow-lg"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        {/* Content Calendar */}
        <div className="grid grid-cols-3 gap-1">
          {[...Array(9)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ 
                backgroundColor: ['rgba(251,191,36,0.2)', 'rgba(251,191,36,0.5)', 'rgba(251,191,36,0.2)']
              }}
              transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.1 }}
              className="w-6 h-6 bg-amber-400/20 rounded"
            />
          ))}
        </div>

        {/* Floating Hearts */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              y: [0, -20], 
              x: [(i - 2) * 5, (i - 2) * 8],
              opacity: [1, 0],
              scale: [1, 0.5]
            }}
            transition={{ repeat: Infinity, duration: 2, delay: i * 0.4 }}
            className="absolute bottom-8"
            style={{ left: `${30 + i * 10}%` }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-rose-400">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </motion.div>
        ))}

        {/* Engagement Graph */}
        <div className="absolute right-4 bottom-10 flex items-end gap-1">
          {[30, 50, 40, 70, 55, 85].map((h, i) => (
            <motion.div
              key={i}
              animate={{ height: [`${h}%`, `${h + 15}%`, `${h}%`] }}
              transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.1 }}
              className="w-2 bg-gradient-to-t from-amber-400 to-orange-400 rounded-t"
            />
          ))}
        </div>

        {/* Share Arrow */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], x: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute top-6 right-6"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-8 h-8 text-amber-300">
            <path strokeLinecap="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </motion.div>
      </div>
    </div>
  )
}

// ==========================================
// 15 NEW LOW-PRICED PRODUCT ILLUSTRATIONS
// ==========================================

// Product 19: Mini Landing Page
export function IllustrationMiniLandingPage() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#1e40af] to-[#3b82f6]">
      <motion.div
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ repeat: Infinity, duration: 3 }}
        className="absolute top-4 left-4 w-16 h-16 bg-blue-300/20 rounded-full blur-xl"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-full max-w-[100px]"
        >
          <svg viewBox="0 0 120 80" fill="none" className="w-full drop-shadow-lg">
            <rect x="10" y="10" width="100" height="60" rx="4" fill="rgba(255,255,255,0.9)" />
            <rect x="20" y="20" width="40" height="6" rx="1" fill="#3b82f6" />
            <rect x="20" y="30" width="80" height="3" rx="1" fill="#94a3b8" />
            <rect x="20" y="36" width="60" height="3" rx="1" fill="#94a3b8" />
            <rect x="20" y="45" width="30" height="12" rx="2" fill="#60a5fa" />
          </svg>
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute bottom-3 right-3"
        >
          <span className="text-2xl"></span>
        </motion.div>
      </div>
    </div>
  )
}

// Product 20: Starter Business Site
export function IllustrationStarterBusinessSite() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#0f766e] to-[#14b8a6]">
      <motion.div
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ repeat: Infinity, duration: 4 }}
        className="absolute top-6 right-6 w-20 h-20 bg-teal-300/20 rounded-full blur-xl"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ x: [0, 3, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="relative"
        >
          <svg viewBox="0 0 140 100" fill="none" className="w-[130px] drop-shadow-xl">
            <rect x="10" y="20" width="35" height="60" rx="3" fill="rgba(255,255,255,0.95)" />
            <rect x="52" y="20" width="35" height="60" rx="3" fill="rgba(255,255,255,0.9)" />
            <rect x="94" y="20" width="35" height="60" rx="3" fill="rgba(255,255,255,0.85)" />
            <rect x="18" y="30" width="20" height="4" rx="1" fill="#14b8a6" />
            <rect x="60" y="30" width="20" height="4" rx="1" fill="#0d9488" />
            <rect x="102" y="30" width="20" height="4" rx="1" fill="#0f766e" />
          </svg>
        </motion.div>
      </div>
      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute top-2 left-2"
      >
        <span className="text-xl"></span>
      </motion.div>
    </div>
  )
}

// Product 21: Link in Bio Page
export function IllustrationLinkInBioPage() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#be185d] to-[#ec4899]">
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute -bottom-4 -right-4 w-24 h-24 bg-pink-400/30 rounded-full blur-xl"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-12 h-12 rounded-full bg-glass-deep/90 flex items-center justify-center mb-2 shadow-lg"
        >
          <span className="text-2xl"></span>
        </motion.div>
        <motion.div
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 1, delay: 0 }}
          className="w-24 h-6 bg-glass-deep/80 rounded-lg mb-1"
        />
        <motion.div
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
          className="w-20 h-5 bg-glass-deep/70 rounded-lg mb-1"
        />
        <motion.div
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
          className="w-22 h-5 bg-glass-deep/60 rounded-lg"
        />
      </div>
    </div>
  )
}

// Product 22: Simple To-Do App
export function IllustrationSimpleTodoApp() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#047857] to-[#10b981]">
      <motion.div
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ repeat: Infinity, duration: 3 }}
        className="absolute top-3 left-3 w-16 h-16 bg-emerald-300/30 rounded-full blur-xl"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <motion.div
            animate={{ y: [0, -2, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, delay: 0 }}
            className="flex items-center gap-2 mb-1"
          >
            <div className="w-5 h-5 rounded bg-glass-deep/90 flex items-center justify-center"></div>
            <div className="w-16 h-3 bg-glass-deep/70 rounded" />
          </motion.div>
          <motion.div
            animate={{ y: [0, -2, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
            className="flex items-center gap-2 mb-1"
          >
            <div className="w-5 h-5 rounded border-2 border-white/50" />
            <div className="w-20 h-3 bg-glass-deep/60 rounded" />
          </motion.div>
          <motion.div
            animate={{ y: [0, -2, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
            className="flex items-center gap-2"
          >
            <div className="w-5 h-5 rounded border-2 border-white/50" />
            <div className="w-14 h-3 bg-glass-deep/50 rounded" />
          </motion.div>
        </div>
      </div>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
        className="absolute bottom-2 right-2 text-2xl"
      >
        
      </motion.div>
    </div>
  )
}

// Product 23: Basic Calculator App
export function IllustrationBasicCalculatorApp() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#374151] to-[#6b7280]">
      <motion.div
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ repeat: Infinity, duration: 3 }}
        className="absolute top-4 right-4 w-20 h-20 bg-gray-400/30 rounded-full blur-xl"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-gray-800/90 rounded-lg p-2 shadow-2xl">
          <div className="w-20 h-6 bg-gray-700 rounded mb-2 flex items-center justify-end px-2">
            <motion.span
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="text-white text-sm font-mono"
            >
              42
            </motion.span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {[1,2,3,4,5,6,7,8,9].map((n, i) => (
              <motion.div
                key={n}
                animate={{ scale: [1, 0.95, 1] }}
                transition={{ repeat: Infinity, duration: 2, delay: i * 0.1 }}
                className="w-6 h-6 bg-gray-600 rounded flex items-center justify-center text-white text-xs"
              >
                {n}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Product 24: Expense Tracker Lite
export function IllustrationExpenseTrackerLite() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#059669] to-[#34d399]">
      <motion.div
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ repeat: Infinity, duration: 4 }}
        className="absolute -top-4 -right-4 w-24 h-24 bg-emerald-300/30 rounded-full blur-xl"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-4xl mb-2"
        >
          
        </motion.div>
        <svg viewBox="0 0 100 40" className="w-full max-w-[100px]">
          <motion.path
            d="M10 30 L30 25 L50 15 L70 20 L90 10"
            stroke="rgba(255,255,255,0.8)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
          <motion.circle
            cx="90"
            cy="10"
            r="4"
            fill="white"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
          />
        </svg>
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="mt-2 px-3 py-1 bg-glass-deep/20 rounded-full text-white text-xs font-bold"
        >
          $1,234
        </motion.div>
      </div>
    </div>
  )
}

// Product 25: Auto Backup Script
export function IllustrationAutoBackupScript() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#4c1d95] to-[#7c3aed]">
      <motion.div
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ repeat: Infinity, duration: 3 }}
        className="absolute top-2 right-2 w-16 h-16 bg-violet-300/30 rounded-full blur-xl"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <motion.div
            animate={{ y: [0, -3, 0], rotate: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <span className="text-5xl"></span>
          </motion.div>
          <motion.div
            animate={{ x: [0, 10, 0], opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-full"
          >
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-glass-deep/80 rounded" />
              <div className="w-2 h-2 bg-glass-deep/60 rounded" />
              <div className="w-1 h-1 bg-glass-deep/40 rounded" />
            </div>
          </motion.div>
        </div>
      </div>
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="absolute bottom-3 right-3"
      >
        <span className="text-2xl"></span>
      </motion.div>
    </div>
  )
}

// Product 26: Server Monitor Bot
export function IllustrationServerMonitorBot() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#1e1b4b] to-[#4338ca]">
      <motion.div
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute inset-0 bg-indigo-500/10"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-5xl"
          >
            
          </motion.div>
          <motion.div
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1, repeatDelay: 1 }}
            className="absolute -top-2 -right-2 w-3 h-3 bg-green-400 rounded-full"
          />
        </div>
      </div>
      <div className="absolute bottom-2 left-2 right-2">
        <div className="flex justify-between gap-1">
          {[40, 70, 55, 85, 60].map((h, i) => (
            <motion.div
              key={i}
              animate={{ height: [h * 0.5, h, h * 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
              className="flex-1 bg-glass-deep/40 rounded-t"
              style={{ height: h * 0.3 }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// Product 27: Icon Pack Starter
export function IllustrationIconPackStarter() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#be123c] to-[#fb7185]">
      <motion.div
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ repeat: Infinity, duration: 3 }}
        className="absolute top-4 left-4 w-20 h-20 bg-rose-300/30 rounded-full blur-xl"
      />
      <div className="absolute inset-0 grid grid-cols-3 gap-2 p-4 items-center justify-items-center">
        {['', '', '', '', '', '', '', '', ''].map((icon, i) => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 2, delay: i * 0.1 }}
            className="w-8 h-8 bg-glass-deep/90 rounded-lg flex items-center justify-center shadow-lg"
          >
            <span className="text-lg">{icon}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Product 28: Wireframe Kit Lite
export function IllustrationWireframeKitLite() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#9f1239] to-[#e11d48]">
      <motion.div
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ repeat: Infinity, duration: 4 }}
        className="absolute -bottom-4 -right-4 w-24 h-24 bg-rose-400/30 rounded-full blur-xl"
      />
      <div className="absolute inset-0 flex items-center justify-center p-3">
        <div className="space-y-2 w-full max-w-[110px]">
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="h-8 border-2 border-dashed border-white/50 rounded"
          />
          <div className="grid grid-cols-2 gap-2">
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
              className="h-12 border-2 border-dashed border-white/40 rounded"
            />
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
              className="h-12 border-2 border-dashed border-white/40 rounded"
            />
          </div>
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.5, delay: 0.6 }}
            className="h-6 border-2 border-dashed border-white/50 rounded"
          />
        </div>
      </div>
    </div>
  )
}

// Product 29: AI Text Summarizer
export function IllustrationAITextSummarizer() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#0c4a6e] to-[#0ea5e9]">
      <motion.div
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ repeat: Infinity, duration: 3 }}
        className="absolute top-2 left-2 w-16 h-16 bg-sky-300/30 rounded-full blur-xl"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-4xl opacity-60"
          >
            
          </motion.div>
          <motion.div
            animate={{ x: [0, -5, 0], scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
            className="absolute top-0 left-8 text-4xl"
          >
            
          </motion.div>
          <motion.div
            animate={{ y: [0, -5, 0], opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute -bottom-4 left-4 text-2xl"
          >
            
          </motion.div>
        </div>
      </div>
    </div>
  )
}

// Product 30: Smart Email Classifier
export function IllustrationSmartEmailClassifier() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#1e40af] to-[#60a5fa]">
      <motion.div
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ repeat: Infinity, duration: 3 }}
        className="absolute top-4 right-4 w-20 h-20 bg-blue-300/30 rounded-full blur-xl"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <motion.div
            animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-5xl"
          >
            
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="absolute -top-2 -right-2 bg-green-400 text-green-900 text-xs font-bold px-2 py-0.5 rounded-full"
          >
            
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0.5 }}
            className="absolute -bottom-2 -left-2 bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full"
          >
            !
          </motion.div>
        </div>
      </div>
    </div>
  )
}

// Product 31: Basic Image Recognition API
export function IllustrationBasicImageRecognitionAPI() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#1e3a8a] to-[#3b82f6]">
      <motion.div
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ repeat: Infinity, duration: 4 }}
        className="absolute -top-4 -left-4 w-24 h-24 bg-blue-400/30 rounded-full blur-xl"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-16 h-16 bg-glass-deep/90 rounded-lg flex items-center justify-center shadow-lg"
          >
            <span className="text-3xl"></span>
          </motion.div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            className="absolute -inset-2 border-2 border-dashed border-white/50 rounded-lg"
          />
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="absolute -top-4 -right-4 text-xl"
          >
            
          </motion.div>
        </div>
      </div>
    </div>
  )
}

// Product 32: Meta Tags Optimizer
export function IllustrationMetaTagsOptimizer() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#c2410c] to-[#fb923c]">
      <motion.div
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ repeat: Infinity, duration: 3 }}
        className="absolute top-3 right-3 w-16 h-16 bg-orange-300/30 rounded-full blur-xl"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-full max-w-[100px] bg-glass-deep/90 rounded-lg p-2 shadow-lg mb-2"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <motion.div
            animate={{ width: ['40%', '70%', '40%'] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="h-2 bg-orange-400 rounded"
          />
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-2xl"
        >
          
        </motion.div>
      </div>
    </div>
  )
}

// Product 33: Local SEO Booster
export function IllustrationLocalSEOBooster() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#ea580c] to-[#fdba74]">
      <motion.div
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ repeat: Infinity, duration: 3 }}
        className="absolute -bottom-4 -right-4 w-20 h-20 bg-orange-300/30 rounded-full blur-xl"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-5xl"
          >
            
          </motion.div>
          <motion.div
            animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -bottom-1 left-1/2 transform -translate-x-1/2"
          >
            <div className="w-4 h-4 bg-orange-500/50 rounded-full" />
          </motion.div>
        </div>
      </div>
      <motion.div
        animate={{ x: [0, 5, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="absolute top-2 left-2 text-xl"
      >
        
      </motion.div>
      <motion.div
        animate={{ x: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }}
        className="absolute bottom-2 right-2 text-xl"
      >
        
      </motion.div>
    </div>
  )
}

