import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminApiKey } from '@/lib/admin-api-auth';

// GET - List competitor prices (all or by product)
export async function GET(request: NextRequest) {
  const admin = await verifyAdminApiKey(request, 'read');
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const competitor = searchParams.get('competitor');

    const where: any = {};
    if (productId) where.productId = productId;
    if (competitor) where.competitor = competitor;

    const prices = await prisma.competitorPrice.findMany({
      where,
      include: {
        product: {
          select: { id: true, name: true, price: true, slug: true },
        },
      },
      orderBy: { scrapedAt: 'desc' },
    });

    // Get latest price per competitor (when filtering by product)
    const latestByCompetitor = productId
      ? prices.reduce((acc, curr) => {
          if (!acc[curr.competitor] || new Date(curr.scrapedAt) > new Date(acc[curr.competitor].scrapedAt)) {
            acc[curr.competitor] = curr;
          }
          return acc;
        }, {} as Record<string, typeof prices[0]>)
      : {};

    return NextResponse.json({
      success: true,
      prices,
      latestByCompetitor: productId ? Object.values(latestByCompetitor) : undefined,
      count: prices.length,
    });
  } catch (error) {
    console.error('Error fetching competitor prices:', error);
    return NextResponse.json({ error: 'Failed to fetch competitor prices' }, { status: 500 });
  }
}

// POST - Add competitor price (manual or from scraper)
export async function POST(request: NextRequest) {
  const admin = await verifyAdminApiKey(request, 'write');
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { productId, competitor, competitorName, price, currency, url } = body;

    // Support both competitor and competitorName field names
    const competitorValue = competitor || competitorName;

    if (!productId || !competitorValue || price === undefined) {
      return NextResponse.json(
        { error: 'productId, competitor (or competitorName), and price required' },
        { status: 400 }
      );
    }

    const competitorPrice = await prisma.competitorPrice.create({
      data: {
        productId,
        competitor: competitorValue,
        price: Number(price),
        currency: currency || 'USD',
        url,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Competitor price recorded',
      competitorPrice,
    });
  } catch (error) {
    console.error('Error recording competitor price:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to record competitor price', details: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE - Remove old competitor price records
export async function DELETE(request: NextRequest) {
  const admin = await verifyAdminApiKey(request, 'write');
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const olderThanDays = parseInt(searchParams.get('olderThanDays') || '30');

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const where: any = {
      scrapedAt: {
        lt: cutoffDate,
      },
    };
    if (productId) where.productId = productId;

    const { count } = await prisma.competitorPrice.deleteMany({
      where,
    });

    return NextResponse.json({
      success: true,
      message: `Deleted ${count} old competitor price records`,
      deletedCount: count,
    });
  } catch (error) {
    console.error('Error deleting competitor prices:', error);
    return NextResponse.json({ error: 'Failed to delete competitor prices' }, { status: 500 });
  }
}
