'use client'

import { useState, useEffect } from 'react'
import { Gift, Box, Sparkles, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function GiftBoxPage() {
  const [products, setProducts] = useState<any[]>([])
  const [boxes, setBoxes] = useState<any[]>([])
  const [wrapping, setWrapping] = useState<any[]>([])
  const [cards, setCards] = useState<any[]>([])
  
  const [selectedItems, setSelectedItems] = useState<any[]>([])
  const [selectedBox, setSelectedBox] = useState<any>(null)
  const [selectedWrap, setSelectedWrap] = useState<any>(null)
  const [selectedCard, setSelectedCard] = useState<any>(null)
  const [customMessage, setCustomMessage] = useState('')
  const [recipientName, setRecipientName] = useState('')

  useEffect(() => {
    fetchGiftBoxData()
  }, [])

  const fetchGiftBoxData = async () => {
    try {
      const res = await fetch('/api/modular/gift-box-builder')
      if (res.ok) {
        const data = await res.json()
        setProducts(data.products || [])
        setBoxes(data.boxes || [])
        setWrapping(data.wrapping || [])
        setCards(data.cards || [])
      }
    } catch (error) {
      console.error('Error fetching gift box data:', error)
    }
  }

  const addItem = (product: any) => {
    if (selectedItems.length >= 8) {
      toast.error('Maximum 8 items allowed')
      return
    }
    setSelectedItems(prev => [...prev, product])
    toast.success('Item added!')
  }

  const removeItem = (index: number) => {
    setSelectedItems(prev => prev.filter((_, i) => i !== index))
  }

  const buildGiftBox = async () => {
    if (selectedItems.length === 0) {
      toast.error('Please select at least one item')
      return
    }

    try {
      const res = await fetch('/api/modular/gift-box-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: selectedItems,
          box: selectedBox,
          wrapping: selectedWrap,
          card: selectedCard,
          message: customMessage,
          recipient: recipientName
        })
      })

      if (res.ok) {
        toast.success('Your custom gift box is ready!')
      }
    } catch (error) {
      toast.error('Failed to create gift box')
    }
  }

  const itemsTotal = selectedItems.reduce((sum, item) => sum + item.price, 0)
  const boxPrice = selectedBox?.price || 0
  const wrapPrice = selectedWrap?.price || 0
  const cardPrice = 49
  const total = itemsTotal + boxPrice + wrapPrice + cardPrice

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Gift className="h-8 w-8 text-rose-500" />
          Gift Box Builder
        </h1>
        <p className="text-muted-foreground">
          Create the perfect custom gift box with personalized wrapping and message
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Builder */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <span className="bg-primary text-white rounded-full h-6 w-6 flex items-center justify-center text-sm">1</span>
                Select Items ({selectedItems.length}/8)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {products.slice(0, 12).map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addItem(product)}
                    className="p-2 rounded border border-muted hover:border-primary transition-all text-left"
                  >
                    <div className="aspect-square bg-muted rounded mb-2">
                      {product.imageUrl && (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover rounded" />
                      )}
                    </div>
                    <p className="text-xs font-medium truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.price}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Box */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <span className="bg-primary text-white rounded-full h-6 w-6 flex items-center justify-center text-sm">2</span>
                Choose Box
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3">
                {boxes.map((box) => (
                  <button
                    key={box.id}
                    onClick={() => setSelectedBox(box)}
                    className={`p-3 rounded border transition-all ${
                      selectedBox?.id === box.id
                        ? 'border-primary bg-primary/10 ring-2 ring-primary'
                        : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    <Box className="h-8 w-8 mx-auto mb-2" style={{ color: box.color }} />
                    <p className="text-xs font-medium text-center">{box.name}</p>
                    <p className="text-xs text-muted-foreground text-center">{box.price}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Wrapping */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <span className="bg-primary text-white rounded-full h-6 w-6 flex items-center justify-center text-sm">3</span>
                Select Wrapping
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3">
                {wrapping.map((wrap) => (
                  <button
                    key={wrap.id}
                    onClick={() => setSelectedWrap(wrap)}
                    className={`p-3 rounded border transition-all ${
                      selectedWrap?.id === wrap.id
                        ? 'border-primary bg-primary/10 ring-2 ring-primary'
                        : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    <Sparkles className="h-6 w-6 mx-auto mb-2 text-amber-500" />
                    <p className="text-xs font-medium text-center">{wrap.name}</p>
                    <p className="text-xs text-muted-foreground text-center">{wrap.price}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Step 4: Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <span className="bg-primary text-white rounded-full h-6 w-6 flex items-center justify-center text-sm">4</span>
                Personalize Card
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                {cards.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => setSelectedCard(card)}
                    className={`px-3 py-2 rounded border text-sm ${
                      selectedCard?.id === card.id
                        ? 'border-primary bg-primary/10'
                        : 'border-muted'
                    }`}
                  >
                    {card.name}
                  </button>
                ))}
              </div>
              <Input
                placeholder="Recipient's name"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
              />
              <Textarea
                placeholder="Write your personal message..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Your Gift Box</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Selected Items */}
              <div className="space-y-2">
                {selectedItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm truncate">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{item.price}</span>
                      <button onClick={() => removeItem(index)} className="text-red-500"></button>
                    </div>
                  </div>
                ))}
                {selectedItems.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No items selected yet
                  </p>
                )}
              </div>

              {/* Summary */}
              <div className="border-t pt-4 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Items:</span>
                  <span>{itemsTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Box:</span>
                  <span>{boxPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Wrapping:</span>
                  <span>{wrapPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Card:</span>
                  <span>{cardPrice}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total:</span>
                  <span className="text-rose-600">{total}</span>
                </div>
              </div>

              <Button 
                className="w-full" 
                onClick={buildGiftBox}
                disabled={selectedItems.length === 0}
              >
                <Check className="h-4 w-4 mr-2" />
                Create Gift Box
              </Button>

              {selectedItems.length > 0 && selectedBox && selectedWrap && (
                <div className="bg-rose-50 p-3 rounded-lg text-sm">
                  <p className="font-medium text-rose-800">Preview:</p>
                  <p className="text-rose-700">
                    Beautiful {selectedBox.name} containing {selectedItems.length} items, wrapped in {selectedWrap.name} paper
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
