'use client'

import { useState } from 'react'
import { Wrench, Search, Star, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function AssemblyFinderPage() {
  const [search, setSearch] = useState('')
  const technicians = [
    { name: 'Rahul Kumar', rating: 4.8, jobs: 234, price: 299 },
    { name: 'Amit Singh', rating: 4.9, jobs: 189, price: 349 },
    { name: 'Vikram Patel', rating: 4.7, jobs: 312, price: 279 },
  ]

  const book = (tech: any) => {
    toast.success(`Booked ${tech.name}! They'll arrive in 2 hours.`)
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Wrench className="h-8 w-8 text-orange-600" />
          Assembly Finder
        </h1>
        <p className="text-muted-foreground">
          Find verified technicians for furniture assembly
        </p>
      </div>

      <Input 
        className="mb-6"
        placeholder="Search for technicians..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="grid gap-4">
        {technicians.map((tech, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Wrench className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="font-bold">{tech.name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>{tech.rating}</span>
                    <span></span>
                    <span>{tech.jobs} jobs</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">{tech.price}</p>
                <div className="flex gap-2 mt-1">
                  <Button size="sm" variant="outline">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button size="sm" onClick={() => book(tech)}>Book</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
