'use client'

import { useEffect, useState } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2, ArrowLeft, ExternalLink, Mail, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Suspense } from 'react'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Already logged in
  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push('/')
    }
  }, [status, session, router])

  const handleLoginWithGrapsee = () => {
    const callbackUrl = searchParams.get('callbackUrl')
    const state = callbackUrl ? encodeURIComponent(callbackUrl) : ''
    window.location.href = `/api/auth/grapsee${state ? `?state=${state}` : ''}`
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please enter email and password')
      return
    }

    setLoading(true)
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast.error('Invalid email or password')
      } else {
        toast.success('Login successful!')
        const callbackUrl = searchParams.get('callbackUrl')
        router.push(callbackUrl || '/')
      }
    } catch (error) {
      toast.error('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Signing you in...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Back button */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-card border border-border/50 transition-all active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-base font-bold text-foreground">Sign In</h1>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 pb-12">
        {/* Logo & Heading */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-primary/10 mb-4 shadow-lg shadow-primary/10">
            <span className="text-4xl"></span>
          </div>
          <h2 className="text-2xl font-bold text-foreground">Grapsee Shop</h2>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Sign in with your Grapsee account to access your orders, wishlist, rewards and more.
          </p>
        </motion.div>

        {/* Email/Password Form */}
        <motion.form
          onSubmit={handleEmailLogin}
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder=""
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-12"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-14 text-base font-semibold bg-primary text-primary-foreground shadow-xl shadow-primary/25 rounded-2xl"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              'Sign In'
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={handleLoginWithGrapsee}
              className="text-primary font-medium hover:underline"
            >
              Create one on Grapsee
            </button>
          </p>
        </motion.form>

        {/* Divider */}
        <div className="relative my-6">
          <Separator className="absolute inset-0 flex items-center" />
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        {/* Grapsee SSO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            onClick={handleLoginWithGrapsee}
            variant="outline"
            className="w-full h-14 text-base font-semibold gap-3 rounded-2xl border-2"
            disabled={loading}
          >
            <span className="text-xl"></span>
            Login with Grapsee
            <ExternalLink className="h-4 w-4 opacity-60" />
          </Button>
        </motion.div>

        {/* Features preview */}
        <motion.div
          className="mt-10 space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {[
            { icon: '', text: 'Track your orders in real-time' },
            { icon: '', text: 'Save products to your wishlist' },
            { icon: '', text: 'Earn loyalty points & rewards' },
            { icon: '', text: 'Manage your wallet & gift cards' },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3 rounded-xl bg-card border border-border/30 px-4 py-3">
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm text-muted-foreground">{item.text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
