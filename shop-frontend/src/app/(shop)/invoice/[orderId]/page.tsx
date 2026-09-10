'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, FileText, Building, Mail, Phone, Printer, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useShopRouter } from '@/hooks/use-shop-router'
import { formatPrice } from '@/components/shop/product-card'

interface OrderItem {
  id: string
  productName: string
  price: number
  quantity: number
}

interface Order {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string | null
  total: number
  discount: number
  couponCode: string | null
  status: string
  paymentMethod: string | null
  items: OrderItem[]
  createdAt: string
}

const COMPANY = {
  name: 'Grapsee Shop',
  domain: 'captainpiracy.shop',
  email: 'support@grapsee.shop',
  phone: '+1 (555) 000-0000',
  address: 'Global Digital Services',
}

export default function InvoicePage({ params }: { params: Promise<{ orderId: string }> }) {
  const [orderId, setOrderId] = useState<string>('')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const { goBack } = useShopRouter()

  useEffect(() => { params.then(p => setOrderId(p.orderId)) }, [params])

  useEffect(() => {
    if (!orderId) return
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`)
        if (res.ok) setOrder(await res.json())
      } catch { /* */ } finally { setLoading(false) }
    }
    fetchOrder()
  }, [orderId])

  const handlePrint = () => window.print()
  const handleDownload = () => window.print()

  if (loading || !order) {
    return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
  }

  const invoiceNumber = `INV-${order.id.slice(-8).toUpperCase()}`
  const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const dueDate = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <motion.div className="pb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header - hidden in print */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/30 px-4 py-3 print:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={goBack} className="text-muted-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold text-foreground">Invoice</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1.5">
              <Download className="h-3.5 w-3.5" /> PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5">
              <Printer className="h-3.5 w-3.5" /> Print
            </Button>
          </div>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="mx-4 mt-3 rounded-2xl border border-border/50 bg-card p-6 print:border-0 print:p-0 print:shadow-none">
        {/* Company Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Building className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">{COMPANY.name}</h2>
                <p className="text-[11px] text-muted-foreground">{COMPANY.domain}</p>
              </div>
            </div>
            <div className="mt-2 space-y-0.5">
              <p className="text-[11px] text-muted-foreground">{COMPANY.address}</p>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" /> {COMPANY.email}</p>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" /> {COMPANY.phone}</p>
            </div>
          </div>
          <div className="text-right">
            <h3 className="text-2xl font-bold text-primary">INVOICE</h3>
            <p className="text-sm font-mono text-foreground">{invoiceNumber}</p>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Invoice Details */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Bill To</p>
            <p className="text-sm font-medium text-foreground">{order.customerName}</p>
            <p className="text-[11px] text-muted-foreground">{order.customerEmail}</p>
            {order.customerPhone && <p className="text-[11px] text-muted-foreground">{order.customerPhone}</p>}
          </div>
          <div className="text-right">
            <div className="space-y-1">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Invoice Date</p>
                <p className="text-sm text-foreground">{invoiceDate}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Due Date</p>
                <p className="text-sm text-foreground">{dueDate}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Status</p>
                <p className="text-sm capitalize text-primary">{order.status}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-hidden rounded-xl border border-border/50">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-muted/50">
                <th className="py-2.5 px-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Description</th>
                <th className="py-2.5 px-3 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Qty</th>
                <th className="py-2.5 px-3 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Price</th>
                <th className="py-2.5 px-3 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b border-border/30 last:border-0">
                  <td className="py-2.5 px-3 text-sm text-foreground">{item.productName}</td>
                  <td className="py-2.5 px-3 text-center text-sm text-muted-foreground">{item.quantity}</td>
                  <td className="py-2.5 px-3 text-right text-sm text-muted-foreground">{formatPrice(item.price)}</td>
                  <td className="py-2.5 px-3 text-right text-sm font-medium text-foreground">{formatPrice(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mt-4 flex justify-end">
          <div className="w-52 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">{formatPrice(order.total + order.discount)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-emerald-500">Discount</span>
                <span className="text-emerald-500">-{formatPrice(order.discount)}</span>
              </div>
            )}
            {order.couponCode && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Coupon</span>
                <span className="text-primary font-mono text-xs">{order.couponCode}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-base">
              <span className="font-bold text-foreground">Total</span>
              <span className="font-bold text-primary">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 rounded-xl bg-muted/30 p-3 text-center">
          <p className="text-[11px] text-muted-foreground">Thank you for your business!</p>
          <p className="text-[10px] text-muted-foreground">For questions about this invoice, contact {COMPANY.email}</p>
        </div>
      </div>
    </motion.div>
  )
}
