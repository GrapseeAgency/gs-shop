import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminApiKey } from '@/lib/admin-api-auth';

// GET /api/admin/products/[id]/price-history - Admin price history
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdminApiKey(request, 'read');
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '90');

    // Check product exists
    const product = await prisma.product.findUnique({
      where: { id },
      select: { 
        id: true, 
        name: true, 
        price: true, 
        comparePrice: true,
        createdAt: true
      }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Get price history
    const since = new Date();
    since.setDate(since.getDate() - days);

    const history = await prisma.priceHistory.findMany({
      where: {
        productId: id,
        recordedAt: {
          gte: since
        }
      },
      orderBy: { recordedAt: 'asc' }
    });

    // Format for area chart
    const chartData = history.map(h => ({
      date: h.recordedAt.toISOString().split('T')[0],
      fullDate: h.recordedAt.toISOString(),
      price: h.price,
      formattedPrice: `$${h.price.toFixed(2)}`,
      timestamp: h.recordedAt.getTime()
    }));

    // Add current price as last point
    chartData.push({
      date: new Date().toISOString().split('T')[0],
      fullDate: new Date().toISOString(),
      price: product.price,
      formattedPrice: `$${product.price.toFixed(2)}`,
      timestamp: Date.now()
    });

    // Calculate statistics
    const prices = chartData.map(d => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const currentPrice = product.price;
    const startingPrice = chartData[0]?.price || currentPrice;
    const priceChange = currentPrice - startingPrice;
    const priceChangePercent = startingPrice !== 0
      ? (priceChange / startingPrice) * 100
      : 0;

    // Calculate trend
    const recentPrices = prices.slice(-7); // Last 7 data points
    const olderPrices = prices.slice(0, 7); // First 7 data points
    const recentAvg = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
    const olderAvg = olderPrices.reduce((a, b) => a + b, 0) / olderPrices.length;
    const trend = recentAvg > olderAvg ? 'up' : recentAvg < olderAvg ? 'down' : 'stable';

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        currentPrice: product.price,
        comparePrice: product.comparePrice,
        createdAt: product.createdAt
      },
      chartData,
      statistics: {
        minPrice,
        maxPrice,
        avgPrice: Math.round(avgPrice * 100) / 100,
        currentPrice,
        startingPrice,
        priceChange: Math.round(priceChange * 100) / 100,
        priceChangePercent: Math.round(priceChangePercent * 100) / 100,
        trend,
        totalDataPoints: chartData.length,
        timeRange: `${days} days`
      }
    });
  } catch (error) {
    console.error('Error fetching price history:', error);
    return NextResponse.json({ error: 'Failed to fetch price history' }, { status: 500 });
  }
}
