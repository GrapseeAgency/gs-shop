import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminApiKey } from '@/lib/admin-api-auth'
import { logError, logInfo } from '@/lib/logger'

// GET - List all categories with enhanced data
export async function GET(req: NextRequest) {
  const admin = await verifyAdminApiKey(req, 'read')
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'
    const onlyFeatured = searchParams.get('featured') === 'true'
    const onlyMenu = searchParams.get('menu') === 'true'

    const where: any = {}
    if (!includeInactive) where.isActive = true
    if (onlyFeatured) where.isFeatured = true
    if (onlyMenu) where.showInMenu = true

    const categories = await prisma.category.findMany({
      where,
      include: {
        parent: {
          select: { id: true, name: true, slug: true, icon: true }
        },
        children: {
          where: includeInactive ? {} : { isActive: true },
          select: { id: true, name: true, slug: true, icon: true, iconSvg: true, iconType: true, isActive: true },
        },
        _count: {
          select: { products: true }
        }
      },
      orderBy: [
        { isFeatured: 'desc' },
        { order: 'asc' },
        { name: 'asc' }
      ]
    })

    // Transform for display
    const enhancedCategories = categories.map(cat => ({
      ...cat,
      productCount: cat._count.products,
      _count: undefined,
      // Icon display info
      iconDisplay: cat.iconType === 'svg' && cat.iconSvg
        ? { type: 'svg', content: cat.iconSvg }
        : cat.iconType === 'lottie' && cat.iconLottie
        ? { type: 'lottie', content: cat.iconLottie }
        : { type: 'icon', name: cat.icon || 'Folder' },
    }))

    return NextResponse.json({ 
      success: true, 
      count: enhancedCategories.length, 
      categories: enhancedCategories 
    })
  } catch (error) {
    console.error('Fetch categories error:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

// POST - Create new category with SVG/animation support
export async function POST(req: NextRequest) {
  const admin = await verifyAdminApiKey(req, 'write')
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    logInfo('Create category - received body', body)
    
    const { 
      name, 
      slug, 
      description, 
      // Icon options
      icon,
      iconSvg,
      iconLottie,
      iconType,
      // Images
      imageUrl,
      bannerUrl,
      mobileBannerUrl,
      // Styling
      color,
      gradient,
      textColor,
      // Display
      order,
      isFeatured,
      showInMenu,
      parentId,
      isActive,
      // SEO
      metaTitle,
      metaDescription,
      keywords,
    } = body

    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 })
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: description || '',
        // Icon
        icon: icon || null,
        iconSvg: iconSvg || null,
        iconLottie: iconLottie || null,
        iconType: iconType || 'icon',
        // Images
        imageUrl: imageUrl || '',
        bannerUrl: bannerUrl || null,
        mobileBannerUrl: mobileBannerUrl || null,
        // Styling
        color: color || null,
        gradient: gradient || null,
        textColor: textColor || null,
        // Display
        order: order || 0,
        isFeatured: isFeatured || false,
        showInMenu: showInMenu !== undefined ? showInMenu : true,
        parentId: parentId || null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        // SEO
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        keywords: keywords || null,
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Category created successfully',
      category: {
        ...category,
        iconDisplay: category.iconType === 'svg' && category.iconSvg
          ? { type: 'svg', content: category.iconSvg }
          : category.iconType === 'lottie' && category.iconLottie
          ? { type: 'lottie', content: category.iconLottie }
          : { type: 'icon', name: category.icon || 'Folder' },
      }
    })
  } catch (error: any) {
    logError('Create category', error)
    return NextResponse.json({ 
      error: 'Failed to create category', 
      details: error.message,
      code: error.code 
    }, { status: 500 })
  }
}
