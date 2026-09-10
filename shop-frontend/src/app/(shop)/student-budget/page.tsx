'use client'

import { useState } from 'react'
import { GraduationCap, Wallet, PiggyBank, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export default function StudentBudgetPage() {
  const [monthlyBudget, setMonthlyBudget] = useState('')
  const [spent, setSpent] = useState('')

  const budget = parseFloat(monthlyBudget) || 0
  const spentAmt = parseFloat(spent) || 0
  const remaining = budget - spentAmt
  const percentage = budget > 0 ? (spentAmt / budget) * 100 : 0

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <GraduationCap className="h-8 w-8 text-blue-600" />
          Student Budget
        </h1>
        <p className="text-muted-foreground">
          2,000/month: "Essentials only" dorm supplies, instant noodles, budget tech
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Your Budget
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Monthly Budget ()</label>
            <Input 
              type="number"
              placeholder="2000"
              value={monthlyBudget}
              onChange={(e) => setMonthlyBudget(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Amount Spent ()</label>
            <Input 
              type="number"
              placeholder="1200"
              value={spent}
              onChange={(e) => setSpent(e.target.value)}
            />
          </div>

          {budget > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span>Remaining</span>
                <span className="text-xl font-bold text-blue-700">{remaining}</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${percentage > 80 ? 'bg-red-500' : 'bg-blue-600'}`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {percentage > 80 ? 'Budget running low!' : `${Math.round(percentage)}% spent`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5" />
            Student Essentials
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {['Instant Noodles', 'Notebooks', 'Pens', 'Budget Phone', 'Study Lamp', 'Backpack'].map((item) => (
              <Badge key={item} variant="outline" className="py-2 px-4">
                {item}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
