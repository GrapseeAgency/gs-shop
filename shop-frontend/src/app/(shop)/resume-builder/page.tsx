'use client'

import { useState } from 'react'
import { FileText, Download, Sparkles, Check, Star, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

export default function ResumeBuilderPage() {
  const [activeTemplate, setActiveTemplate] = useState('modern')
  const [generating, setGenerating] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    summary: '',
    experience: '',
    education: '',
    skills: ''
  })

  const templates = [
    { id: 'modern', name: 'Modern Professional', price: 299, atsFriendly: true, rating: 4.8 },
    { id: 'creative', name: 'Creative Designer', price: 399, atsFriendly: false, rating: 4.6 },
    { id: 'minimal', name: 'Minimal Clean', price: 299, atsFriendly: true, rating: 4.9 },
    { id: 'executive', name: 'Executive Premium', price: 499, atsFriendly: true, rating: 4.7 },
    { id: 'tech', name: 'Tech Developer', price: 349, atsFriendly: true, rating: 4.8 },
  ]

  const generateResume = async () => {
    if (!formData.fullName || !formData.email) {
      toast.error('Please fill in your name and email')
      return
    }
    setGenerating(true)
    
    try {
      const res = await fetch('/api/resume/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: activeTemplate,
          data: formData
        })
      })
      
      if (res.ok) {
        toast.success('Resume generated! Download ready.')
      }
    } catch (error) {
      toast.error('Failed to generate')
    }
    setGenerating(false)
  }

  const currentTemplate = templates.find(t => t.id === activeTemplate)

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <FileText className="h-10 w-10 text-blue-600" />
          Professional Resume Builder
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          ATS-friendly resumes that get you hired. Start at 299.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Choose Template</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setActiveTemplate(template.id)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      activeTemplate === template.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{template.name}</span>
                      {template.atsFriendly && <Badge className="bg-green-500">ATS</Badge>}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span>{template.rating}</span>
                      <span></span>
                      <span className="font-bold text-green-600">{template.price}</span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                Fill Your Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Full Name *</label>
                  <Input 
                    placeholder=""
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email *</label>
                  <Input 
                    placeholder="john@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input 
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Professional Summary</label>
                <Textarea 
                  placeholder="Brief overview of your experience and skills..."
                  rows={3}
                  value={formData.summary}
                  onChange={(e) => setFormData({...formData, summary: e.target.value})}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Work Experience</label>
                <Textarea 
                  placeholder="Company - Position - Duration\nKey achievements..."
                  rows={4}
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Education</label>
                <Textarea 
                  placeholder="Degree - University - Year"
                  rows={2}
                  value={formData.education}
                  onChange={(e) => setFormData({...formData, education: e.target.value})}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Skills (comma separated)</label>
                <Input 
                  placeholder="JavaScript, React, Node.js, Python..."
                  value={formData.skills}
                  onChange={(e) => setFormData({...formData, skills: e.target.value})}
                />
              </div>

              <Button 
                className="w-full" 
                size="lg" 
                onClick={generateResume}
                disabled={generating}
              >
                {generating ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Generate Resume ({currentTemplate?.price})
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
