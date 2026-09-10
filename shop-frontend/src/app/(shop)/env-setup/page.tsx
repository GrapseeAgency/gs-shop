'use client'

import { useState } from 'react'
import { Terminal, Download, Copy, Check, ShoppingCart, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function EnvSetupPage() {
  const [copied, setCopied] = useState(false)

  const setups = [
    {
      id: 1,
      name: 'Full Stack Dev Environment',
      price: 499,
      description: 'One command setup for complete development environment',
      command: 'curl -fsSL https://grapsee.dev/setup | bash',
      includes: ['Docker', 'VS Code', 'Git', 'Node.js', 'TypeScript', 'PostgreSQL', 'Redis']
    },
    {
      id: 2,
      name: 'Frontend Dev Kit',
      price: 299,
      description: 'React/Next.js development essentials',
      command: 'npm create grapsee-frontend@latest',
      includes: ['Next.js 14', 'Tailwind CSS', 'shadcn/ui', 'ESLint', 'Prettier', 'Husky']
    },
  ]

  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd)
    setCopied(true)
    toast.success('Command copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const buySetup = (setup: any) => {
    toast.success(`${setup.name} added to cart!`)
  }

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <Terminal className="h-10 w-10 text-gray-600" />
          Environment Setup Scripts
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          One-click dev environment setup. Zero configuration.
        </p>
      </div>

      <div className="space-y-6">
        {setups.map((setup) => (
          <Card key={setup.id}>
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Terminal className="h-8 w-8 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">{setup.name}</h3>
                  <p className="text-muted-foreground mb-4">{setup.description}</p>
                  
                  <div className="bg-black text-white p-4 rounded-lg mb-4 font-mono text-sm">
                    <div className="flex items-center justify-between">
                      <span>$ {setup.command}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-white hover:text-white"
                        onClick={() => copyCommand(setup.command)}
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {setup.includes.map((item) => (
                      <Badge key={item} variant="secondary" className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-green-600">{setup.price}</p>
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Button size="sm" onClick={() => buySetup(setup)}>
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Buy
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
