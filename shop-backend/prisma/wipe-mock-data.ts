import { db } from '@/lib/db'

async function wipeMockData() {
  console.log('🗑️  Wiping all mock data...')

  // Orders & line items
  await db.orderItem.deleteMany()
  await db.order.deleteMany()
  console.log('  ✓ Orders cleared')

  // Reviews
  await db.review.deleteMany()
  console.log('  ✓ Reviews cleared')

  // Auctions
  await db.auctionBid.deleteMany()
  await db.auction.deleteMany()
  console.log('  ✓ Auctions cleared')

  // Flash sales & flashback
  await db.flashSale.deleteMany()
  await db.flashbackProduct.deleteMany()
  console.log('  ✓ Flash sales & flashback cleared')

  // Events
  await db.event.deleteMany()
  console.log('  ✓ Events cleared')

  // Placements
  await db.customPlacement.deleteMany()
  console.log('  ✓ Placements cleared')

  // Coupons
  await db.coupon.deleteMany()
  console.log('  ✓ Coupons cleared')

  // Gift cards
  await db.giftCard.deleteMany()
  console.log('  ✓ Gift cards cleared')

  // Product-related
  await db.productVideo.deleteMany()
  await db.productQuestion.deleteMany()
  await db.priceHistory.deleteMany()
  await db.priceAlert.deleteMany()
  console.log('  ✓ Product extras cleared')

  // Products (after all dependents)
  await db.product.deleteMany()
  console.log('  ✓ Products cleared')

  // User-related
  await db.walletTransaction.deleteMany()
  await db.wallet.deleteMany()
  await db.notification.deleteMany()
  await db.address.deleteMany()
  await db.returnRequest.deleteMany()
  await db.referral.deleteMany()
  console.log('  ✓ User data cleared')

  // Users (demo accounts)
  await db.user.deleteMany()
  console.log('  ✓ Users cleared')

  // Content
  await db.blogPost.deleteMany()
  await db.helpArticle.deleteMany()
  await db.collection.deleteMany()
  await db.spinPrize.deleteMany()
  await db.storeLocation.deleteMany()
  await db.shippingMethod.deleteMany()
  await db.newsletter.deleteMany()
  await db.contact.deleteMany()
  console.log('  ✓ Content & config cleared')

  // Community
  await db.communityLike.deleteMany()
  await db.communityComment.deleteMany()
  await db.communityPost.deleteMany()
  console.log('  ✓ Community posts/comments cleared')

  // Restore API key
  await db.adminApiKey.deleteMany()
  await db.adminApiKey.create({
    data: {
      id: 'grapsee-main-admin-key',
      key: process.env.GRAPSEE_SHOP_API_KEY || 'gsa_I0wRUXcdjVNvZupfIm7UBchuE1cG4E54',
      name: 'Grapsee.com Admin Portal',
      permissions: JSON.stringify(['read', 'write', 'delete']),
      isActive: true,
    }
  })
  console.log('  ✓ API key restored')

  console.log('')
  console.log('✅ All mock data wiped.')
  console.log('   Preserved: Categories, API key')
}

wipeMockData()
  .catch(console.error)
  .finally(() => db.$disconnect())
