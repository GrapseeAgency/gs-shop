'use client'

import { useState } from 'react'
import { Image, Type, Download, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

const TEMPLATES = [
  { id: 'drake', name: 'Drake Hotline Bling' },
  { id: 'distracted', name: 'Distracted Boyfriend' },
  { id: 'change', name: 'Change My Mind' },
  { id: ' expanding', name: 'Expanding Brain' }
]

export function MemeGenerator({ product }: { product?: any }) {
  const [topText, setTopText] = useState('')
  const [bottomText, setBottomText] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('drake')
  const [generating, setGenerating] = useState(false)

  const generateMeme = async () => {
    if (!topText && !bottomText) {
      toast.error('Add some text first!')
      return
    }

    setGenerating(true)
    
    // Simulate generation
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setGenerating(false)
    toast.success('Meme generated! Share it with friends!')
  }

  const downloadMeme = () => {
    toast.success('Meme downloaded!')
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-amber-500" />
          <h3 className="font-semibold">Product Meme Generator</h3>
        </div>

        {/* Template Selection */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => setSelectedTemplate(template.id)}
              className={`p-2 rounded border text-xs ${
                selectedTemplate === template.id 
                  ? 'border-primary bg-primary/10' 
                  : 'border-muted'
              }`}
            >
              {template.name}
            </button>
          ))}
        </div>

        {/* Preview Area */}
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4 relative overflow-hidden">
          <div className="text-center">
            <Image className="h-16 w-16 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Meme Preview</p>
            {topText && (
              <p className="absolute top-2 left-0 right-0 text-center font-bold text-white text-shadow">
                {topText}
              </p>
            )}
            {bottomText && (
              <p className="absolute bottom-2 left-0 right-0 text-center font-bold text-white text-shadow">
                {bottomText}
              </p>
            )}
          </div>
        </div>

        {/* Text Inputs */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2">
            <Type className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Top text"
              value={topText}
              onChange={(e) => setTopText(e.target.value)}
              className="flex-1"
            />
          </div>
          <Textarea
            placeholder="Bottom text"
            value={bottomText}
            onChange={(e) => setBottomText(e.target.value)}
            rows={2}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            className="flex-1 gap-2" 
            onClick={generateMeme}
            disabled={generating}
          >
            {generating ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Meme
              </>
            )}
          </Button>
          <Button variant="outline" onClick={downloadMeme}>
            <Download className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-3">
          Create fun memes about products and share them with the community!
        </p>
      </CardContent>
    </Card>
  )
}
