import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/products/[id]/price-history - Public price history
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const limit = parseInt(searchParams.get('limit') || '100');

    // Check product exists
    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true, name: true, price: true, comparePrice: true }
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
      orderBy: { recordedAt: 'asc' },
      take: limit
    });

    // Format for chart
    const chartData = history.map(h => ({
      date: h.recordedAt.toISOString().split('T')[0],
      time: h.recordedAt.toISOString(),
      price: h.price,
      timestamp: h.recordedAt.getTime()
    }));

    // Add current price as last point if no recent history
    if (chartData.length === 0 || 
        (chartData.length > 0 && chartData[chartData.length - 1].price !== product.price)) {
      chartData.push({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toISOString(),
        price: product.price,
        timestamp: Date.now()
      });
    }

    // Calculate statistics
    const prices = chartData.map(d => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const currentPrice = product.price;
    const priceChange = chartData.length > 1 
      ? currentPrice - chartData[0].price 
      : 0;
    const priceChangePercent = chartData.length > 1 && chartData[0].price !== 0
      ? ((currentPrice - chartData[0].price) / chartData[0].price) * 100
      : 0;

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        currentPrice: product.price,
        comparePrice: product.comparePrice
      },
      chartData,
      statistics: {
        minPrice,
        maxPrice,
        avgPrice: Math.round(avgPrice * 100) / 100,
        currentPrice,
        priceChange: Math.round(priceChange * 100) / 100,
        priceChangePercent: Math.round(priceChangePercent * 100) / 100,
        dataPoints: chartData.length,
        timeRange: `${days} days`
      }
    });
  } catch (error) {
    console.error('Error fetching price history:', error);
    return NextResponse.json({ error: 'Failed to fetch price history' }, { status: 500 });
  }
}
