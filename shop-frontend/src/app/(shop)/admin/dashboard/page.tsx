'use client'

import { useEffect, useState } from 'react'
import { BarChart3, Users, Package, ShoppingCart, DollarSign } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/admin/dashboard')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      } else if (res.status === 403) {
        toast.error('Access denied')
      }
    } catch (error) {
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="h-8 bg-muted rounded w-1/3 mb-4 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="container py-8 text-center">
        <p className="text-muted-foreground">Access denied or no data available</p>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <BarChart3 className="h-6 w-6" />
        Admin Dashboard
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.stats.revenue.total.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              +${stats.stats.revenue.today.toFixed(2)} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.stats.orders.total}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.stats.orders.today} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.stats.users.total}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.stats.users.newToday} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.stats.products.total}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.stats.products.newThisMonth} this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Top Products</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {stats.topProducts?.map((product: any) => (
              <div key={product.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded bg-muted" />
                  <p className="font-medium">{product.name}</p>
                </div>
                <p className="text-sm text-muted-foreground">{product.reviewCount} reviews</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Sellers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top Sellers</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {stats.topSellers?.map((seller: any) => (
              <div key={seller.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted" />
                  <div>
                    <p className="font-medium">{seller.name}</p>
                    <p className="text-xs text-muted-foreground">{seller.totalSales} sales</p>
                  </div>
                </div>
                <p className="text-sm font-medium"> {seller.rating}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
