import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

const collectionProducts: Record<string, Array<{
  id: string; name: string; slug: string; description: string;
  price: number; comparePrice: number | null; imageUrl: string | null;
  category: { name: string; slug: string };
}>> = {
  'col-1': [
    { id: 'p1', name: 'Beach Website Theme', slug: 'beach-website', description: 'Bright and airy website design', price: 899, comparePrice: 1299, imageUrl: null, category: { name: 'Design', slug: 'design' } },
    { id: 'p2', name: 'Social Media Summer Pack', slug: 'social-summer', description: 'Summer social media templates', price: 299, comparePrice: 499, imageUrl: null, category: { name: 'Marketing', slug: 'marketing' } },
    { id: 'p3', name: 'Outdoor App UI Kit', slug: 'outdoor-ui', description: 'Mobile UI kit for outdoor apps', price: 599, comparePrice: null, imageUrl: null, category: { name: 'Mobile', slug: 'mobile' } },
    { id: 'p4', name: 'Summer Email Templates', slug: 'summer-email', description: 'Seasonal email marketing templates', price: 149, comparePrice: 249, imageUrl: null, category: { name: 'Marketing', slug: 'marketing' } },
  ],
  'col-2': [
    { id: 'p5', name: 'Brand Identity Kit', slug: 'brand-identity', description: 'Complete brand identity package', price: 2499, comparePrice: 3500, imageUrl: null, category: { name: 'Design', slug: 'design' } },
    { id: 'p6', name: 'MVP Development Sprint', slug: 'mvp-sprint', description: 'Fast MVP development in 4 weeks', price: 5999, comparePrice: null, imageUrl: null, category: { name: 'Development', slug: 'development' } },
    { id: 'p7', name: 'Landing Page Pro', slug: 'landing-pro', description: 'High-converting landing page', price: 799, comparePrice: 1200, imageUrl: null, category: { name: 'Design', slug: 'design' } },
  ],
  'col-3': [
    { id: 'p8', name: 'Premium Logo Design', slug: 'premium-logo', description: 'Custom logo with brand guidelines', price: 1299, comparePrice: 1800, imageUrl: null, category: { name: 'Design', slug: 'design' } },
    { id: 'p9', name: 'UI/UX Audit', slug: 'uiux-audit', description: 'Comprehensive UX review', price: 2499, comparePrice: null, imageUrl: null, category: { name: 'Design', slug: 'design' } },
    { id: 'p10', name: 'Illustration Pack', slug: 'illustration-pack', description: 'Custom illustration set (20 pieces)', price: 3500, comparePrice: 5000, imageUrl: null, category: { name: 'Design', slug: 'design' } },
  ],
  'col-4': [
    { id: 'p11', name: 'AI Chatbot Builder', slug: 'ai-chatbot', description: 'Custom AI chatbot with NLP', price: 4999, comparePrice: 7500, imageUrl: null, category: { name: 'AI/ML', slug: 'ai-ml' } },
    { id: 'p12', name: 'SEO Power Pack', slug: 'seo-power', description: 'Complete SEO optimization', price: 1899, comparePrice: 2500, imageUrl: null, category: { name: 'Marketing', slug: 'marketing' } },
    { id: 'p13', name: 'Shopify Store Setup', slug: 'shopify-setup', description: 'Full Shopify store configuration', price: 2499, comparePrice: null, imageUrl: null, category: { name: 'E-Commerce', slug: 'ecommerce' } },
  ],
}

const collectionMeta: Record<string, { title: string; description: string; type: string }> = {
  'col-1': { title: 'Summer Essentials', description: 'Everything you need for the perfect summer project.', type: 'seasonal' },
  'col-2': { title: 'Startup Toolkit', description: 'All-in-one packages to launch your startup.', type: 'curated' },
  'col-3': { title: 'Design Mastery', description: 'Premium design services curated by our creative team.', type: 'staff_pick' },
  'col-4': { title: 'Trending Now', description: 'The most popular services this month.', type: 'trending' },
  'col-5': { title: 'E-Commerce Bundle', description: 'Complete e-commerce solutions.', type: 'curated' },
  'col-6': { title: 'AI & Automation', description: 'modern AI services and automation tools.', type: 'trending' },
  'col-7': { title: 'Winter Collection', description: 'Cozy up with our winter-themed services.', type: 'seasonal' },
  'col-8': { title: 'Staff Favorites', description: 'Hand-picked favorites from our team.', type: 'staff_pick' },
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Try DB first
    try {
      const collection = await db.collection.findUnique({ where: { id } })
      if (collection) {
        let products: unknown[] = []
        if (collection.productIds) {
          try {
            const productIds: string[] = JSON.parse(collection.productIds)
            if (productIds.length > 0) {
              products = await db.product.findMany({
                where: { id: { in: productIds } },
                select: { id: true, name: true, slug: true, description: true, price: true, comparePrice: true, imageUrl: true, category: { select: { name: true, slug: true } } },
              })
            }
          } catch { /* ignore */ }
        }
        return NextResponse.json({ ...collection, products, productCount: products.length })
      }
    } catch { /* fall through */ }

    const meta = collectionMeta[id]
    return NextResponse.json({
      id,
      title: meta?.title || 'Collection',
      description: meta?.description || '',
      type: meta?.type || 'curated',
      products: collectionProducts[id] || []
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch collection' }, { status: 500 })
  }
}