'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Bell,
  Moon,
  Sun,
  Shield,
  Trash2,
  Globe,
  Lock,
  Mail,
  Smartphone,
  Eye,
  User,
  MapPin,
  CreditCard,
  AlertTriangle,
  Plus,
  ChevronRight,
  Languages,
  DollarSign,
  Link2,
  Loader2,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useShopStore } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import { toast } from 'sonner'

interface Address {
  id: string
  label: string
  name: string
  phone: string
  address: string
  city: string
  area: string | null
  postalCode: string | null
  isDefault: boolean
}

const languages = [
  { code: 'en', name: 'English' },
  { code: 'bn', name: ' (Bengali)' },
  { code: 'hi', name: ' (Hindi)' },
  { code: 'ar', name: ' (Arabic)' },
]

const currencies = [
  { code: 'BDT', name: 'BDT ()', flag: '' },
  { code: 'USD', name: 'USD ($)', flag: '' },
  { code: 'EUR', name: 'EUR ()', flag: '' },
]

export function SettingsView() {
  const { clearCart, clearWishlist, clearRecentlyViewed, rewardsPoints, theme, toggleTheme } = useShopStore()
  const { goBack } = useShopRouter()
  const darkMode = theme === 'dark'

  // Notification states
  const [pushNotif, setPushNotif] = useState(true)
  const [emailNotif, setEmailNotif] = useState(true)
  const [smsNotif, setSmsNotif] = useState(false)
  const [dealsNotif, setDealsNotif] = useState(true)
  const [ordersNotif, setOrdersNotif] = useState(true)

  // Privacy states
  const [dataSharing, setDataSharing] = useState(false)
  const [marketingEmails, setMarketingEmails] = useState(true)

  // Selection states
  const [language, setLanguage] = useState('en')
  const [currency, setCurrency] = useState('USD')
  const [showLanguagePicker, setShowLanguagePicker] = useState(false)
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false)

  // Security states
  const [twoFactor, setTwoFactor] = useState(false)

  // Account fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [editingField, setEditingField] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Address states
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loadingAddresses, setLoadingAddresses] = useState(true)
  const [showAddAddress, setShowAddAddress] = useState(false)
  const [newAddress, setNewAddress] = useState({ label: 'home', name: '', phone: '', address: '', city: '', area: '', postalCode: '' })

  // Fetch addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await fetch('/api/addresses?userId=user-1')
        if (res.ok) {
          const data = await res.json()
          setAddresses(data.data || [])
        }
      } catch {
        // fallback
      } finally {
        setLoadingAddresses(false)
      }
    }
    fetchAddresses()
  }, [])

  const handleClearData = (type: string) => {
    switch (type) {
      case 'cart':
        clearCart()
        toast.success('Cart cleared')
        break
      case 'wishlist':
        clearWishlist()
        toast.success('Wishlist cleared')
        break
      case 'history':
        clearRecentlyViewed()
        toast.success('Browsing history cleared')
        break
      case 'all':
        clearCart()
        clearWishlist()
        clearRecentlyViewed()
        toast.success('All data cleared')
        break
    }
  }

  const handleSave = async () => {
    setSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    setSaving(false)
    toast.success('Settings saved successfully!', {
      description: 'Your preferences have been updated.',
    })
  }

  const handleAddAddress = async () => {
    if (!newAddress.name || !newAddress.phone || !newAddress.address || !newAddress.city) {
      toast.error('Please fill in all required fields')
      return
    }
    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user-1',
          ...newAddress,
          isDefault: addresses.length === 0,
        }),
      })
      if (res.ok) {
        const addr = await res.json()
        setAddresses((prev) => [...prev, addr])
        setShowAddAddress(false)
        setNewAddress({ label: 'home', name: '', phone: '', address: '', city: '', area: '', postalCode: '' })
        toast.success('Address added successfully')
      }
    } catch {
      toast.error('Failed to add address')
    }
  }

  const handleDeleteAccount = () => {
    toast.error('Account deletion is not available in demo mode', {
      description: 'Contact support@grapsee.shop to request account deletion.',
    })
  }

  return (
    <motion.div
      className="px-4 py-2 pb-8"
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
        <h1 className="text-lg font-bold text-foreground">Settings</h1>
      </div>

      {/* Account Settings */}
      <section className="mb-5">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Account</h2>
        <div className="space-y-2">
          {/* Name */}
          <div className="rounded-xl border border-border/50 bg-card p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <Label className="text-[10px] text-muted-foreground">Full Name</Label>
                  {editingField === 'name' ? (
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-7 text-xs bg-background"
                        autoFocus
                      />
                      <Button size="sm" className="h-7 px-2 text-xs" onClick={() => { setEditingField(null); toast.success('Name updated') }}>
                        <Check className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <button onClick={() => setEditingField('name')} className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                      {name}
                    </button>
                  )}
                </div>
              </div>
              {editingField !== 'name' && (
                <Button variant="ghost" size="sm" className="text-[10px] text-primary h-6 px-2" onClick={() => setEditingField('name')}>
                  Edit
                </Button>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="rounded-xl border border-border/50 bg-card p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Mail className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <Label className="text-[10px] text-muted-foreground">Email</Label>
                  {editingField === 'email' ? (
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-7 text-xs bg-background"
                        type="email"
                        autoFocus
                      />
                      <Button size="sm" className="h-7 px-2 text-xs" onClick={() => { setEditingField(null); toast.success('Email updated') }}>
                        <Check className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <button onClick={() => setEditingField('email')} className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                      {email}
                    </button>
                  )}
                </div>
              </div>
              {editingField !== 'email' && (
                <Button variant="ghost" size="sm" className="text-[10px] text-primary h-6 px-2" onClick={() => setEditingField('email')}>
                  Edit
                </Button>
              )}
            </div>
          </div>

          {/* Phone */}
          <div className="rounded-xl border border-border/50 bg-card p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                  <Smartphone className="h-4 w-4 text-blue-400" />
                </div>
                <div className="flex-1">
                  <Label className="text-[10px] text-muted-foreground">Phone</Label>
                  {editingField === 'phone' ? (
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="h-7 text-xs bg-background"
                        type="tel"
                        placeholder=""
                        autoFocus
                      />
                      <Button size="sm" className="h-7 px-2 text-xs" onClick={() => { setEditingField(null); toast.success('Phone updated') }}>
                        <Check className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <button onClick={() => setEditingField('phone')} className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                      {phone || 'Not set'}
                    </button>
                  )}
                </div>
              </div>
              {editingField !== 'phone' && (
                <Button variant="ghost" size="sm" className="text-[10px] text-primary h-6 px-2" onClick={() => setEditingField('phone')}>
                  Edit
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      <Separator className="my-4" />

      {/* Appearance */}
      <section className="mb-5">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Appearance</h2>
        <div className="rounded-xl border border-border/50 bg-card p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
                {darkMode ? <Moon className="h-4 w-4 text-violet-400" /> : <Sun className="h-4 w-4 text-amber-400" />}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Dark Mode</p>
                <p className="text-[10px] text-muted-foreground">Use dark theme throughout the app</p>
              </div>
            </div>
            <button
              onClick={() => { toggleTheme(); toast.info(theme === 'dark' ? 'Light mode enabled' : 'Dark mode enabled') }}
              className={`relative h-6 w-11 rounded-full transition-colors ${darkMode ? 'bg-primary' : 'bg-muted'}`}
            >
              <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${darkMode ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
            </button>
          </div>
          {/* Theme Preview */}
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => { if (darkMode) { toggleTheme(); toast.info('Light mode enabled') } }}
              className={`flex-1 rounded-lg border-2 p-2 text-center transition-all ${!darkMode ? 'border-primary bg-primary/5' : 'border-transparent bg-muted/30'}`}
            >
              <Sun className="h-4 w-4 mx-auto mb-1 text-amber-400" />
              <span className="text-[9px] font-medium text-foreground">Light</span>
            </button>
            <button
              onClick={() => { if (!darkMode) { toggleTheme(); toast.info('Dark mode enabled') } }}
              className={`flex-1 rounded-lg border-2 p-2 text-center transition-all ${darkMode ? 'border-primary bg-primary/5' : 'border-transparent bg-muted/30'}`}
            >
              <Moon className="h-4 w-4 mx-auto mb-1 text-violet-400" />
              <span className="text-[9px] font-medium text-foreground">Dark</span>
            </button>
          </div>
        </div>
      </section>

      <Separator className="my-4" />

      {/* Notifications */}
      <section className="mb-5">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notifications</h2>
        <div className="space-y-1">
          <SettingToggle icon={Bell} label="Push Notifications" desc="Get notified about deals and updates" enabled={pushNotif} onToggle={() => { setPushNotif(!pushNotif); toast.info(pushNotif ? 'Push notifications disabled' : 'Push notifications enabled') }} color="text-blue-400" bgColor="bg-blue-400/10" />
          <SettingToggle icon={Mail} label="Email Notifications" desc="Order updates & recommendations" enabled={emailNotif} onToggle={() => { setEmailNotif(!emailNotif); toast.info(emailNotif ? 'Email notifications disabled' : 'Email notifications enabled') }} color="text-emerald-400" bgColor="bg-emerald-400/10" />
          <SettingToggle icon={Smartphone} label="SMS Notifications" desc="Critical order alerts only" enabled={smsNotif} onToggle={() => { setSmsNotif(!smsNotif); toast.info(smsNotif ? 'SMS notifications disabled' : 'SMS notifications enabled') }} color="text-violet-400" bgColor="bg-violet-400/10" />
          <SettingToggle icon={CreditCard} label="Deals & Offers" desc="Flash deals, coupons, price drops" enabled={dealsNotif} onToggle={() => { setDealsNotif(!dealsNotif); toast.info(dealsNotif ? 'Deal alerts disabled' : 'Deal alerts enabled') }} color="text-amber-400" bgColor="bg-amber-400/10" />
          <SettingToggle icon={Globe} label="Order Updates" desc="Shipping & delivery notifications" enabled={ordersNotif} onToggle={() => { setOrdersNotif(!ordersNotif); toast.info(ordersNotif ? 'Order updates disabled' : 'Order updates enabled') }} color="text-cyan-400" bgColor="bg-cyan-400/10" />
        </div>
      </section>

      <Separator className="my-4" />

      {/* Privacy */}
      <section className="mb-5">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Privacy</h2>
        <div className="space-y-1">
          <SettingToggle icon={Eye} label="Data Sharing" desc="Share usage data to improve our services" enabled={dataSharing} onToggle={() => { setDataSharing(!dataSharing); toast.info(dataSharing ? 'Data sharing disabled' : 'Data sharing enabled') }} color="text-orange-400" bgColor="bg-orange-400/10" />
          <SettingToggle icon={Mail} label="Marketing Emails" desc="Receive promotional content and newsletters" enabled={marketingEmails} onToggle={() => { setMarketingEmails(!marketingEmails); toast.info(marketingEmails ? 'Marketing emails disabled' : 'Marketing emails enabled') }} color="text-pink-400" bgColor="bg-pink-400/10" />
        </div>
      </section>

      <Separator className="my-4" />

      {/* Language & Currency */}
      <section className="mb-5">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Preferences</h2>
        <div className="space-y-2">
          {/* Language */}
          <div className="rounded-xl border border-border/50 bg-card p-3">
            <button
              className="flex w-full items-center justify-between"
              onClick={() => { setShowLanguagePicker(!showLanguagePicker); setShowCurrencyPicker(false) }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10">
                  <Languages className="h-4 w-4 text-cyan-400" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">Language</p>
                  <p className="text-[10px] text-muted-foreground">{languages.find((l) => l.code === language)?.name}</p>
                </div>
              </div>
              <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${showLanguagePicker ? 'rotate-90' : ''}`} />
            </button>
            {showLanguagePicker && (
              <motion.div className="mt-2 space-y-1" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    className={`flex w-full items-center gap-2 rounded-lg p-2 text-left transition-colors ${language === lang.code ? 'bg-primary/10 text-primary' : 'hover:bg-muted/30 text-foreground'}`}
                    onClick={() => { setLanguage(lang.code); toast.success(`Language set to ${lang.name}`) }}
                  >
                    {language === lang.code && <Check className="h-3 w-3" />}
                    <span className="text-xs font-medium">{lang.name}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          {/* Currency */}
          <div className="rounded-xl border border-border/50 bg-card p-3">
            <button
              className="flex w-full items-center justify-between"
              onClick={() => { setShowCurrencyPicker(!showCurrencyPicker); setShowLanguagePicker(false) }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                  <DollarSign className="h-4 w-4 text-amber-400" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">Currency</p>
                  <p className="text-[10px] text-muted-foreground">{currencies.find((c) => c.code === currency)?.flag} {currencies.find((c) => c.code === currency)?.name}</p>
                </div>
              </div>
              <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${showCurrencyPicker ? 'rotate-90' : ''}`} />
            </button>
            {showCurrencyPicker && (
              <motion.div className="mt-2 space-y-1" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                {currencies.map((cur) => (
                  <button
                    key={cur.code}
                    className={`flex w-full items-center gap-2 rounded-lg p-2 text-left transition-colors ${currency === cur.code ? 'bg-primary/10 text-primary' : 'hover:bg-muted/30 text-foreground'}`}
                    onClick={() => { setCurrency(cur.code); toast.success(`Currency set to ${cur.name}`) }}
                  >
                    {currency === cur.code && <Check className="h-3 w-3" />}
                    <span className="text-xs font-medium">{cur.flag} {cur.name}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </section>

      <Separator className="my-4" />

      {/* Address Management */}
      <section className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Addresses</h2>
          <Button
            variant="ghost"
            size="sm"
            className="text-[10px] text-primary h-6 px-2"
            onClick={() => setShowAddAddress(!showAddAddress)}
          >
            <Plus className="h-3 w-3 mr-0.5" />
            Add
          </Button>
        </div>

        {/* Add Address Form */}
        {showAddAddress && (
          <motion.div
            className="mb-3 rounded-xl border border-primary/20 bg-card p-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <h4 className="text-xs font-semibold text-foreground mb-2">New Address</h4>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px] text-muted-foreground">Label</Label>
                  <select
                    value={newAddress.label}
                    onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                    className="w-full h-8 rounded-md border border-border bg-background px-2 text-xs"
                  >
                    <option value="home">Home</option>
                    <option value="office">Office</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground">City *</Label>
                  <Input value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} className="h-8 text-xs" placeholder="" />
                </div>
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">Full Name *</Label>
                <Input value={newAddress.name} onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })} className="h-8 text-xs" placeholder="" />
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">Phone *</Label>
                <Input value={newAddress.phone} onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })} className="h-8 text-xs" placeholder="" type="tel" />
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">Address *</Label>
                <Input value={newAddress.address} onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })} className="h-8 text-xs" placeholder="123 Street, Area" />
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="flex-1 text-xs h-8" onClick={handleAddAddress}>Save Address</Button>
                <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => setShowAddAddress(false)}>Cancel</Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Address List */}
        {loadingAddresses ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : addresses.length > 0 ? (
          <div className="space-y-2">
            {addresses.map((addr) => (
              <div key={addr.id} className="rounded-xl border border-border/50 bg-card p-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0 mt-0.5">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-foreground">{addr.name}</span>
                        <Badge className={`h-4 px-1.5 text-[8px] ${addr.isDefault ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                          {addr.label}
                        </Badge>
                        {addr.isDefault && (
                          <Badge className="h-4 px-1.5 text-[8px] bg-emerald-500/10 text-emerald-400">Default</Badge>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{addr.address}, {addr.city}{addr.area ? `, ${addr.area}` : ''}</p>
                      <p className="text-[10px] text-muted-foreground">{addr.phone}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border/50 bg-muted/20 p-4 text-center">
            <MapPin className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">No saved addresses</p>
          </div>
        )}
      </section>

      <Separator className="my-4" />

      {/* Security */}
      <section className="mb-5">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Security</h2>
        <div className="space-y-2">
          <div className="rounded-xl border border-border/50 bg-card p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10">
                  <Lock className="h-4 w-4 text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Change Password</p>
                  <p className="text-[10px] text-muted-foreground">Update your account password</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="text-[10px] h-7" onClick={() => toast.info('Password change feature coming soon')}>
                Change
              </Button>
            </div>
          </div>
          <SettingToggle
            icon={Shield}
            label="Two-Factor Authentication"
            desc="Add extra security to your account"
            enabled={twoFactor}
            onToggle={() => { setTwoFactor(!twoFactor); toast.info(twoFactor ? '2FA disabled' : '2FA enabled  your account is more secure!') }}
            color="text-emerald-400"
            bgColor="bg-emerald-400/10"
          />
        </div>
      </section>

      <Separator className="my-4" />

      {/* Connected Accounts */}
      <section className="mb-5">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Connected Accounts</h2>
        <div className="space-y-2">
          {[
            { name: 'Google', icon: 'G', connected: false },
            { name: 'GitHub', icon: 'GH', connected: true },
            { name: 'Facebook', icon: 'FB', connected: false },
          ].map((account) => (
            <div key={account.name} className="rounded-xl border border-border/50 bg-card p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50 text-lg">
                    {account.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{account.name}</p>
                    <p className="text-[10px] text-muted-foreground">{account.connected ? 'Connected' : 'Not connected'}</p>
                  </div>
                </div>
                <Button
                  variant={account.connected ? 'outline' : 'default'}
                  size="sm"
                  className={`text-[10px] h-7 ${account.connected ? 'text-destructive hover:bg-destructive/10' : ''}`}
                  onClick={() => toast.info(account.connected ? `${account.name} disconnected` : `${account.name} connected`)}
                >
                  {account.connected ? 'Disconnect' : 'Connect'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator className="my-4" />

      {/* Data Management */}
      <section className="mb-5">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Data Management</h2>
        <div className="space-y-2">
          {[
            { label: 'Clear Cart', desc: 'Remove all items from cart', action: 'cart' },
            { label: 'Clear Wishlist', desc: 'Remove all saved items', action: 'wishlist' },
            { label: 'Clear Browsing History', desc: 'Remove recently viewed', action: 'history' },
          ].map((item) => (
            <div key={item.action} className="flex items-center justify-between rounded-xl border border-border/50 bg-card p-3">
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-[10px] text-muted-foreground">{item.desc}</p>
              </div>
              <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10 text-xs h-7" onClick={() => handleClearData(item.action)}>
                Clear
              </Button>
            </div>
          ))}
        </div>
      </section>

      <Separator className="my-4" />

      {/* Rewards Summary */}
      <section className="mb-5">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rewards</h2>
        <div className="rounded-xl border border-border/50 bg-card p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Your Points</p>
              <p className="text-xs text-muted-foreground">Earn 10 points per item added to cart</p>
            </div>
            <span className="text-xl font-bold text-primary">{rewardsPoints}</span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min((rewardsPoints / 500) * 100, 100)}%` }} />
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground">500 points = $10 discount on next order</p>
        </div>
      </section>

      <Separator className="my-4" />

      {/* Danger Zone */}
      <section className="mb-5">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-destructive">Danger Zone</h2>
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <p className="text-sm font-semibold text-foreground">Delete Account</p>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10 text-xs" onClick={handleDeleteAccount}>
            <Trash2 className="h-3 w-3 mr-1" />
            Delete My Account
          </Button>
        </div>
      </section>

      {/* Save Button */}
      <Button
        className="w-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 h-11 text-sm font-semibold"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Settings'
        )}
      </Button>

      {/* App Info */}
      <section className="mt-4 text-center">
        <p className="text-xs text-muted-foreground">Grapsee Shop v1.0.0</p>
        <p className="text-[10px] text-muted-foreground">Built with Next.js  PWA Ready</p>
      </section>
    </motion.div>
  )
}

function SettingToggle({
  icon: Icon,
  label,
  desc,
  enabled,
  onToggle,
  color,
  bgColor,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  desc: string
  enabled: boolean
  onToggle: () => void
  color?: string
  bgColor?: string
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/50 bg-card p-3">
      <div className="flex items-center gap-3">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${bgColor || 'bg-muted/50'}`}>
          <Icon className={`h-4 w-4 ${color || 'text-muted-foreground'}`} />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-[10px] text-muted-foreground">{desc}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`relative h-6 w-11 rounded-full transition-colors ${enabled ? 'bg-primary' : 'bg-muted'}`}
      >
        <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${enabled ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  )
}
