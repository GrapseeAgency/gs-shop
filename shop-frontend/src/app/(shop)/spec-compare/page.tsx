'use client'

import { useState } from 'react'
import { Scale, Smartphone, Cpu, Camera, Battery } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function SpecComparePage() {
  const [products] = useState([
    {
      name: 'Phone A',
      specs: { processor: 'Snapdragon 8', camera: '108MP', battery: '5000mAh', display: '6.7" AMOLED' },
      price: 29999,
    },
    {
      name: 'Phone B',
      specs: { processor: 'Dimensity 9000', camera: '64MP', battery: '4500mAh', display: '6.5" LCD' },
      price: 24999,
    },
  ])

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Scale className="h-8 w-8 text-blue-600" />
          Spec Compare
        </h1>
        <p className="text-muted-foreground">
          Compare 2 phones  processor/camera/battery specs side-by-side
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {products.map((product, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                {product.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{product.specs.processor}</span>
              </div>
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{product.specs.camera}</span>
              </div>
              <div className="flex items-center gap-2">
                <Battery className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{product.specs.battery}</span>
              </div>
              <div className="border-t pt-3">
                <p className="text-xl font-bold">{product.price}</p>
                <Button size="sm" className="w-full mt-2">Buy Now</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Comparison Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Spec</th>
                <th className="text-left py-2">{products[0].name}</th>
                <th className="text-left py-2">{products[1].name}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2">Processor</td>
                <td>{products[0].specs.processor}</td>
                <td>{products[1].specs.processor}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">Camera</td>
                <td>{products[0].specs.camera} <Badge className="bg-green-500">Better</Badge></td>
                <td>{products[1].specs.camera}</td>
              </tr>
              <tr>
                <td className="py-2">Price</td>
                <td>{products[0].price}</td>
                <td>{products[1].price} <Badge className="bg-green-500">Lower</Badge></td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
