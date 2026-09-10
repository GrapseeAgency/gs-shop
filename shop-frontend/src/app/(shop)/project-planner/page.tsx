'use client'

import { useState } from 'react'
import { Hammer, CheckSquare, Plus, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function ProjectPlannerPage() {
  const [project, setProject] = useState('')
  const [materials, setMaterials] = useState<string[]>([])

  const projects: Record<string, string[]> = {
    'bookshelf': ['Wood planks (6)', 'Screws (20)', 'Wood glue', 'Sandpaper', 'Paint'],
    'photo frame': ['Cardboard', 'Scissors', 'Glue', 'Decorations'],
    'garden bed': ['Wood (4 planks)', 'Soil', 'Seeds', 'Nails'],
  }

  const generateList = () => {
    setMaterials(projects[project.toLowerCase()] || [])
    if (projects[project.toLowerCase()]) {
      toast.success('Materials list generated!')
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Hammer className="h-8 w-8 text-amber-600" />
          Project Planner
        </h1>
        <p className="text-muted-foreground">
          DIY project materials calculator
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Enter Project
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input 
            placeholder="e.g., bookshelf, photo frame, garden bed"
            value={project}
            onChange={(e) => setProject(e.target.value)}
          />
          <Button className="w-full" onClick={generateList}>
            <Plus className="h-4 w-4 mr-2" />
            Generate Materials List
          </Button>
        </CardContent>
      </Card>

      {materials.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Materials for {project}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {materials.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Checkbox id={`item-${i}`} />
                  <label htmlFor={`item-${i}`} className="flex-1 cursor-pointer">
                    {item}
                  </label>
                  <Button size="sm">Add to Cart</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
