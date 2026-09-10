'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Heart, Github, Globe, Users, Star, GitFork, ArrowLeft, ArrowRight, Plus, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface OpenSourceProject {
  id: string
  name: string
  description: string
  language: string
  stars: number
  forks: number
  contributors: number
  fundingGoal: number
  currentFunding: number
  githubUrl: string
  websiteUrl?: string
  tags: string[]
  maintainer: string
  avatar: string
}

interface FundedProject {
  id: string
  projectId: string
  projectName: string
  amount: number
  fundedAt: string
}

const featuredProjects: OpenSourceProject[] = [
  {
    id: 'react-query',
    name: 'TanStack Query',
    description: 'Powerful asynchronous state management for TS/JS, React, Solid, Vue and Svelte',
    language: 'TypeScript',
    stars: 42000,
    forks: 2800,
    contributors: 350,
    fundingGoal: 50000,
    currentFunding: 42300,
    githubUrl: 'https://github.com/TanStack/query',
    websiteUrl: 'https://tanstack.com/query',
    tags: ['React', 'State Management', 'Async'],
    maintainer: 'Tanner Linsley',
    avatar: 'https://avatars.githubusercontent.com/u/5580297'
  },
  {
    id: 'nextjs',
    name: 'Next.js',
    description: 'The React Framework for the Web. Used by some of the world\'s largest companies',
    language: 'TypeScript',
    stars: 123000,
    forks: 26000,
    contributors: 2800,
    fundingGoal: 100000,
    currentFunding: 89000,
    githubUrl: 'https://github.com/vercel/next.js',
    websiteUrl: 'https://nextjs.org',
    tags: ['Framework', 'React', 'Full-Stack'],
    maintainer: 'Vercel Team',
    avatar: 'https://avatars.githubusercontent.com/u/14985020'
  },
  {
    id: 'prisma',
    name: 'Prisma',
    description: 'new ORM for Node.js & TypeScript | PostgreSQL, MySQL, MariaDB, SQL Server, SQLite, MongoDB',
    language: 'TypeScript',
    stars: 38000,
    forks: 1500,
    contributors: 420,
    fundingGoal: 75000,
    currentFunding: 61200,
    githubUrl: 'https://github.com/prisma/prisma',
    websiteUrl: 'https://www.prisma.io',
    tags: ['Database', 'ORM', 'TypeScript'],
    maintainer: 'Prisma Team',
    avatar: 'https://avatars.githubusercontent.com/u/17219288'
  },
  {
    id: 'tailwind',
    name: 'Tailwind CSS',
    description: 'A utility-first CSS framework for rapid UI development',
    language: 'CSS',
    stars: 81000,
    forks: 4000,
    contributors: 280,
    fundingGoal: 60000,
    currentFunding: 54700,
    githubUrl: 'https://github.com/tailwindlabs/tailwindcss',
    websiteUrl: 'https://tailwindcss.com',
    tags: ['CSS', 'UI', 'Design'],
    maintainer: 'Adam Wathan',
    avatar: 'https://avatars.githubusercontent.com/u/4323180'
  },
  {
    id: 'supabase',
    name: 'Supabase',
    description: 'The open source Firebase alternative. Instantly add a backend to your apps',
    language: 'TypeScript',
    stars: 65000,
    forks: 3200,
    contributors: 450,
    fundingGoal: 80000,
    currentFunding: 72300,
    githubUrl: 'https://github.com/supabase/supabase',
    websiteUrl: 'https://supabase.com',
    tags: ['Backend', 'Database', 'Auth'],
    maintainer: 'Supabase Team',
    avatar: 'https://avatars.githubusercontent.com/u/54469796'
  },
  {
    id: 'shadcn',
    name: 'shadcn/ui',
    description: 'Beautifully designed components built with Radix UI and Tailwind CSS',
    language: 'TypeScript',
    stars: 52000,
    forks: 2800,
    contributors: 180,
    fundingGoal: 40000,
    currentFunding: 32100,
    githubUrl: 'https://github.com/shadcn-ui/ui',
    websiteUrl: 'https://ui.shadcn.com',
    tags: ['UI', 'Components', 'React'],
    maintainer: 'shadcn',
    avatar: 'https://avatars.githubusercontent.com/u/124599'
  }
]

const fundingTiers = [
  { amount: 500, label: 'Supporter', badge: '', description: 'Show your appreciation' },
  { amount: 1000, label: 'Contributor', badge: '', description: 'Help with bug fixes' },
  { amount: 2500, label: 'Sponsor', badge: '', description: 'Fund new features' },
  { amount: 5000, label: 'Champion', badge: '', description: 'Major impact support' }
]

