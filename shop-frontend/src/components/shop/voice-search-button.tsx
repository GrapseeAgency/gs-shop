'use client'

import { useState, useRef } from 'react'
import { Mic, MicOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface VoiceSearchButtonProps {
  onResults: (results: any[], transcript: string) => void
}

export function VoiceSearchButton({ onResults }: VoiceSearchButtonProps) {
  const [isListening, setIsListening] = useState(false)
  const [loading, setLoading] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        await processAudio(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsListening(true)
      toast.info('Listening... Speak now')

      // Auto stop after 5 seconds
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          stopListening()
        }
      }, 5000)
    } catch (error) {
      toast.error('Microphone access denied')
    }
  }

  const stopListening = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    setIsListening(false)
  }

  const processAudio = async (audioBlob: Blob) => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob)

      const res = await fetch('/api/voice-search', {
        method: 'POST',
        body: formData
      })

      if (res.ok) {
        const data = await res.json()
        onResults(data.results, data.transcript)
        toast.success(`Found results for "${data.transcript}"`)
      } else {
        toast.error('Failed to process voice search')
      }
    } catch (error) {
      toast.error('Voice search failed')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Button variant="outline" size="icon" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    )
  }

  return (
    <Button
      variant={isListening ? 'destructive' : 'outline'}
      size="icon"
      onClick={isListening ? stopListening : startListening}
      className={isListening ? 'animate-pulse' : ''}
    >
      {isListening ? (
        <MicOff className="h-4 w-4" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </Button>
  )
}

