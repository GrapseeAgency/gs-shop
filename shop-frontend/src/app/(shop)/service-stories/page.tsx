'use client'

import { useEffect, useState } from 'react'
import { Play, Clock, Eye } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'

interface ServiceStory {
  id: string
  sellerId: string
  productId: string
  mediaUrl: string
  mediaType: string
  caption?: string
  views: number
  createdAt: string
  expiresAt: string
  seller?: {
    name: string
    avatar?: string
  }
}

export default function ServiceStoriesPage() {
  const [stories, setStories] = useState<ServiceStory[]>([])
  const [activeStory, setActiveStory] = useState<ServiceStory | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStories()
  }, [])

  const fetchStories = async () => {
    try {
      const res = await fetch('/api/service-stories')
      if (res.ok) {
        const data = await res.json()
        setStories(data.stories)
      }
    } catch (error) {
      toast.error('Failed to load stories')
    } finally {
      setLoading(false)
    }
  }

  const handleViewStory = (story: ServiceStory) => {
    setActiveStory(story)
    // Increment views
    fetch(`/api/service-stories/${story.id}/view`, { method: 'POST' }).catch(() => {})
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 w-16 rounded-full bg-muted animate-pulse flex-shrink-0" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Service Stories</h1>
        <p className="text-muted-foreground">Behind-the-scenes from our sellers (24h)</p>
      </div>

      {/* Stories Row */}
      <div className="flex gap-4 overflow-x-auto pb-4 mb-8">
        {stories.map((story) => (
          <button
            key={story.id}
            onClick={() => handleViewStory(story)}
            className="flex-shrink-0 group"
          >
            <div className="relative">
              <div className="h-16 w-16 rounded-full p-0.5 bg-gradient-to-br from-emerald-500 to-teal-500">
                <Avatar className="h-full w-full border-2 border-background">
                  <AvatarFallback>
                    {story.seller?.name?.charAt(0) || 'S'}
                  </AvatarFallback>
                </Avatar>
              </div>
              {story.mediaType === 'video' && (
                <div className="absolute bottom-0 right-0 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                  <Play className="h-3 w-3 fill-current" />
                </div>
              )}
            </div>
            <p className="text-xs text-center mt-1 truncate w-16">
              {story.seller?.name || 'Seller'}
            </p>
          </button>
        ))}
      </div>

      {/* All Stories Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stories.map((story) => (
          <Card 
            key={story.id} 
            className="overflow-hidden cursor-pointer hover:shadow-lg transition-all"
            onClick={() => handleViewStory(story)}
          >
            <div className="aspect-square bg-muted relative">
              {story.mediaType === 'video' ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play className="h-12 w-12 text-white/80" />
                </div>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20" />
              )}
              <div className="absolute bottom-2 left-2 right-2">
                <div className="flex items-center gap-2 text-white text-xs">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-[10px]">
                      {story.seller?.name?.charAt(0) || 'S'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">{story.seller?.name}</span>
                </div>
              </div>
              <div className="absolute top-2 right-2 flex items-center gap-1 text-white/80 text-xs">
                <Eye className="h-3 w-3" />
                {story.views}
              </div>
            </div>
            {story.caption && (
              <CardContent className="p-3">
                <p className="text-sm line-clamp-2">{story.caption}</p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Expires in {Math.ceil((new Date(story.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60))}h
                </p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {stories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No stories available right now</p>
        </div>
      )}
    </div>
  )
}
