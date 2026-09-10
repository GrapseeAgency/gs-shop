'use client'

import { useState } from 'react'
import { LayoutDashboard, Clock, CheckCircle, Circle, AlertCircle, MessageSquare } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function ProjectDashboardPage() {
  const [project] = useState({
    name: 'E-commerce Website',
    status: 'In Progress',
    progress: 60,
    daysElapsed: 8,
    totalDays: 14,
    currentPhase: 'Development',
    milestones: [
      { name: 'Discovery', status: 'completed', date: 'Day 1-2' },
      { name: 'Design', status: 'completed', date: 'Day 3-7' },
      { name: 'Development', status: 'in-progress', date: 'Day 8-14' },
      { name: 'Testing', status: 'pending', date: 'Day 15-16' },
      { name: 'Launch', status: 'pending', date: 'Day 17' }
    ]
  })

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <LayoutDashboard className="h-10 w-10 text-green-600" />
          Live Project Dashboard
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Real-time updates on your project
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="text-3xl font-bold">{project.progress}%</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <Progress value={project.progress} className="mt-4" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Timeline</p>
                <p className="text-3xl font-bold">Day {project.daysElapsed}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Circle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">of {project.totalDays} days</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Phase</p>
                <p className="text-2xl font-bold">{project.currentPhase}</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <Badge className="mt-4 bg-orange-500">Active</Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Milestones</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {project.milestones.map((milestone, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                {milestone.status === 'completed' ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : milestone.status === 'in-progress' ? (
                  <Circle className="h-6 w-6 text-blue-500" />
                ) : (
                  <Circle className="h-6 w-6 text-gray-300" />
                )}
                <div className="flex-1">
                  <p className="font-medium">{milestone.name}</p>
                  <p className="text-sm text-muted-foreground">{milestone.date}</p>
                </div>
                <Badge variant={milestone.status === 'completed' ? 'default' : 'outline'}>
                  {milestone.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex gap-4">
        <Button className="flex-1">
          <MessageSquare className="h-4 w-4 mr-2" />
          Send Message
        </Button>
        <Button variant="outline" className="flex-1">
          Request Changes
        </Button>
      </div>
    </div>
  )
}
