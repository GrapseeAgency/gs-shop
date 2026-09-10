import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminApiKey } from '@/lib/admin-api-auth';

// GET - Get price change logs
export async function GET(request: NextRequest) {
  const admin = await verifyAdminApiKey(request, 'read');
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const reason = searchParams.get('reason');
    const days = parseInt(searchParams.get('days') || '30');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const since = new Date();
    since.setDate(since.getDate() - days);

    const where: any = {
      createdAt: {
        gte: since,
      },
    };
    if (productId) where.productId = productId;
    if (reason) where.reason = reason;

    const [logs, total] = await Promise.all([
      prisma.priceChangeLog.findMany({
        where,
        include: {
          product: {
            select: { id: true, name: true, slug: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.priceChangeLog.count({ where }),
    ]);

    // Calculate statistics
    const priceDecreases = logs.filter(l => l.newPrice < l.oldPrice).length;
    const priceIncreases = logs.filter(l => l.newPrice > l.oldPrice).length;
    const totalChange = logs.reduce((acc, log) => acc + (log.newPrice - log.oldPrice), 0);

    return NextResponse.json({
      success: true,
      logs,
      stats: {
        total,
        priceDecreases,
        priceIncreases,
        noChange: total - priceDecreases - priceIncreases,
        averageChange: total > 0 ? totalChange / total : 0,
        totalRevenueImpact: totalChange, // If all changes applied to 1 unit each
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching price logs:', error);
    return NextResponse.json({ error: 'Failed to fetch price logs' }, { status: 500 });
  }
}
