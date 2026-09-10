'use client'

import { useState } from 'react'
import { GraduationCap, Backpack, CheckSquare, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function SchoolSuppliesPage() {
  const [grade, setGrade] = useState('5')
  const [schoolName, setSchoolName] = useState('')
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const generateList = async () => {
    setLoading(true)
    
    // [] items for grade
    setTimeout(() => {
      setItems([])
      setLoading(false)
      toast.success(`Generated list for Grade ${grade}`)
    }, 1000)
  }

  const toggleItem = (id: number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ))
  }

  const addToCart = () => {
    const selected = items.filter(i => i.checked)
    toast.success(`${selected.length} items added to cart!`)
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <GraduationCap className="h-8 w-8 text-blue-600" />
          School Supply Kit
        </h1>
        <p className="text-muted-foreground">
          Complete school supplies list based on grade level
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Grade/Class</label>
              <select 
                className="w-full p-2 border rounded-md mt-1"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
              >
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(g => (
                  <option key={g} value={g}>Grade {g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">School Name (Optional)</label>
              <Input 
                placeholder="Enter school name"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
              />
            </div>
          </div>
          <Button 
            className="w-full" 
            onClick={generateList}
            disabled={loading}
          >
            {loading ? 'Generating...' : <><Backpack className="h-4 w-4 mr-2" /> Generate Supply List</>}
          </Button>
        </CardContent>
      </Card>

      {items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Grade {grade} Supply List
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {items.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer"
                  onClick={() => toggleItem(item.id)}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox checked={item.checked} />
                    <span className={item.checked ? 'line-through text-muted-foreground' : ''}>
                      {item.name}
                    </span>
                    {item.required && (
                      <Badge variant="secondary" className="text-xs">Required</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Button 
              className="w-full mt-4" 
              size="lg"
              onClick={addToCart}
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              Add {items.filter(i => i.checked).length} Items to Cart
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
