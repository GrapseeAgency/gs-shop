import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/cron?task=daily
 * Cron job endpoint for scheduled tasks
 * 
 * Tasks:
 * - generate-todays-pick: Generate 2 random products for today
 * - clean-expired-luxury: Remove expired luxury products
 * - update-search-trends: Update trending searches
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const task = searchParams.get('task') || 'all';
    const secret = searchParams.get('secret');

    // Basic secret validation (should match CRON_SECRET env var)
    const CRON_SECRET = process.env.CRON_SECRET;
    if (CRON_SECRET && secret !== CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results: Record<string, any> = {};

    // Generate Today's Pick (2 random products)
    if (task === 'generate-todays-pick' || task === 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check if already generated for today
      const existingPicks = await prisma.todaysPick.count({
        where: {
          date: { gte: today },
          isActive: true
        }
      });

      if (existingPicks === 0) {
        // Get all active products
        const activeProducts = await prisma.product.findMany({
          where: { isActive: true },
          select: { id: true }
        });

        if (activeProducts.length >= 2) {
          // Select 2 random products
          const shuffled = activeProducts.sort(() => 0.5 - Math.random());
          const selectedIds = shuffled.slice(0, 2).map(p => p.id);

          // Create TodaysPick records
          await prisma.todaysPick.createMany({
            data: selectedIds.map(productId => ({
              productId,
              date: today,
              isActive: true
            }))
          });

          results.generateTodaysPick = {
            success: true,
            message: 'Generated today\'s picks',
            productIds: selectedIds
          };
        } else {
          results.generateTodaysPick = {
            success: false,
            message: 'Not enough active products'
          };
        }
      } else {
        results.generateTodaysPick = {
          success: false,
          message: 'Today\'s picks already generated'
        };
      }
    }

    // Clean expired luxury products
    if (task === 'clean-expired-luxury' || task === 'all') {
      const now = new Date();

      const expiredLuxury = await prisma.product.findMany({
        where: {
          isLuxury: true,
          luxuryExpiresAt: { lt: now }
        },
        select: { id: true }
      });

      if (expiredLuxury.length > 0) {
        // Remove luxury status from expired products
        await prisma.product.updateMany({
          where: {
            id: { in: expiredLuxury.map(p => p.id) }
          },
          data: {
            isLuxury: false,
            luxuryExpiresAt: null
          }
        });

        results.cleanExpiredLuxury = {
          success: true,
          message: `Removed ${expiredLuxury.length} expired luxury products`,
          count: expiredLuxury.length
        };
      } else {
        results.cleanExpiredLuxury = {
          success: true,
          message: 'No expired luxury products found'
        };
      }
    }

    // Update search trends (cleanup old suggestions)
    if (task === 'update-search-trends' || task === 'all') {
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      // Delete old search suggestions (older than 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const deleted = await prisma.searchSuggestion.deleteMany({
        where: {
          lastUsedAt: { lt: sevenDaysAgo },
          hitCount: { lt: 5 } // Only delete low-usage old suggestions
        }
      });

      results.updateSearchTrends = {
        success: true,
        message: `Cleaned up ${deleted.count} old search suggestions`,
        count: deleted.count
      };
    }

    return NextResponse.json({
      success: true,
      task,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json({
      success: false,
      error: 'Cron job failed'
    }, { status: 500 });
  }
}
