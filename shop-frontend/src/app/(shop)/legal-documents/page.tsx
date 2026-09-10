'use client'

import { useState } from 'react'
import { Scale, FileText, Download, Shield, Check, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

export default function LegalDocumentsPage() {
  const [selectedDoc, setSelectedDoc] = useState('nda')
  const [generating, setGenerating] = useState(false)
  const [jurisdiction, setJurisdiction] = useState('india')

  const documents = [
    { id: 'nda', name: 'Non-disclosure Agreement', price: 499, category: 'Business', popular: true },
    { id: 'rental', name: 'Rental Agreement', price: 499, category: 'Real Estate', popular: true },
    { id: 'freelance', name: 'Freelance Contract', price: 599, category: 'Business', popular: true },
    { id: 'employment', name: 'Employment Contract', price: 699, category: 'HR', popular: false },
    { id: 'partnership', name: 'Partnership Agreement', price: 799, category: 'Business', popular: false },
    { id: 'privacy', name: 'Privacy Policy', price: 399, category: 'Website', popular: true },
    { id: 'terms', name: 'Terms of Service', price: 399, category: 'Website', popular: true },
  ]

  const generateDocument = async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/legal/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType: selectedDoc,
          jurisdiction
        })
      })
      
      if (res.ok) {
        toast.success('Legal document generated! Ready for download.')
      }
    } catch (error) {
      toast.error('Failed to generate')
    }
    setGenerating(false)
  }

  const currentDoc = documents.find(d => d.id === selectedDoc)

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <Scale className="h-10 w-10 text-purple-600" />
          Legal Document Generator
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Professional legal documents in minutes. Starting at 399.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Select Document</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                {documents.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc.id)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      selectedDoc === doc.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{doc.name}</span>
                      {doc.popular && <Badge className="bg-orange-500">Popular</Badge>}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-muted-foreground">{doc.category}</span>
                      <span className="font-bold text-green-600">{doc.price}</span>
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
                <FileText className="h-5 w-5" />
                Document Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium">Jurisdiction</label>
                <Select value={jurisdiction} onValueChange={setJurisdiction}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="india">India</SelectItem>
                    <SelectItem value="usa">United States</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                    <SelectItem value="canada">Canada</SelectItem>
                    <SelectItem value="australia">Australia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Party 1 Name</label>
                  <Input placeholder="Your Company Name" />
                </div>
                <div>
                  <label className="text-sm font-medium">Party 2 Name</label>
                  <Input placeholder="Other Party Name" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Additional Terms</label>
                <Textarea 
                  placeholder="Any specific terms or conditions..."
                  rows={4}
                />
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">Legal Protection</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-green-500" />
                    Lawyer-reviewed templates
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-green-500" />
                    Jurisdiction-specific clauses
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-green-500" />
                    Editable Word & PDF formats
                  </li>
                </ul>
              </div>

              <Button 
                className="w-full" 
                size="lg" 
                onClick={generateDocument}
                disabled={generating}
              >
                {generating ? (
                  <>
                    <Scale className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Generate Document ({currentDoc?.price})
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
