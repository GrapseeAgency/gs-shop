'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { BookOpen, Download, Star, Search, Filter, ArrowLeft, FileText, Video, Code, Layers, Zap, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Resource {
  id: string
  title: string
  description: string
  type: 'ebook' | 'template' | 'course' | 'cheatsheet' | 'toolkit'
  category: string
  pointsCost: number
  downloads: number
  rating: number
  fileSize?: string
  duration?: string
  previewUrl?: string
  tags: string[]
}

const categories = []

const resources: Resource[] = [
  {
    id: 'react-patterns',
    title: 'Advanced React Patterns',
    description: 'Master modern React patterns: Compound Components, Render Props, Custom Hooks, and more',
    type: 'ebook',
    category: 'React',
    pointsCost: 500,
    downloads: 2340,
    rating: 4.8,
    fileSize: '2.4 MB',
    tags: ['React', 'Patterns', 'Advanced']
  },
  {
    id: 'nextjs-starter',
    title: 'Next.js 14 Starter Kit',
    description: 'Production-ready starter with App Router, Prisma, NextAuth, Tailwind, and TypeScript',
    type: 'template',
    category: 'Next.js',
    pointsCost: 800,
    downloads: 1890,
    rating: 4.9,
    fileSize: '15 MB',
    tags: ['Next.js', 'Template', 'Full-Stack']
  },
  {
    id: 'api-design',
    title: 'RESTful API Design Masterclass',
    description: '2-hour video course covering best practices for designing scalable APIs',
    type: 'course',
    category: 'Node.js',
    pointsCost: 1200,
    downloads: 567,
    rating: 4.7,
    duration: '2h 15m',
    tags: ['API', 'Backend', 'Design']
  },
  {
    id: 'prisma-cheatsheet',
    title: 'Prisma ORM Cheatsheet',
    description: 'Quick reference for Prisma queries, relations, migrations, and optimization',
    type: 'cheatsheet',
    category: 'Database',
    pointsCost: 200,
    downloads: 4520,
    rating: 4.9,
    fileSize: '1.1 MB',
    tags: ['Prisma', 'Database', 'Reference']
  },
  {
    id: 'tailwind-kit',
    title: 'Tailwind UI Component Kit',
    description: '50+ pre-built components: modals, forms, tables, cards, navigation',
    type: 'template',
    category: 'UI/UX',
    pointsCost: 600,
    downloads: 3210,
    rating: 4.8,
    fileSize: '8.5 MB',
    tags: ['Tailwind', 'UI', 'Components']
  },
  {
    id: 'docker-guide',
    title: 'Docker for Developers',
    description: 'Complete guide to containerizing your applications with Docker & Docker Compose',
    type: 'ebook',
    category: 'DevOps',
    pointsCost: 700,
    downloads: 1456,
    rating: 4.6,
    fileSize: '4.2 MB',
    tags: ['Docker', 'DevOps', 'Deployment']
  },
  {
    id: 'react-native-boilerplate',
    title: 'React Native Expo Boilerplate',
    description: 'Mobile app starter with Expo, TypeScript, Navigation, and common components',
    type: 'template',
    category: 'Mobile',
    pointsCost: 900,
    downloads: 987,
    rating: 4.7,
    fileSize: '12 MB',
    tags: ['React Native', 'Mobile', 'Expo']
  },
  {
    id: 'system-design',
    title: 'System Design Interview Prep',
    description: 'Comprehensive guide for system design interviews with real-world examples',
    type: 'ebook',
    category: 'Backend',
    pointsCost: 1000,
    downloads: 2134,
    rating: 4.8,
    fileSize: '5.8 MB',
    tags: ['System Design', 'Backend', 'Interview']
  },
  {
    id: 'typescript-patterns',
    title: 'TypeScript Design Patterns',
    description: 'Advanced TypeScript patterns for building type-safe applications',
    type: 'ebook',
    category: 'React',
    pointsCost: 550,
    downloads: 1890,
    rating: 4.7,
    fileSize: '3.1 MB',
    tags: ['TypeScript', 'Patterns', 'Type-Safe']
  },
  {
    id: 'ci-cd-toolkit',
    title: 'CI/CD Pipeline Toolkit',
    description: 'GitHub Actions workflows for testing, building, and deploying applications',
    type: 'toolkit',
    category: 'DevOps',
    pointsCost: 750,
    downloads: 876,
    rating: 4.5,
    fileSize: '2.8 MB',
    tags: ['CI/CD', 'GitHub Actions', 'Automation']
  },
  {
    id: 'shadcn-recipes',
    title: 'shadcn/ui Recipe Collection',
    description: '20+ complete page recipes using shadcn/ui components',
    type: 'template',
    category: 'UI/UX',
    pointsCost: 450,
    downloads: 5432,
    rating: 4.9,
    fileSize: '6.2 MB',
    tags: ['shadcn/ui', 'Components', 'Recipes']
  },
  {
    id: 'graphql-course',
    title: 'GraphQL Fundamentals',
    description: 'Learn GraphQL from scratch: schema design, resolvers, Apollo Client',
    type: 'course',
    category: 'Node.js',
    pointsCost: 1100,
    downloads: 765,
    rating: 4.6,
    duration: '3h 30m',
    tags: ['GraphQL', 'API', 'Apollo']
  }
]

