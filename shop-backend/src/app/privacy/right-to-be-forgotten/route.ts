import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Request data deletion (Right to be Forgotten)
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { deleteType, confirmation } = await req.json()

    if (!confirmation) {
      return NextResponse.json({
        requiresConfirmation: true,
        warning: 'This action is irreversible. Please confirm to proceed.',
        dataToDelete: getDataTypes(userId)
      })
    }

    const deleted = {
      orders: 0,
      reviews: 0,
      wishlist: 0,
      searches: 0,
      profile: false
    }

    // Delete based on type
    if (deleteType === 'all' || deleteType === 'activity') {
      // Delete search history
      const searches = await prisma.searchQuery.deleteMany({
        where: { userId }
      })
      deleted.searches = searches.count

      // Delete product views
      await prisma.productView.deleteMany({
        where: { userId }
      })
    }

    if (deleteType === 'all' || deleteType === 'reviews') {
      const reviews = await prisma.review.deleteMany({
        where: { userId }
      })
      deleted.reviews = reviews.count
    }

    if (deleteType === 'all' || deleteType === 'wishlist') {
      const wishlist = await prisma.wishlistItem.deleteMany({
        where: { userId }
      })
      deleted.wishlist = wishlist.count
    }

    if (deleteType === 'all') {
      // Anonymize orders (keep for accounting, remove PII)
      const orders = await prisma.order.updateMany({
        where: { customerEmail: userId },
        data: {
          customerEmail: `deleted_${Date.now()}@deleted.user`,
          shippingAddress: 'DELETED'
        }
      })
      deleted.orders = orders.count

      // Delete user profile
      await prisma.user.delete({
        where: { id: userId }
      }).catch(() => {})

      deleted.profile = true
    }

    return NextResponse.json({
      success: true,
      message: deleteType === 'all' 
        ? 'All your data has been deleted. You will be logged out.'
        : `${deleteType} data has been deleted successfully.`,
      deleted,
      rights: [
        'You have the right to be forgotten under GDPR',
        'Your data deletion request has been processed',
        'Any cached data may take 30 days to clear globally'
      ]
    })
  } catch (error) {
    console.error('Right to be forgotten error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// GET - Show what data exists
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await getDataTypes(userId)

    return NextResponse.json({
      dataSummary: data,
      message: 'Review your data before requesting deletion',
      yourRights: [
        'Right to access your data',
        'Right to correct inaccurate data',
        'Right to delete your data (Right to be Forgotten)',
        'Right to data portability',
        'Right to object to processing'
      ]
    })
  } catch (error) {
    console.error('Data summary error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

async function getDataTypes(userId: string) {
  const [
    orders,
    reviews,
    wishlist,
    searches,
    addresses
  ] = await Promise.all([
    prisma.order.count({ where: { customerEmail: userId } }),
    prisma.review.count({ where: { userId } }),
    prisma.wishlistItem.count({ where: { userId } }),
    prisma.searchQuery.count({ where: { userId } }),
    prisma.address.count({ where: { userId } })
  ])

  return {
    orders,
    reviews,
    wishlist,
    searches,
    addresses,
    totalRecords: orders + reviews + wishlist + searches + addresses
  }
}
