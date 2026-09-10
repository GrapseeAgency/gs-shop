'use client'

import { useState } from 'react'
import { Camera, BadgeCheck, Heart, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function VerifiedPhotosPage() {
  const [photos] = useState([
    { user: 'Rahul M.', verified: true, likes: 24, product: 'iPhone 15' },
    { user: 'Priya K.', verified: true, likes: 18, product: 'Samsung S24' },
    { user: 'Amit S.', verified: false, likes: 5, product: 'OnePlus 12' },
  ])

  const uploadPhoto = () => {
    toast.success('Photo uploaded for verification!')
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Camera className="h-8 w-8 text-blue-600" />
          Verified Photos
        </h1>
        <p className="text-muted-foreground">
          Only real buyers can upload photos. Verified by purchase.
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground mb-2">Upload your product photo</p>
            <p className="text-xs text-muted-foreground mb-4">Only verified buyers can upload</p>
            <Button onClick={uploadPhoto}>
              <Camera className="h-4 w-4 mr-2" />
              Upload Photo
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {photos.map((photo, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-16 w-16 bg-muted rounded-lg" />
                  <div>
                    <p className="font-medium">{photo.product}</p>
                    <p className="text-sm text-muted-foreground">by {photo.user}</p>
                  </div>
                </div>
                <div className="text-right">
                  {photo.verified && (
                    <Badge className="bg-blue-500 mb-1">
                      <BadgeCheck className="h-3 w-3 mr-1" />
                      Verified Buyer
                    </Badge>
                  )}
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Heart className="h-4 w-4" />
                    <span>{photo.likes}</span>
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
