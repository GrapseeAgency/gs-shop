'use client'

import { useState } from 'react'
import { GitBranch, Github, Gitlab, Cloud, Copy, Check, ShoppingCart, Terminal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

export default function CICDPage() {
  const [activeTab, setActiveTab] = useState('github')
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const templates = [
    { id: 1, name: 'Next.js CI/CD', price: 999, platform: 'github', description: 'Build, test, deploy Next.js apps', yaml: 'name: Next.js CI\n\non: [push]\n\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v3\n      - name: Setup Node\n        uses: actions/setup-node@v3\n      - run: npm ci\n      - run: npm run build' },
    { id: 2, name: 'Docker Deployment', price: 999, platform: 'github', description: 'Build and push Docker images', yaml: 'name: Docker Build\n\non: [push]\n\njobs:\n  docker:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v3\n      - name: Build Docker\n        run: docker build -t app .' },
    { id: 3, name: 'AWS Deployment', price: 1499, platform: 'gitlab', description: 'Deploy to AWS with GitLab CI', yaml: 'stages:\n  - build\n  - deploy\n\ndeploy:\n  stage: deploy\n  script:\n    - aws deploy push' },
  ]

  const copyTemplate = (id: number, yaml: string) => {
    navigator.clipboard.writeText(yaml)
    setCopiedId(id)
    toast.success('Template copied!')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const buyTemplate = (template: any) => {
    toast.success(`${template.name} added to cart!`)
  }

  const filteredTemplates = templates.filter(t => t.platform === activeTab)

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <GitBranch className="h-10 w-10 text-orange-600" />
          CI/CD Pipeline Templates
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Production-ready CI/CD configurations. Copy and deploy.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
          <TabsTrigger value="github" className="flex items-center gap-2">
            <Github className="h-4 w-4" />
            GitHub Actions
          </TabsTrigger>
          <TabsTrigger value="gitlab" className="flex items-center gap-2">
            <Gitlab className="h-4 w-4" />
            GitLab CI
          </TabsTrigger>
        </TabsList>

        <TabsContent value="github" className="mt-6">
          <div className="grid gap-6">
            {filteredTemplates.map((template) => (
              <Card key={template.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{template.name}</h3>
                      <p className="text-muted-foreground">{template.description}</p>
                    </div>
                    <p className="text-2xl font-bold text-green-600">{template.price}</p>
                  </div>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400">.github/workflows/deploy.yml</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-gray-400"
                        onClick={() => copyTemplate(template.id, template.yaml)}
                      >
                        {copiedId === template.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <pre className="whitespace-pre-wrap">{template.yaml}</pre>
                  </div>
                  <Button onClick={() => buyTemplate(template)}>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Buy Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="gitlab" className="mt-6">
          <div className="grid gap-6">
            {filteredTemplates.map((template) => (
              <Card key={template.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{template.name}</h3>
                      <p className="text-muted-foreground">{template.description}</p>
                    </div>
                    <p className="text-2xl font-bold text-green-600">{template.price}</p>
                  </div>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400">.gitlab-ci.yml</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-gray-400"
                        onClick={() => copyTemplate(template.id, template.yaml)}
                      >
                        {copiedId === template.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <pre className="whitespace-pre-wrap">{template.yaml}</pre>
                  </div>
                  <Button onClick={() => buyTemplate(template)}>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Buy Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
