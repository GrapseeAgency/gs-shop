'use client'

import { useEffect, useState } from 'react'
import { Type, Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function FontSizeControl() {
  const [fontSize, setFontSize] = useState<'small' | 'normal' | 'large'>('normal')

  useEffect(() => {
    // Load saved preference
    const saved = localStorage.getItem('fontSize') as 'small' | 'normal' | 'large'
    if (saved) {
      setFontSize(saved)
      applyFontSize(saved)
    }
  }, [])

  const applyFontSize = (size: 'small' | 'normal' | 'large') => {
    const sizes = {
      small: '14px',
      normal: '16px',
      large: '18px'
    }
    document.documentElement.style.fontSize = sizes[size]
  }

  const handleChange = (newSize: 'small' | 'normal' | 'large') => {
    setFontSize(newSize)
    applyFontSize(newSize)
    localStorage.setItem('fontSize', newSize)

    // Sync with server if logged in
    fetch('/api/user/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fontSize: newSize })
    }).catch(() => {})

    toast.success(`Font size set to ${newSize}`)
  }

  return (
    <div className="flex items-center gap-2">
      <Type className="h-4 w-4 text-muted-foreground" />
      <Button
        variant={fontSize === 'small' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleChange('small')}
      >
        <Minus className="h-3 w-3" />
      </Button>
      <Button
        variant={fontSize === 'normal' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleChange('normal')}
      >
        A
      </Button>
      <Button
        variant={fontSize === 'large' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleChange('large')}
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  )
}
