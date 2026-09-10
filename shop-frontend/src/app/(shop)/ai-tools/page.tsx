'use client'

import { useState } from 'react'
import { Sparkles, Wand2, RefreshCw, ShoppingCart, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function AIToolsPage() {
  const [activeTool, setActiveTool] = useState('logo')
  const [input, setInput] = useState('')
  const [generating, setGenerating] = useState(false)
  const [results, setResults] = useState<string[]>([])

  const tools = [
    { id: 'logo', name: 'AI Logo Generator', price: 499, description: 'Generate 10 logo options from your brand description', inputLabel: 'Describe your brand' },
    { id: 'business', name: 'Business Name Generator', price: 199, description: 'AI-powered business name suggestions', inputLabel: 'What does your business do?' },
    { id: 'tagline', name: 'Tagline Generator', price: 199, description: 'Catchy taglines for your brand', inputLabel: 'Enter your brand name' },
    { id: 'palette', name: 'Color Palette Generator', price: 99, description: 'Beautiful color combinations', inputLabel: 'Describe your brand mood' },
    { id: 'social', name: 'Social Post Generator', price: 299, description: 'AI-generated social media content', inputLabel: 'What are you promoting?' },
  ]

  const currentTool = tools.find(t => t.id === activeTool) || tools[0]

  const generate = () => {
    if (!input) {
      toast.error('Please enter a description')
      return
    }
    setGenerating(true)
    setTimeout(() => {
      setResults([
        `${input} Concept 1`,
        `${input} Concept 2`,
        `${input} Concept 3`,
      ])
      setGenerating(false)
      toast.success('Generated!')
    }, 2000)
  }

  const buyCredits = () => {
    toast.success('Credits added!')
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <Sparkles className="h-10 w-10 text-purple-600" />
          AI-Powered Tools
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Generate logos, names, taglines, and more with AI
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Choose Tool</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                {tools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => {
                      setActiveTool(tool.id)
                      setResults([])
                      setInput('')
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      activeTool === tool.id ? 'bg-purple-100 text-purple-900' : 'hover:bg-gray-100'
                    }`}
                  >
                    <p className="font-medium">{tool.name}</p>
                    <p className="text-sm text-muted-foreground">{tool.price}</p>
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
                <Wand2 className="h-5 w-5 text-purple-600" />
                {currentTool.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <p className="text-muted-foreground">{currentTool.description}</p>
              <Input 
                placeholder={currentTool.inputLabel}
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <Button className="w-full" onClick={generate} disabled={generating}>
                {generating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>

              {results.length > 0 && (
                <div className="space-y-3">
                  <p className="font-medium">Generated Results:</p>
                  {results.map((result, i) => (
                    <div key={i} className="p-4 bg-purple-50 rounded-lg flex items-center justify-between">
                      <span>{result}</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button size="sm" onClick={buyCredits}>
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Buy
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
