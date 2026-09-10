import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminApiKey } from '@/lib/admin-api-auth';

// POST - Generate product preview
export async function POST(request: NextRequest) {
  const admin = await verifyAdminApiKey(request, 'read');
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      // Basic info
      name,
      shortDescription,
      description,
      price,
      comparePrice,
      discount,
      // Visual
      imageUrl,
      images,
      svgUrl,
      lottieUrl,
      thumbnailType,
      videoThumbnail,
      illustrationCode,
      illustrationType,
      // Badges
      badge,
      badgeColor,
      isNew,
      isFeatured,
      isTrending,
      isFlashDeal,
      // Classification
      productType,
      category,
      seller,
      // Ratings
      rating,
      reviewCount,
      // Gallery
      galleryType,
      galleryColumns,
      // SEO
      metaTitle,
      metaDescription,
    } = body;

    // Generate preview data
    const displayPrice = discount > 0 
      ? (price * (1 - discount / 100)).toFixed(2)
      : price?.toFixed(2);

    const savings = comparePrice && discount > 0
      ? (comparePrice - (price * (1 - discount / 100))).toFixed(2)
      : comparePrice 
      ? (comparePrice - price).toFixed(2)
      : null;

    const discountPercent = discount > 0 
      ? discount 
      : comparePrice 
      ? Math.round(((comparePrice - price) / comparePrice) * 100)
      : 0;

    // Determine thumbnail
    const thumbnail = thumbnailType === 'svg' && svgUrl
      ? svgUrl
      : thumbnailType === 'animation' && lottieUrl
      ? lottieUrl
      : thumbnailType === 'video' && videoThumbnail
      ? videoThumbnail
      : imageUrl;

    // Generate card preview
    const cardPreview = {
      layout: 'card',
      data: {
        id: 'preview',
        name: name || 'Product Name',
        shortDescription: shortDescription || description?.substring(0, 100) || '',
        thumbnail,
        thumbnailType,
        animationData: illustrationCode || null,
        animationType: illustrationType || null,
        price: displayPrice,
        originalPrice: comparePrice || null,
        discount: discountPercent,
        savings,
        badge,
        badgeColor,
        isNew,
        isFeatured,
        isTrending,
        isFlashDeal,
        rating: rating || 0,
        reviewCount: reviewCount || 0,
        category: category || { name: 'Category' },
        seller: seller || { name: 'Seller' },
      }
    };

    // Generate detail page preview
    const detailPreview = {
      layout: 'detail',
      data: {
        id: 'preview',
        name: name || 'Product Name',
        description: description || '',
        shortDescription: shortDescription || '',
        thumbnail,
        thumbnailType,
        images: images ? JSON.parse(images) : [imageUrl].filter(Boolean),
        galleryType,
        galleryColumns,
        animationData: illustrationCode || null,
        animationType: illustrationType || null,
        svgUrl,
        lottieUrl,
        price: displayPrice,
        originalPrice: comparePrice || null,
        discount: discountPercent,
        savings,
        badge,
        badgeColor,
        isNew,
        isFeatured,
        isTrending,
        isFlashDeal,
        productType: productType || 'physical',
        rating: rating || 0,
        reviewCount: reviewCount || 0,
        category: category || { name: 'Category', slug: 'category' },
        seller: seller || { name: 'Seller', avatar: null },
        // SEO preview
        seo: {
          title: metaTitle || name || 'Product Title',
          description: metaDescription || shortDescription?.substring(0, 160) || '',
          url: `https://grapsee.shop/products/${name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'product'}`,
          image: imageUrl || thumbnail,
        }
      }
    };

    // Generate mobile app preview (card style)
    const mobilePreview = {
      layout: 'mobile-card',
      data: {
        ...cardPreview.data,
        cardStyle: 'compact',
        showBadge: Boolean(badge),
        showRating: rating > 0,
        showDiscount: discountPercent > 0,
      }
    };

    return NextResponse.json({
      success: true,
      previews: {
        card: cardPreview,
        detail: detailPreview,
        mobile: mobilePreview,
      },
      // CSS/JS for rendering custom illustrations
      renderConfig: illustrationCode ? {
        type: illustrationType,
        code: illustrationCode,
        containerId: 'product-illustration-preview',
      } : null,
    });
  } catch (error) {
    console.error('Preview generation error:', error);
    return NextResponse.json({ error: 'Failed to generate preview' }, { status: 500 });
  }
}

// GET - Get preview templates
export async function GET(request: NextRequest) {
  const admin = await verifyAdminApiKey(request, 'read');
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const templates = {
    cardLayouts: [
      { id: 'default', name: 'Default Card', description: 'Standard product card with image' },
      { id: 'minimal', name: 'Minimal', description: 'Clean design with essential info only' },
      { id: 'featured', name: 'Featured', description: 'Larger card for highlighted products' },
      { id: 'compact', name: 'Compact', description: 'Small card for grid views' },
    ],
    thumbnailTypes: [
      { id: 'image', name: 'Static Image', icon: 'Image' },
      { id: 'svg', name: 'SVG Animation', icon: 'Svg', supportsAnimation: true },
      { id: 'lottie', name: 'Lottie Animation', icon: 'Play', supportsAnimation: true },
      { id: 'video', name: 'Video Thumbnail', icon: 'Video' },
      { id: 'illustration', name: 'Custom Code', icon: 'Code', supportsCode: true },
    ],
    badgeColors: [
      { id: 'red', name: 'Red', color: '#ef4444', usage: 'Sale, Hot' },
      { id: 'green', name: 'Green', color: '#22c55e', usage: 'New, Eco' },
      { id: 'blue', name: 'Blue', color: '#3b82f6', usage: 'Featured' },
      { id: 'gold', name: 'Gold', color: '#f59e0b', usage: 'Premium, Bestseller' },
      { id: 'purple', name: 'Purple', color: '#a855f7', usage: 'Limited' },
    ],
    productTypes: [
      { id: 'physical', name: 'Physical Product', icon: 'Package' },
      { id: 'digital', name: 'Digital Download', icon: 'Download' },
      { id: 'service', name: 'Service', icon: 'Wrench' },
      { id: 'subscription', name: 'Subscription', icon: 'RefreshCw' },
    ],
    galleryTypes: [
      { id: 'grid', name: 'Grid Layout', columns: [2, 3, 4] },
      { id: 'slider', name: 'Image Slider', options: ['autoplay', 'thumbnails'] },
      { id: 'masonry', name: 'Masonry', columns: [2, 3] },
    ],
  };

  return NextResponse.json({
    success: true,
    templates,
  });
}
