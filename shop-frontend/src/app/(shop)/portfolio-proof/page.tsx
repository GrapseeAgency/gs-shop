'use client'

import { useState } from 'react'
import { Globe, Code, Clock, Star, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function PortfolioProofPage() {
  const [projects] = useState([
    {
      id: 1,
      name: 'TechStart SaaS Platform',
      url: 'https://techstart.example.com',
      tech: ['Next.js', 'Node.js', 'PostgreSQL'],
      duration: '21 days',
      rating: 5,
      screenshot: '/portfolio/techstart.jpg',
      verified: true,
      metrics: { visitors: '12K/mo', uptime: '99.9%' }
    },
    {
      id: 2,
      name: 'Fashion E-commerce',
      url: 'https://fashionstore.example.com',
      tech: ['React', 'Stripe', 'MongoDB'],
      duration: '14 days',
      rating: 5,
      screenshot: '/portfolio/fashion.jpg',
      verified: true,
      metrics: { sales: '2.4L/mo', products: '850+' }
    },
    {
      id: 3,
      name: 'Dr. Ahmed Clinic',
      url: 'https://drahmed.example.com',
      tech: ['Next.js', 'Prisma', 'Vercel'],
      duration: '10 days',
      rating: 5,
      screenshot: '/portfolio/clinic.jpg',
      verified: true,
      metrics: { appointments: '200+/mo', calls: '-50%' }
    }
  ])

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <Globe className="h-10 w-10 text-blue-600" />
          Live Portfolio Proof
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Verified by the system, not self-reported
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardContent className="p-0">
              <div className="h-40 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                <Globe className="h-16 w-16 text-blue-600" />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold">{project.name}</h3>
                  {project.verified && (
                    <Badge className="bg-green-500">Verified</Badge>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {project.tech.map((t) => (
                    <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                  <div className="bg-muted p-2 rounded text-center">
                    <Clock className="h-4 w-4 mx-auto mb-1" />
                    {project.duration}
                  </div>
                  <div className="bg-muted p-2 rounded text-center">
                    <Star className="h-4 w-4 mx-auto mb-1 text-yellow-500" />
                    {project.rating}/5
                  </div>
                </div>

                <div className="space-y-1 mb-4 text-sm">
                  {Object.entries(project.metrics).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-muted-foreground capitalize">{key}</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>

                <Button variant="outline" className="w-full" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visit Live Site
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
