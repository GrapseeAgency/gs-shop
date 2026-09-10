'use client'

import { useState } from 'react'
import { Image, Wand2, Sparkles, Building2, User, Target, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function FreeMockupPage() {
  const [formData, setFormData] = useState({
    businessName: '',
    industry: '',
    targetAudience: ''
  })
  const [generating, setGenerating] = useState(false)
  const [mockup, setMockup] = useState<any>(null)

  const generateMockup = async () => {
    if (!formData.businessName) {
      toast.error('Please enter your business name')
      return
    }
    setGenerating(true)
    setTimeout(() => {
      setMockup({
        businessName: formData.businessName,
        colorPalette: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
        layout: 'Modern single-page with hero, features, testimonials, CTA',
        features: [
          'Hero section with headline',
          '3-column features grid',
          'Customer testimonials',
          'Contact form',
          'Social proof badges'
        ],
        estimatedPrice: formData.industry === 'restaurant' ? 7999 : 5999,
        timeToBuild: '10-14 days'
      })
      setGenerating(false)
      toast.success('Free mockup generated!')
    }, 2000)
  }

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <Image className="h-10 w-10 text-purple-600" />
          Free Mockup Generator
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          See what your website could look like - in 30 seconds
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Tell Us About Your Business</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium flex items-center gap-2 mb-2">
                <Building2 className="h-4 w-4" />
                Business Name
              </label>
              <Input 
                placeholder="e.g., Sunrise Cafe"
                value={formData.businessName}
                onChange={(e) => setFormData({...formData, businessName: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium flex items-center gap-2 mb-2">
                <Target className="h-4 w-4" />
                Industry
              </label>
              <select 
                className="w-full p-2 border rounded-lg"
                value={formData.industry}
                onChange={(e) => setFormData({...formData, industry: e.target.value})}
              >
                <option value="">Select industry</option>
                <option value="restaurant">Restaurant / Food</option>
                <option value="retail">Retail / E-commerce</option>
                <option value="healthcare">Healthcare</option>
                <option value="tech">Technology</option>
                <option value="realestate">Real Estate</option>
                <option value="education">Education</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium flex items-center gap-2 mb-2">
                <User className="h-4 w-4" />
                Target Audience
              </label>
              <Input 
                placeholder="e.g., Young professionals, families..."
                value={formData.targetAudience}
                onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
              />
            </div>
            <Button 
              className="w-full" 
              size="lg"
              onClick={generateMockup}
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
                  Generate Free Mockup
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {mockup && (
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle>Your Mockup Preview</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-48 bg-white rounded-lg mb-4 flex items-center justify-center border-2 border-dashed">
                <Image className="h-16 w-16 text-muted-foreground" />
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Suggested Color Palette</p>
                  <div className="flex gap-2 mt-1">
                    {mockup.colorPalette.map((color: string, i: number) => (
                      <div 
                        key={i} 
                        className="h-8 w-8 rounded-full shadow-sm" 
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Layout Structure</p>
                  <p className="font-medium">{mockup.layout}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Key Features</p>
                  <div className="flex flex-wrap gap-2">
                    {mockup.features.map((feature: string, i: number) => (
                      <Badge key={i} variant="secondary">{feature}</Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Est. Price</p>
                    <p className="text-2xl font-bold text-green-600">{mockup.estimatedPrice}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Build Time</p>
                    <p className="text-xl font-bold">{mockup.timeToBuild}</p>
                  </div>
                </div>

                <Button className="w-full" size="lg">
                  <Send className="h-4 w-4 mr-2" />
                  Build This Website
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
