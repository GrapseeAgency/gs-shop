'use client'

import { useEffect, useState } from 'react'
import { MessageSquare, Plus, ThumbsUp, Eye, Pin, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import Link from 'next/link'

const CATEGORIES = [
  { id: 'all', name: 'All Topics' },
  { id: 'general', name: 'General' },
  { id: 'tech', name: 'Technology' },
  { id: 'design', name: 'Design' },
  { id: 'business', name: 'Business' },
  { id: 'help', name: 'Help & Support' }
]

export default function ForumPage() {
  const [topics, setTopics] = useState<any[]>([])
  const [category, setCategory] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTopics()
  }, [category])

  const fetchTopics = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/forum?category=${category}`)
      if (res.ok) {
        const data = await res.json()
        setTopics(data.topics)
      }
    } catch (error) {
      toast.error('Failed to load forum topics')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="h-6 w-6" />
          Community Forum
        </h1>
        <p className="text-muted-foreground">
          Join the discussion, ask questions, and share knowledge
        </p>
      </div>

      {/* New Topic Button */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              variant={category === cat.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCategory(cat.id)}
            >
              {cat.name}
            </Button>
          ))}
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Topic
        </Button>
      </div>

      {/* Topics List */}
      <div className="space-y-4">
        {loading ? (
          [1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2 animate-pulse" />
                <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
              </CardContent>
            </Card>
          ))
        ) : topics.length > 0 ? (
          topics.map((topic) => (
            <Card key={topic.id} className={topic.isPinned ? 'border-amber-500/30' : ''}>
              <CardContent className="p-4">
                <Link href={`/forum/${topic.id}`} className="block">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {(topic.authorId || 'A').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {topic.isPinned && (
                          <Badge variant="secondary" className="gap-1">
                            <Pin className="h-3 w-3" />
                            Pinned
                          </Badge>
                        )}
                        <Badge variant="outline">{topic.category}</Badge>
                        <h3 className="font-semibold truncate">{topic.title}</h3>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {topic.content.substring(0, 150)}...
                      </p>
                      
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {topic.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {topic.replies}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          {topic.likes}
                        </span>
                        <span></span>
                        <span>{new Date(topic.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No topics yet. Start the conversation!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
