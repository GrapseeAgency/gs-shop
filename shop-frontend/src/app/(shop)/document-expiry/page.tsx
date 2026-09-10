'use client'

import { useState, useEffect } from 'react'
import { FileText, Calendar, AlertCircle, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function DocumentExpiryPage() {
  const [documents, setDocuments] = useState<any[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/reminders/document-expiry')
      if (res.ok) {
        const data = await res.json()
        setDocuments(data.documents || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const addDocument = async (e: React.FormEvent) => {
    e.preventDefault()
    // Would save document
    toast.success('Document added!')
    setShowAdd(false)
    fetchDocuments()
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <FileText className="h-8 w-8 text-blue-600" />
          Document Expiry Tracker
        </h1>
        <p className="text-muted-foreground">
          Never let passport, license, or important documents expire
        </p>
      </div>

      <Button 
        className="mb-4" 
        onClick={() => setShowAdd(!showAdd)}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Document
      </Button>

      {showAdd && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <form onSubmit={addDocument} className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Document Type</label>
                <select className="w-full p-2 border rounded-md mt-1">
                  <option>Passport</option>
                  <option>Driving License</option>
                  <option>Aadhaar Card</option>
                  <option>PAN Card</option>
                  <option>Vehicle Registration</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Document Number</label>
                <Input placeholder="e.g., AB123456" />
              </div>
              <div>
                <label className="text-sm font-medium">Expiry Date</label>
                <Input type="date" />
              </div>
              <div className="flex items-end">
                <Button type="submit" className="w-full">Save Document</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {documents.map((doc) => (
          <Card key={doc.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className={`h-5 w-5 ${
                    doc.daysUntil <= 7 ? 'text-red-500' : 
                    doc.daysUntil <= 30 ? 'text-yellow-500' : 'text-green-500'
                  }`} />
                  <div>
                    <p className="font-medium">{doc.type}</p>
                    <p className="text-sm text-muted-foreground">{doc.number}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={
                    doc.daysUntil <= 7 ? 'destructive' : 
                    doc.daysUntil <= 30 ? 'default' : 'secondary'
                  }>
                    {doc.daysUntil <= 0 ? 'EXPIRED' : `${doc.daysUntil} days left`}
                  </Badge>
                  {doc.renewUrl && (
                    <Button variant="link" size="sm" className="block mt-1">
                      Renew Now
                    </Button>
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
