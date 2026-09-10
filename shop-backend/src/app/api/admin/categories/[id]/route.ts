import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminApiKey } from '@/lib/admin-api-auth'

// GET - Get specific category with full details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const admin = await verifyAdminApiKey(req, 'read')
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        parent: {
          select: { id: true, name: true, slug: true, icon: true, iconSvg: true }
        },
        children: {
          select: { id: true, name: true, slug: true, icon: true, iconSvg: true, isActive: true }
        },
        products: {
          select: { 
            id: true, 
            name: true, 
            price: true, 
            isActive: true,
            imageUrl: true,
            thumbnailType: true,
            svgUrl: true,
          }
        },
        _count: {
          select: { products: true }
        }
      }
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      category: {
        ...category,
        productCount: category._count.products,
        _count: undefined,
        iconDisplay: category.iconType === 'svg' && category.iconSvg
          ? { type: 'svg', content: category.iconSvg }
          : category.iconType === 'lottie' && category.iconLottie
          ? { type: 'lottie', content: category.iconLottie }
          : { type: 'icon', name: category.icon || 'Folder' },
      }
    })
  } catch (error) {
    console.error('Fetch category error:', error)
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 })
  }
}

// PUT - Update category with all new fields
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const admin = await verifyAdminApiKey(req, 'write')
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { 
      name, 
      slug, 
      description, 
      // Icon
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

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (slug !== undefined) updateData.slug = slug
    if (description !== undefined) updateData.description = description
    // Icon
    if (icon !== undefined) updateData.icon = icon
    if (iconSvg !== undefined) updateData.iconSvg = iconSvg
    if (iconLottie !== undefined) updateData.iconLottie = iconLottie
    if (iconType !== undefined) updateData.iconType = iconType
    // Images
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl
    if (bannerUrl !== undefined) updateData.bannerUrl = bannerUrl
    if (mobileBannerUrl !== undefined) updateData.mobileBannerUrl = mobileBannerUrl
    // Styling
    if (color !== undefined) updateData.color = color
    if (gradient !== undefined) updateData.gradient = gradient
    if (textColor !== undefined) updateData.textColor = textColor
    // Display
    if (order !== undefined) updateData.order = Number(order)
    if (isFeatured !== undefined) updateData.isFeatured = Boolean(isFeatured)
    if (showInMenu !== undefined) updateData.showInMenu = Boolean(showInMenu)
    if (parentId !== undefined) updateData.parentId = parentId
    if (isActive !== undefined) updateData.isActive = Boolean(isActive)
    // SEO
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription
    if (keywords !== undefined) updateData.keywords = keywords

    const category = await prisma.category.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      message: 'Category updated successfully',
      category: {
        ...category,
        iconDisplay: category.iconType === 'svg' && category.iconSvg
          ? { type: 'svg', content: category.iconSvg }
          : category.iconType === 'lottie' && category.iconLottie
          ? { type: 'lottie', content: category.iconLottie }
          : { type: 'icon', name: category.icon || 'Folder' },
      }
    })
  } catch (error) {
    console.error('Update category error:', error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

// DELETE - Delete category
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const admin = await verifyAdminApiKey(req, 'write')
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Check if category has products
    const productCount = await prisma.product.count({
      where: { categoryId: id }
    })

    if (productCount > 0) {
      return NextResponse.json({
        error: 'Cannot delete category with products. Reassign products first.',
        productCount
      }, { status: 400 })
    }

    await prisma.category.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
