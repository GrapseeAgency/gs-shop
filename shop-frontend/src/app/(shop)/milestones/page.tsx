'use client'

import { useState } from 'react'
import { Flag, CheckCircle, Clock, AlertCircle, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

export default function MilestonesPage() {
  const [milestones, setMilestones] = useState([
    { id: 1, name: 'Wireframes', status: 'completed', deliverables: ['Homepage wireframe', 'About page wireframe'], approved: true },
    { id: 2, name: 'Design []', status: 'in-review', deliverables: ['Homepage design', 'Mobile design'], approved: false },
    { id: 3, name: 'Frontend Development', status: 'pending', deliverables: ['HTML/CSS', 'React components'], approved: false },
    { id: 4, name: 'Backend Integration', status: 'pending', deliverables: ['API endpoints', 'Database setup'], approved: false }
  ])

  const [feedback, setFeedback] = useState('')

  const approveMilestone = (id: number) => {
    setMilestones(milestones.map(m => 
      m.id === id ? { ...m, status: 'completed', approved: true } : m
    ))
    toast.success('Milestone approved!')
  }

  const requestChanges = (id: number) => {
    toast.success('Feedback sent to team')
    setFeedback('')
  }

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <Flag className="h-10 w-10 text-orange-600" />
          Milestone Approval
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Review and approve each phase
        </p>
      </div>

      <div className="space-y-4">
        {milestones.map((milestone, index) => (
          <Card key={milestone.id} className={milestone.approved ? 'border-green-500' : ''}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {milestone.status === 'completed' ? (
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  ) : milestone.status === 'in-review' ? (
                    <Clock className="h-8 w-8 text-orange-500" />
                  ) : (
                    <AlertCircle className="h-8 w-8 text-gray-300" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold">Milestone {index + 1}: {milestone.name}</h3>
                    <Badge variant={milestone.status === 'completed' ? 'default' : milestone.status === 'in-review' ? 'secondary' : 'outline'}>
                      {milestone.status}
                    </Badge>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-2">Deliverables:</p>
                    <ul className="space-y-1">
                      {milestone.deliverables.map((item, i) => (
                        <li key={i} className="text-sm flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {milestone.status === 'in-review' && (
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Your feedback (optional)"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1" onClick={() => requestChanges(milestone.id)}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Request Changes
                        </Button>
                        <Button className="flex-1" onClick={() => approveMilestone(milestone.id)}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