const typeIcons = {
  ebook: FileText,
  template: Layers,
  course: Video,
  cheatsheet: Code,
  toolkit: Zap
}

export default function TechLibraryPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [userPoints, setUserPoints] = useState(0)
  const [downloadedResources, setDownloadedResources] = useState<string[]>([])
  const [loading, setLoading] = useState<string | null>(null)

  useEffect(() => {
    // Fetch user points
    const fetchPoints = async () => {
      if (!session) return
      try {
        const res = await fetch('/api/rewards')
        if (res.ok) {
          const data = await res.json()
          setUserPoints(data.points || 0)
        }
      } catch {
        // Silent fail
      }
    }
    fetchPoints()
  }, [session])

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === 'All' || resource.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleDownload = async (resource: Resource) => {
    if (!session) {
      toast.error('Please sign in to download resources')
      return
    }

    if (userPoints < resource.pointsCost) {
      toast.error('Insufficient points', {
        description: `You need ${resource.pointsCost - userPoints} more points`
      })
      return
    }

    if (downloadedResources.includes(resource.id)) {
      toast.info('You already have this resource')
      return
    }

    setLoading(resource.id)

    try {
      const res = await fetch('/api/tech-library/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resourceId: resource.id,
          pointsCost: resource.pointsCost
        })
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Download successful!', {
          description: `${resource.title} added to your library`
        })
        setUserPoints(prev => prev - resource.pointsCost)
        setDownloadedResources(prev => [...prev, resource.id])
      } else {
        toast.error(data.error || 'Download failed')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-yellow-500" />
            <h1 className="text-lg font-bold">Tech Resource Library</h1>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Hero Section */}
        <div className="text-center space-y-2">
          <p className="text-muted-foreground text-sm">
            Premium resources for developers. Use your reward points to access exclusive eBooks, templates, courses, and tools.
          </p>
        </div>

        {/* Points Balance */}
        <Card className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Your Points Balance</p>
                <p className="text-3xl font-bold text-yellow-600">{userPoints.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Star className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Resources Grid */}
        <div className="grid gap-3">
          {filteredResources.map((resource) => {
            const TypeIcon = typeIcons[resource.type]
            const isDownloaded = downloadedResources.includes(resource.id)
            const canAfford = userPoints >= resource.pointsCost

            return (
              <Card key={resource.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <TypeIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base truncate">{resource.title}</CardTitle>
                        {isDownloaded && (
                          <Badge className="bg-green-500 text-white shrink-0">Owned</Badge>
                        )}
                      </div>
                      <CardDescription className="line-clamp-2 text-xs mt-1">
                        {resource.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs">
                      {resource.category}
                    </Badge>
                    {resource.tags.slice(0, 2).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      {resource.downloads.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      {resource.rating}
                    </span>
                    {resource.fileSize && <span>{resource.fileSize}</span>}
                    {resource.duration && <span>{resource.duration}</span>}
                  </div>

                  {/* Action */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-bold">{resource.pointsCost}</span>
                      <span className="text-xs text-muted-foreground">points</span>
                    </div>
                    <Button
                      size="sm"
                      disabled={!canAfford || isDownloaded || loading === resource.id}
                      onClick={() => handleDownload(resource)}
                    >
                      {loading === resource.id ? (
                        'Processing...'
                      ) : isDownloaded ? (
                        'Downloaded'
                      ) : !canAfford ? (
                        'Need Points'
                      ) : (
                        <>
                          Get Now
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredResources.length === 0 && (
          <div className="text-center py-8">
            <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No resources found</p>
            <Button variant="link" onClick={() => { setSearchQuery(''); setSelectedCategory('All') }}>
              Clear filters
            </Button>
          </div>
        )}

        <Separator />

        {/* Earn More Points */}
        <Card className="bg-gradient-to-br from-blue-500/5 to-indigo-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Zap className="h-5 w-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Need more points?</p>
                <p className="text-xs text-muted-foreground">Complete orders, write reviews, and check in daily</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => router.push('/rewards')}>
                Earn Points
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
