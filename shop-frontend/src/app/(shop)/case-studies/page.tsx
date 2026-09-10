'use client'

import { useState } from 'react'
import { BookOpen, ArrowUpRight, Clock, DollarSign, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function CaseStudiesPage() {
  const [studies] = useState([
    {
      id: 1,
      client: 'TechStart Inc.',
      industry: 'SaaS',
      service: 'Web Application',
      duration: '21 days',
      price: 24999,
      results: '3x user engagement increase',
      metrics: { traffic: '+180%', conversion: '+45%', revenue: '+220%' },
      testimonial: 'Grapsee delivered exactly what we needed, on time and on budget.'
    },
    {
      id: 2,
      client: 'Fashion Boutique',
      industry: 'E-commerce',
      service: 'Online Store',
      duration: '14 days',
      price: 12999,
      results: 'Online sales launched in 2 weeks',
      metrics: { traffic: '+250%', conversion: '+60%', revenue: '+300%' },
      testimonial: 'Our online store is now our main revenue source.'
    },
    {
      id: 3,
      client: 'Dr. Ahmed Clinic',
      industry: 'Healthcare',
      service: 'Website + Booking',
      duration: '10 days',
      price: 8999,
      results: '50% reduction in admin calls',
      metrics: { traffic: '+120%', bookings: '+200%', calls: '-50%' },
      testimonial: 'Patients love booking online. Saves us hours every day.'
    }
  ])

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <BookOpen className="h-10 w-10 text-blue-600" />
          Case Studies
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Real results from real clients
        </p>
      </div>

      <div className="space-y-6">
        {studies.map((study) => (
          <Card key={study.id}>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="lg:w-1/3">
                  <div className="h-40 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <BookOpen className="h-16 w-16 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-1">{study.client}</h3>
                  <Badge variant="secondary">{study.industry}</Badge>
                </div>

                <div className="lg:w-2/3 space-y-4">
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {study.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {study.price.toLocaleString()}
                    </div>
                  </div>

                  <p className="text-lg font-medium">{study.results}</p>

                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries(study.metrics).map(([key, value]) => (
                      <div key={key} className="bg-muted p-3 rounded-lg text-center">
                        <p className="text-xl font-bold text-green-600">{value}</p>
                        <p className="text-xs text-muted-foreground capitalize">{key}</p>
                      </div>
                    ))}
                  </div>

                  <blockquote className="border-l-4 border-blue-500 pl-4 italic">
                    "{study.testimonial}"
                  </blockquote>

                  <Button variant="outline">
                    View Full Case Study
                    <ArrowUpRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
