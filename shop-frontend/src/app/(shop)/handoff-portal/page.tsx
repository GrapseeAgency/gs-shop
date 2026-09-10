'use client'

import { useState } from 'react'
import { Package, Download, FileText, Code, BookOpen, Video, Folder } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function HandoffPortalPage() {
  const [deliverables] = useState([
    { id: 1, name: 'Source Code', type: 'code', size: '24 MB', files: ['src/', 'components/', 'api/'] },
    { id: 2, name: 'Design Assets', type: 'assets', size: '156 MB', files: ['logos/', 'icons/', 'banners/'] },
    { id: 3, name: 'Documentation', type: 'docs', size: '2.4 MB', files: ['README.md', 'API.md', 'DEPLOY.md'] },
    { id: 4, name: 'Video Tutorials', type: 'video', size: '450 MB', files: ['setup.mp4', 'admin-guide.mp4'] }
  ])

  const downloadAll = () => {
    toast.success('Starting download of all deliverables...')
  }

  const downloadItem = (name: string) => {
    toast.success(`Downloading ${name}...`)
  }

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <Package className="h-10 w-10 text-blue-600" />
          Deliverable Handoff Portal
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          All your files organized and ready
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Project: E-commerce Website</h2>
              <p className="text-muted-foreground">Delivered on December 15, 2024</p>
            </div>
            <Button size="lg" onClick={downloadAll}>
              <Download className="h-4 w-4 mr-2" />
              Download All
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {deliverables.map((item) => {
          const icons: Record<string, any> = {
            code: Code,
            assets: Folder,
            docs: BookOpen,
            video: Video
          }
          const Icon = icons[item.type] || FileText

          return (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold">{item.name}</h3>
                      <Badge variant="outline">{item.size}</Badge>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1 mb-3">
                      {item.files.map((file, i) => (
                        <li key={i}>{file}</li>
                      ))}
                    </ul>
                    <Button size="sm" variant="outline" onClick={() => downloadItem(item.name)}>
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
