'use client'

import { useState } from 'react'
import { Award, CheckCircle, BookOpen, Code, Palette, Clock, Star, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

export default function CertificationsPage() {
  const [certifications] = useState([
    {
      id: 1,
      name: 'Grapsee Certified Developer',
      price: 1999,
      description: 'Prove your full-stack development skills',
      icon: Code,
      duration: '3 hours',
      questions: 50,
      level: 'Intermediate',
      topics: ['Next.js', 'React', 'TypeScript', 'Database Design', 'API Development']
    },
    {
      id: 2,
      name: 'Grapsee Design Pro',
      price: 2499,
      description: 'Master UI/UX design with industry standards',
      icon: Palette,
      duration: '4 hours',
      questions: 60,
      level: 'Advanced',
      topics: ['Figma', 'Design Systems', 'User Research', 'Prototyping', 'Accessibility']
    },
  ])

  const enroll = (cert: any) => {
    toast.success(`Enrolled in ${cert.name}!`)
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <Award className="h-10 w-10 text-purple-600" />
          Certification Programs
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Get certified. Stand out. Earn more.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {certifications.map((cert) => {
          const Icon = cert.icon
          return (
            <Card key={cert.id} className="group hover:shadow-xl transition-all">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center">
                    <Icon className="h-8 w-8 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{cert.name}</h3>
                    <Badge variant="secondary">{cert.level}</Badge>
                  </div>
                </div>

                <p className="text-muted-foreground mb-6">{cert.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-muted p-3 rounded-lg text-center">
                    <Clock className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="font-medium">{cert.duration}</p>
                    <p className="text-xs text-muted-foreground">Duration</p>
                  </div>
                  <div className="bg-muted p-3 rounded-lg text-center">
                    <BookOpen className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="font-medium">{cert.questions}</p>
                    <p className="text-xs text-muted-foreground">Questions</p>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="font-medium mb-2">Topics Covered:</p>
                  <div className="flex flex-wrap gap-2">
                    {cert.topics.map((topic) => (
                      <Badge key={topic} variant="outline">{topic}</Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-green-600">{cert.price}</p>
                    <p className="text-sm text-muted-foreground">Online exam + Certificate</p>
                  </div>
                  <Button size="lg" onClick={() => enroll(cert)}>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Enroll Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