export default function OpenSourcePage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [fundedProjects, setFundedProjects] = useState<FundedProject[]>([])
  const [totalContributed, setTotalContributed] = useState(0)

  useEffect(() => {
    // Fetch user's funded projects
    const fetchFunded = async () => {
      if (!session) return
      try {
        const res = await fetch('/api/open-source/funded')
        if (res.ok) {
          const data = await res.json()
          setFundedProjects(data.projects || [])
          setTotalContributed(data.total || 0)
        }
      } catch {
        // Silent fail
      }
    }
    fetchFunded()
  }, [session])

  const handleFund = async () => {
    if (!session) {
      toast.error('Please sign in to fund projects')
      return
    }

    if (!selectedProject || !selectedAmount) {
      toast.error('Please select a project and amount')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/open-source/fund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject,
          amount: selectedAmount
        })
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Thank you for supporting open source!', {
          description: `${selectedAmount} contributed to ${data.projectName}`
        })
        setSelectedProject(null)
        setSelectedAmount(null)
        // Refresh funded projects
        const refreshRes = await fetch('/api/open-source/funded')
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json()
          setFundedProjects(refreshData.projects || [])
          setTotalContributed(refreshData.total || 0)
        }
      } else {
        toast.error(data.error || 'Contribution failed')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k'
    }
    return num.toString()
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
            <Heart className="h-6 w-6 text-green-500" />
            <h1 className="text-lg font-bold">Open Source Support</h1>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Hero Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full">
            <Heart className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-green-600">Support the tools we all depend on</span>
          </div>
          <p className="text-muted-foreground text-sm">
            Every purchase you make helps fund the open source projects that power modern development. 
            Together, we keep the ecosystem thriving.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-green-600">{totalContributed.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Your total contributions</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-500/20">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-blue-600">{fundedProjects.length}</p>
              <p className="text-xs text-muted-foreground">Projects funded</p>
            </CardContent>
          </Card>
        </div>

        {/* Recently Funded */}
        {fundedProjects.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Your Contributions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {fundedProjects.slice(0, 3).map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                    <span className="text-sm font-medium">{project.projectName}</span>
                    <Badge variant="secondary">{project.amount}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Featured Projects */}
        <div>
          <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
            <Github className="h-5 w-5" />
            Featured Projects
          </h2>
          <div className="space-y-3">
            {featuredProjects.map((project) => {
              const isFunded = fundedProjects.some(p => p.projectId === project.id)
              const isSelected = selectedProject === project.id
              
              return (
                <Card 
                  key={project.id}
                  className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : ''} ${isFunded ? 'border-green-500/50' : ''}`}
                  onClick={() => setSelectedProject(project.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <img 
                          src={project.avatar} 
                          alt={project.maintainer}
                          className="w-8 h-8 rounded-full"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://github.com/github.png'
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base truncate">{project.name}</CardTitle>
                          {isFunded && (
                            <Badge className="bg-green-500 text-white text-xs">Funded</Badge>
                          )}
                        </div>
                        <CardDescription className="line-clamp-2 text-xs">
                          {project.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        {formatNumber(project.stars)}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitFork className="h-4 w-4 text-muted-foreground" />
                        {formatNumber(project.forks)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {formatNumber(project.contributors)}
                      </span>
                    </div>

                    {/* Funding Progress */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Funding Progress</span>
                        <span className="font-medium">
                          {project.currentFunding.toLocaleString()} / {project.fundingGoal.toLocaleString()}
                        </span>
                      </div>
                      <Progress 
                        value={(project.currentFunding / project.fundingGoal) * 100} 
                        className="h-2"
                      />
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {project.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Funding Options */}
                    {isSelected && (
                      <div className="pt-2 border-t space-y-2">
                        <p className="text-sm font-medium">Select contribution amount:</p>
                        <div className="grid grid-cols-2 gap-2">
                          {fundingTiers.map((tier) => (
                            <Button
                              key={tier.amount}
                              variant={selectedAmount === tier.amount ? 'default' : 'outline'}
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedAmount(tier.amount)
                              }}
                              className="justify-start"
                            >
                              <span className="mr-1">{tier.badge}</span>
                              <div className="text-left">
                                <p className="text-xs font-bold">{tier.amount}</p>
                                <p className="text-[10px] text-muted-foreground">{tier.label}</p>
                              </div>
                            </Button>
                          ))}
                        </div>
                        <Button 
                          className="w-full" 
                          disabled={!selectedAmount || loading}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleFund()
                          }}
                        >
                          {loading ? 'Processing...' : `Contribute ${selectedAmount || 0}`}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        <Separator />

        {/* Impact Statement */}
        <div className="text-center space-y-2">
          <p className="text-sm font-medium">Why we support open source</p>
          <p className="text-xs text-muted-foreground">
            2% of every purchase goes directly to the projects that make our work possible. 
            Join us in keeping the ecosystem free and accessible for everyone.
          </p>
        </div>
      </div>
    </div>
  )
}
