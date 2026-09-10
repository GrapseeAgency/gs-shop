import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Category mapping for global trends to local categories
const CATEGORY_MAPPING: Record<string, { name: string; keywords: string[] }> = {
  'app': { name: 'Apps & Software', keywords: ['app', 'mobile', 'ios', 'android', 'application'] },
  'web-development': { name: 'Web Development', keywords: ['web', 'javascript', 'typescript', 'react', 'vue', 'angular', 'nextjs', 'frontend'] },
  'devops': { name: 'DevOps & Cloud', keywords: ['devops', 'docker', 'kubernetes', 'aws', 'cloud', 'ci/cd', 'infrastructure'] },
  'design': { name: 'Design Tools', keywords: ['design', 'ui', 'ux', 'figma', 'sketch', 'adobe', 'graphic'] },
}

interface TrendingItem {
  rank: number
  title: string
  category: string
  categoryName: string
  source: string
  trendScore: number
  description: string
  url: string
  localProducts: any[]
}

/**
 * Fetch trending repositories from GitHub API
 * Categories: Apps, Web Dev, DevOps, Design
 */
async function fetchGitHubTrending(): Promise<TrendingItem[]> {
  try {
    const topics = ['web', 'devops', 'design', 'app']
    const items: TrendingItem[] = []
    
    for (const topic of topics) {
      const response = await fetch(
        `https://api.github.com/search/repositories?q=topic:${topic}+stars:>100&sort=stars&order=desc&per_page=5`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Grapsee-Shop'
          }
        }
      )
      
      if (!response.ok) continue
      
      const data = await response.json()
      
      data.items?.forEach((repo: any, index: number) => {
        const category = topic === 'web' ? 'web-development' : topic === 'app' ? 'app' : topic
        const mappedCategory = CATEGORY_MAPPING[category] || { name: 'General', keywords: [] }
        
        items.push({
          rank: items.length + 1,
          title: repo.name,
          category: category,
          categoryName: mappedCategory.name,
          source: 'github',
          trendScore: Math.round((repo.stargazers_count / 1000) * 10),
          description: repo.description || `${repo.language || 'Tech'} repository`,
          url: repo.html_url,
          localProducts: []
        })
      })
    }
    
    return items.slice(0, 5)
  } catch (error) {
    console.error('GitHub API error:', error)
    return []
  }
}

/**
 * Fetch trending questions from Stack Exchange API
 * Categories: Web Dev, DevOps, Design
 */
async function fetchStackExchangeTrending(): Promise<TrendingItem[]> {
  try {
    const tags = ['react', 'devops', 'css', 'javascript']
    const items: TrendingItem[] = []
    
    for (const tag of tags) {
      const response = await fetch(
        `https://api.stackexchange.com/2.3/questions?order=desc&sort=votes&tagged=${tag}&site=stackoverflow&pagesize=3`
      )
      
      if (!response.ok) continue
      
      const data = await response.json()
      
      data.items?.forEach((question: any) => {
        const category = tag === 'react' || tag === 'javascript' || tag === 'css' ? 'web-development' : 
                        tag === 'devops' ? 'devops' : 'web-development'
        const mappedCategory = CATEGORY_MAPPING[category] || { name: 'General', keywords: [] }
        
        items.push({
          rank: items.length + 1,
          title: question.title.substring(0, 50),
          category: category,
          categoryName: mappedCategory.name,
          source: 'stackexchange',
          trendScore: Math.min(question.score * 2, 100),
          description: `Trending question about ${tag}`,
          url: question.link,
          localProducts: []
        })
      })
    }
    
    return items.slice(0, 3)
  } catch (error) {
    console.error('Stack Exchange API error:', error)
    return []
  }
}

/**
 * Map global trending items to local products
 */
async function mapToLocalProducts(items: TrendingItem[]): Promise<TrendingItem[]> {
  try {
    // Get local category IDs from mapping
    const categoryKeywords = items.map(item => {
      const mapping = CATEGORY_MAPPING[item.category]
      return mapping?.keywords || []
    }).flat()
    
    // Find local products matching these categories/keywords
    // Note: SQLite doesn't support mode: 'insensitive', using lowercase comparison instead
    const localProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { tags: { contains: categoryKeywords.join('|') } },
          { name: { contains: categoryKeywords.join('|') } },
          { description: { contains: categoryKeywords.join('|') } }
        ]
      },
      take: 20,
      select: {
        id: true,
        name: true,
        price: true,
        imageUrl: true,
        slug: true,
        rating: true
      }
    })
    
    // Attach matching products to each trending item
    return items.map(item => {
      const mapping = CATEGORY_MAPPING[item.category]
      const keywords = mapping?.keywords || []
      
      const matchingProducts = localProducts.filter(product => {
        const searchText = `${product.name} ${(product as any)?.tags || ''}`.toLowerCase()
        return keywords.some(kw => searchText.includes(kw.toLowerCase()))
      }).slice(0, 3)
      
      return {
        ...item,
        localProducts: matchingProducts
      }
    })
  } catch (error) {
    console.error('Product mapping error:', error)
    return items
  }
}

/**
 * GET /api/trending-now
 * Returns top 10 globally trending digital products
 * Sources: GitHub, Stack Exchange (cache-only, no DB storage)
 */
export async function GET(request: NextRequest) {
  try {
    // Fetch from multiple sources
    const [githubTrends, stackexchangeTrends] = await Promise.all([
      fetchGitHubTrending(),
      fetchStackExchangeTrending()
    ])
    
    // Combine and rank
    let allTrends = [...githubTrends, ...stackexchangeTrends]
    
    // Sort by trend score
    allTrends.sort((a, b) => b.trendScore - a.trendScore)
    
    // Take top 10
    allTrends = allTrends.slice(0, 10)
    
    // Re-assign ranks
    allTrends = allTrends.map((item, index) => ({
      ...item,
      rank: index + 1
    }))
    
    // Map to local products
    const trendsWithProducts = await mapToLocalProducts(allTrends)
    
    // If no trends found, return empty (silent)
    if (trendsWithProducts.length === 0) {
      return NextResponse.json({
        success: true,
        trending: [],
        message: 'No trending products available',
        lastUpdated: new Date().toISOString(),
        sources: []
      })
    }
    
    return NextResponse.json({
      success: true,
      trending: trendsWithProducts,
      lastUpdated: new Date().toISOString(),
      sources: ['github', 'stackexchange']
    })
    
  } catch (error) {
    console.error('Trending now error:', error)
    // Return empty on error (silent)
    return NextResponse.json({
      success: true,
      trending: [],
      message: 'Unable to fetch trending products',
      lastUpdated: new Date().toISOString(),
      sources: []
    })
  }
}
