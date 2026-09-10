'use client'

import { useState } from 'react'
import { Phone, Hash, ArrowRight, Home, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function USSDMenuPage() {
  const [currentMenu, setCurrentMenu] = useState('main')
  const [history, setHistory] = useState<string[]>([])

  const menus: Record<string, any> = {
    main: {
      title: 'Main Menu',
      options: [
        { number: '1', label: 'Browse Products', next: 'categories' },
        { number: '2', label: 'My Orders', next: 'orders' },
        { number: '3', label: 'Search', next: 'search' },
        { number: '4', label: 'Support', next: 'support' },
      ]
    },
    categories: {
      title: 'Categories',
      options: [
        { number: '1', label: 'Groceries', next: 'groceries' },
        { number: '2', label: 'Electronics', next: 'electronics' },
        { number: '3', label: 'Fashion', next: 'fashion' },
        { number: '0', label: 'Back', next: 'main' },
      ]
    },
    groceries: {
      title: 'Groceries',
      options: [
        { number: '1', label: 'Rice - 50/kg', action: 'add' },
        { number: '2', label: 'Dal - 80/kg', action: 'add' },
        { number: '3', label: 'Oil - 120/l', action: 'add' },
        { number: '9', label: 'View Cart', next: 'cart' },
        { number: '0', label: 'Back', next: 'categories' },
      ]
    },
  }

  const navigate = (next: string) => {
    if (next === 'back') {
      setCurrentMenu(history[history.length - 1] || 'main')
      setHistory(history.slice(0, -1))
    } else {
      setHistory([...history, currentMenu])
      setCurrentMenu(next)
    }
  }

  const menu = menus[currentMenu] || menus.main

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Phone className="h-8 w-8 text-blue-600" />
          USSD Menu
        </h1>
        <p className="text-muted-foreground">
          *123*45#  text-based shopping for feature phones
        </p>
      </div>

      <Card className="max-w-md mx-auto bg-black text-white font-mono">
        <CardHeader className="border-b border-gray-700">
          <CardTitle className="text-center text-lg flex items-center justify-center gap-2">
            <Hash className="h-4 w-4" />
            {menu.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {menu.options.map((option: any) => (
            <button
              key={option.number}
              onClick={() => option.next ? navigate(option.next) : null}
              className="w-full flex items-center gap-3 p-3 rounded hover:bg-gray-800 transition-colors text-left"
            >
              <span className="bg-gray-700 w-6 h-6 rounded flex items-center justify-center text-sm">
                {option.number}
              </span>
              <span>{option.label}</span>
              {option.next && <ArrowRight className="h-4 w-4 ml-auto" />}
            </button>
          ))}
        </CardContent>
      </Card>

      <div className="mt-8 text-center text-muted-foreground">
        <p>Dial *123*45# on your phone to access this menu</p>
      </div>
    </div>
  )
}
