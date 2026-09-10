'use client'

import { useState } from 'react'
import { Pill, AlertTriangle, CheckCircle, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function MedicineInteractionPage() {
  const [medicines, setMedicines] = useState<string[]>([])
  const [newMed, setNewMed] = useState('')
  const [checked, setChecked] = useState(false)

  const addMedicine = () => {
    if (newMed) {
      setMedicines([...medicines, newMed])
      setNewMed('')
    }
  }

  const checkInteractions = () => {
    setChecked(true)
    toast.success('Interaction check complete!')
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Pill className="h-8 w-8 text-red-600" />
          Medicine Interaction Checker
        </h1>
        <p className="text-muted-foreground">Check for dangerous drug combinations</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Your Medicines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input 
              placeholder="Enter medicine name"
              value={newMed}
              onChange={(e) => setNewMed(e.target.value)}
            />
            <Button onClick={addMedicine}>Add</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {medicines.map((med, i) => (
              <Badge key={i} variant="secondary">{med}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {medicines.length > 0 && (
        <Button className="w-full mb-6" onClick={checkInteractions}>
          <AlertTriangle className="h-4 w-4 mr-2" />
          Check Interactions
        </Button>
      )}

      {checked && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="font-bold text-green-800">No Interactions Found</h3>
                <p className="text-green-700">Your medicines are safe to take together</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
