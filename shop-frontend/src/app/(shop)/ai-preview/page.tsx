'use client'

import { useState } from 'react'
import { Image, Wand2, Sparkles, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function AIPreviewPage() {
  const [businessName, setBusinessName] = useState('')
  const [industry, setIndustry] = useState('')
  const [generating, setGenerating] = useState(false)
  const [preview, setPreview] = useState<any>(null)

  const generate = async () => {
    if (!businessName || !industry) {
      toast.error('Fill in all fields')
      return
    }
    setGenerating(true)
    setTimeout(() => {
      setPreview({
        industry,
        colors: ['#3B82F6', '#10B981', '#F59E0B'],
        features: ['Hero section', 'Services grid', 'Testimonials', 'Contact form'],
        estimatedPrice: industry === 'restaurant' ? 6999 : industry === 'clinic' ? 8999 : 4999
      })
      setGenerating(false)
      toast.success('Preview generated!')
    }, 2000)
  }

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <Image className="h-10 w-10 text-purple-600" />
          AI Design Preview
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          See your website before we build it - in 30 seconds
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Your Business</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium">Business Name</label>
              <Input 
                placeholder="e.g., Sunrise Cafe"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Industry</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              >
                <option value="">Select industry</option>
                <option value="restaurant">Restaurant</option>
                <option value="clinic">Healthcare</option>
                <option value="retail">Retail</option>
                <option value="tech">Technology</option>
                <option value="realestate">Real Estate</option>
              </select>
            </div>
            <Button 
              className="w-full" 
              size="lg"
              onClick={generate}
              disabled={generating}
            >
              {generating ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate Preview
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {preview && (
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle>Your Preview</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-48 bg-white rounded-lg mb-4 flex items-center justify-center border-2 border-dashed">
                <Image className="h-16 w-16 text-muted-foreground" />
              </div>
              <div className="space-y-3">
                <p><strong>Industry:</strong> {preview.industry}</p>
                <div className="flex gap-2">
                  {preview.colors.map((color: string, i: number) => (
                    <div 
                      key={i} 
                      className="h-8 w-8 rounded-full" 
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {preview.features.map((feature: string, i: number) => (
                    <Badge key={i} variant="secondary">{feature}</Badge>
                  ))}
                </div>
                <p className="text-2xl font-bold text-green-600">
                  Est. Price: {preview.estimatedPrice}
                </p>
                <div className="flex gap-2">
                  <Button className="flex-1">Build This</Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
