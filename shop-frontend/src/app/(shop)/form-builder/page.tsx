'use client'

import { useState } from 'react'
import { FormInput, Plus, Trash2, Share2, BarChart3, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

export default function FormBuilderPage() {
  const [title, setTitle] = useState('')
  const [fields, setFields] = useState<any[]>([])
  const [creating, setCreating] = useState(false)

  const addField = (type: string) => {
    setFields([...fields, { type, label: '', required: false, options: [] }])
  }

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index))
  }

  const createForm = async () => {
    if (!title || fields.length === 0) {
      toast.error('Please add a title and at least one field')
      return
    }
    setCreating(true)
    
    try {
      const res = await fetch('/api/forms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, fields })
      })
      
      if (res.ok) {
        toast.success('Form created! Share link generated.')
      }
    } catch (error) {
      toast.error('Failed to create form')
    }
    setCreating(false)
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <FormInput className="h-10 w-10 text-green-600" />
          Smart Form Builder
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Create forms, surveys, and quizzes. Start free, upgrade anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Add Fields</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              {['Text', 'Email', 'Number', 'Textarea', 'Select', 'Checkbox', 'Radio', 'File Upload'].map((type) => (
                <Button
                  key={type}
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => addField(type.toLowerCase())}
                >
                  {type}
                  <Plus className="h-4 w-4" />
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="p-4">
              <h3 className="font-bold mb-2">Free Plan</h3>
              <ul className="text-sm space-y-1">
                <li className="flex items-center gap-2">
                  <Badge className="bg-green-500">Free</Badge>
                  3 forms, 100 responses/month
                </li>
              </ul>
              <h3 className="font-bold mt-4 mb-2">Pro 999/month</h3>
              <ul className="text-sm space-y-1">
                <li> Unlimited forms</li>
                <li> Unlimited responses</li>
                <li> Custom branding</li>
                <li> Logic jumps</li>
                <li> Payment collection</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Form Editor</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium">Form Title</label>
                <Input 
                  placeholder="Enter form title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{field.type}</Badge>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Required</span>
                        <Switch 
                          checked={field.required}
                          onCheckedChange={(checked) => {
                            const newFields = [...fields]
                            newFields[index].required = checked
                            setFields(newFields)
                          }}
                        />
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeField(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    <Input 
                      placeholder="Field label"
                      value={field.label}
                      onChange={(e) => {
                        const newFields = [...fields]
                        newFields[index].label = e.target.value
                        setFields(newFields)
                      }}
                    />
                  </div>
                ))}
              </div>

              {fields.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FormInput className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Click fields on the left to add them</p>
                </div>
              )}

              <Button 
                className="w-full" 
                size="lg" 
                onClick={createForm}
                disabled={creating || fields.length === 0}
              >
                {creating ? 'Creating...' : (
                  <>
                    <Share2 className="h-4 w-4 mr-2" />
                    Create & Share Form
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
