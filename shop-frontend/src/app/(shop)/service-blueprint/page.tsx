'use client'

import { useState } from 'react'
import { Map, CheckCircle2, Clock, FileText, Code, Rocket } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function ServiceBlueprintPage() {
  const [selectedService, setSelectedService] = useState('website')

  const blueprints = {
    website: [
      { phase: 'Discovery', duration: '2 days', tasks: ['Requirements gathering', 'Competitor analysis', 'Target audience research'], icon: FileText },
      { phase: 'Design', duration: '5 days', tasks: ['Wireframing', 'UI/UX design', 'Prototype review'], icon: Map },
      { phase: 'Development', duration: '7 days', tasks: ['Frontend coding', 'Backend integration', 'Responsive testing'], icon: Code },
      { phase: 'Launch', duration: '2 days', tasks: ['Final testing', 'Deployment', 'Handoff training'], icon: Rocket }
    ],
    webapp: [
      { phase: 'Discovery', duration: '3 days', tasks: ['Technical planning', 'Architecture design', 'API planning'], icon: FileText },
      { phase: 'Design', duration: '7 days', tasks: ['User flows', 'Interface design', 'Component library'], icon: Map },
      { phase: 'Development', duration: '14 days', tasks: ['Database setup', 'API development', 'Frontend implementation'], icon: Code },
      { phase: 'Launch', duration: '3 days', tasks: ['Testing', 'Deployment', 'Documentation'], icon: Rocket }
    ]
  }

  const currentBlueprint = blueprints[selectedService as keyof typeof blueprints] || blueprints.website

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <Map className="h-10 w-10 text-purple-600" />
          Service Blueprint
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          See exactly what you get, step by step
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        {['website', 'webapp', 'mobile', 'ecommerce'].map((service) => (
          <button
            key={service}
            onClick={() => setSelectedService(service)}
            className={`px-4 py-2 rounded-lg capitalize ${
              selectedService === service
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {service}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {currentBlueprint.map((phase, index) => {
          const Icon = phase.icon
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold">{phase.phase}</h3>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <Badge>{phase.duration}</Badge>
                      </div>
                    </div>
                    <ul className="space-y-2">
                      {phase.tasks.map((task, i) => (
                        <li key={i} className="flex items-center gap-2 text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          {task}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
