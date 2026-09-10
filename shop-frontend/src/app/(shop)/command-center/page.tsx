'use client'

import { useState } from 'react'
import { Command, FileText, CreditCard, MessageSquare, Bell, Folder } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function CommandCenterPage() {
  const [stats] = useState({
    activeProjects: 2,
    totalSpent: 34998,
    upcomingRenewals: 1,
    unreadMessages: 3
  })

  const [projects] = useState([
    { name: 'E-commerce Website', status: 'In Progress', progress: 60 },
    { name: 'Mobile App', status: 'Planning', progress: 15 }
  ])

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <Command className="h-10 w-10 text-indigo-600" />
          Client Command Center
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          All your projects, invoices, and communications in one place
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <Folder className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold">{stats.activeProjects}</p>
            <p className="text-sm text-muted-foreground">Active Projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CreditCard className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold">{stats.totalSpent.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Total Spent</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Bell className="h-8 w-8 mx-auto mb-2 text-orange-600" />
            <p className="text-2xl font-bold">{stats.upcomingRenewals}</p>
            <p className="text-sm text-muted-foreground">Renewals Due</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <p className="text-2xl font-bold">{stats.unreadMessages}</p>
            <p className="text-sm text-muted-foreground">New Messages</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Projects</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {projects.map((project, index) => (
                <div key={index} className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">{project.name}</p>
                    <Badge>{project.status}</Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{project.progress}% complete</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-auto py-4">
                <FileText className="h-5 w-5 mb-2" />
                View Invoices
              </Button>
              <Button variant="outline" className="h-auto py-4">
                <MessageSquare className="h-5 w-5 mb-2" />
                Support Chat
              </Button>
              <Button variant="outline" className="h-auto py-4">
                <Folder className="h-5 w-5 mb-2" />
                Documents
              </Button>
              <Button variant="outline" className="h-auto py-4">
                <CreditCard className="h-5 w-5 mb-2" />
                Billing
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
