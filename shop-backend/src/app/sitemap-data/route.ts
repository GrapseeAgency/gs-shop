import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Fetch all data in parallel for sitemap construction
    const [categories, products, collections, blogPosts, helpArticles, brands] =
      await Promise.all([
        prisma.category.findMany({ where: { /* active */ }, select: { id: true, name: true, slug: true, updatedAt: true } }),
        prisma.product.findMany({ where: { isActive: true }, select: { id: true, name: true, slug: true, updatedAt: true, categoryId: true } }),
        prisma.collection.findMany({ select: { id: true, title: true, type: true, updatedAt: true } }),
        prisma.blogPost.findMany({ where: { isPublished: true }, select: { id: true, slug: true, title: true, category: true, updatedAt: true } }),
        prisma.helpArticle.findMany({ where: { isPublished: true }, select: { id: true, slug: true, title: true, category: true, updatedAt: true } }),
        prisma.brand.findMany({ where: { isActive: true }, select: { id: true, name: true, slug: true } }),
      ])

    // Static routes with their metadata
    const staticRoutes = [
      { path: '/', name: 'Home', priority: 1.0, changefreq: 'daily', section: 'main' },
      { path: '/about', name: 'About Us', priority: 0.7, changefreq: 'monthly', section: 'info' },
      { path: '/contact', name: 'Contact', priority: 0.7, changefreq: 'monthly', section: 'info' },
      { path: '/privacy', name: 'Privacy Policy', priority: 0.3, changefreq: 'yearly', section: 'legal' },
      { path: '/terms', name: 'Terms of Service', priority: 0.3, changefreq: 'yearly', section: 'legal' },
      { path: '/deals', name: 'Flash Deals', priority: 0.9, changefreq: 'daily', section: 'shopping' },
      { path: '/luxury', name: 'Premium Zone', priority: 0.8, changefreq: 'weekly', section: 'shopping' },
      { path: '/wishlist', name: 'Wishlist', priority: 0.6, changefreq: 'weekly', section: 'user' },
      { path: '/cart', name: 'Cart', priority: 0.6, changefreq: 'always', section: 'user' },
      { path: '/checkout', name: 'Checkout', priority: 0.6, changefreq: 'always', section: 'user' },
      { path: '/profile', name: 'Profile', priority: 0.5, changefreq: 'monthly', section: 'user' },
      { path: '/settings', name: 'Settings', priority: 0.4, changefreq: 'monthly', section: 'user' },
      { path: '/orders', name: 'My Orders', priority: 0.6, changefreq: 'weekly', section: 'user' },
      { path: '/rewards', name: 'Rewards', priority: 0.7, changefreq: 'weekly', section: 'loyalty' },
      { path: '/spin-win', name: 'Spin & Win', priority: 0.8, changefreq: 'weekly', section: 'loyalty' },
      { path: '/auctions', name: 'Auctions', priority: 0.8, changefreq: 'daily', section: 'shopping' },
      { path: '/collections', name: 'Collections', priority: 0.8, changefreq: 'weekly', section: 'shopping' },
      { path: '/blog', name: 'Blog', priority: 0.7, changefreq: 'weekly', section: 'content' },
      { path: '/help', name: 'Help Center', priority: 0.6, changefreq: 'monthly', section: 'support' },
      { path: '/compare', name: 'Compare Products', priority: 0.5, changefreq: 'weekly', section: 'shopping' },
      { path: '/recently-viewed', name: 'Recently Viewed', priority: 0.4, changefreq: 'daily', section: 'user' },
      { path: '/returns', name: 'Returns', priority: 0.5, changefreq: 'monthly', section: 'support' },
      { path: '/brands', name: 'Brands', priority: 0.6, changefreq: 'monthly', section: 'shopping' },
    ]

    // Dynamic category routes
    const categoryRoutes = categories.map((cat) => ({
      path: `/category/${cat.slug}`,
      name: cat.name,
      priority: 0.8,
      changefreq: 'weekly',
      section: 'categories',
      lastModified: cat.updatedAt?.toISOString(),
    }))

    // Dynamic product routes
    const productRoutes = products.map((prod) => ({
      path: `/product/${prod.id}`,
      name: prod.name,
      priority: 0.7,
      changefreq: 'weekly',
      section: 'products',
      lastModified: prod.updatedAt?.toISOString(),
      categoryId: prod.categoryId,
    }))

    // Blog post routes
    const blogRoutes = blogPosts.map((post) => ({
      path: `/blog/${post.slug}`,
      name: post.title,
      priority: 0.6,
      changefreq: 'monthly',
      section: 'blog-posts',
      lastModified: post.updatedAt?.toISOString(),
      category: post.category,
    }))

    // Help article routes
    const helpRoutes = helpArticles.map((article) => ({
      path: `/help/${article.slug}`,
      name: article.title,
      priority: 0.5,
      changefreq: 'monthly',
      section: 'help-articles',
      lastModified: article.updatedAt?.toISOString(),
      category: article.category,
    }))

    // Collection routes
    const collectionRoutes = collections.map((col) => ({
      path: `/collections/${col.id}`,
      name: col.title,
      priority: 0.6,
      changefreq: 'weekly',
      section: 'collections',
      lastModified: col.updatedAt?.toISOString(),
      type: col.type,
    }))

    // Group everything by section for organized display
    const sections = {
      main: { label: ' Main Pages', routes: staticRoutes.filter((r) => r.section === 'main') },
      shopping: { label: ' Shopping', routes: staticRoutes.filter((r) => r.section === 'shopping') },
      categories: { label: ' Categories', routes: categoryRoutes },
      products: { label: ' Products', routes: productRoutes },
      collections: { label: ' Collections', routes: collectionRoutes },
      content: { label: ' Content', routes: staticRoutes.filter((r) => r.section === 'content') },
      'blog-posts': { label: ' Blog Posts', routes: blogRoutes },
      support: { label: ' Support', routes: staticRoutes.filter((r) => r.section === 'support') },
      'help-articles': { label: ' Help Articles', routes: helpRoutes },
      user: { label: ' User', routes: staticRoutes.filter((r) => r.section === 'user') },
      loyalty: { label: ' Loyalty', routes: staticRoutes.filter((r) => r.section === 'loyalty') },
      info: { label: ' Information', routes: staticRoutes.filter((r) => r.section === 'info') },
      legal: { label: ' Legal', routes: staticRoutes.filter((r) => r.section === 'legal') },
    }

    // Calculate stats
    const totalRoutes =
      staticRoutes.length +
      categoryRoutes.length +
      productRoutes.length +
      blogRoutes.length +
      helpRoutes.length +
      collectionRoutes.length

    return NextResponse.json({
      success: true,
      sections,
      stats: {
        totalRoutes,
        staticRoutes: staticRoutes.length,
        categoryRoutes: categoryRoutes.length,
        productRoutes: productRoutes.length,
        blogRoutes: blogRoutes.length,
        helpRoutes: helpRoutes.length,
        collectionRoutes: collectionRoutes.length,
        brandCount: brands.length,
        lastGenerated: new Date().toISOString(),
      },
      meta: {
        title: ' Sitemap',
        description: 'Complete directory of all pages on Grapsee Shop',
      },
    })
  } catch (error) {
    console.error('[SITEMAP-DATA] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate sitemap data' },
      { status: 500 }
    )
  }
}
