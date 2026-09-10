import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminApiKey } from '@/lib/admin-api-auth';
import { runPricingEngine, calculateOptimalPrice, applyPriceChange } from '@/lib/pricing-engine';

// POST - Apply pricing rules
export async function POST(request: NextRequest) {
  const admin = await verifyAdminApiKey(request, 'write');
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { productId, dryRun = false } = body;

    if (productId) {
      // Apply to single product
      const result = await calculateOptimalPrice(productId);

      if (!result) {
        return NextResponse.json({
          success: true,
          message: 'No pricing change needed',
          productId,
          wouldUpdate: false,
        });
      }

      if (!dryRun) {
        await applyPriceChange(productId, result, 'admin');
      }

      return NextResponse.json({
        success: true,
        message: dryRun ? 'Price change preview' : 'Price updated successfully',
        productId,
        wouldUpdate: true,
        dryRun,
        change: {
          oldPrice: result.oldPrice,
          newPrice: result.newPrice,
          difference: result.newPrice - result.oldPrice,
          percentChange: ((result.newPrice - result.oldPrice) / result.oldPrice) * 100,
        },
        reason: result.reason,
        metadata: result.metadata,
      });
    } else {
      // Apply to all products with rules
      const { processed, updated, errors } = await runPricingEngine();

      return NextResponse.json({
        success: true,
        message: `Processed ${processed} products, updated ${updated} prices`,
        stats: {
          processed,
          updated,
          errors: errors.length,
        },
        errorDetails: errors.length > 0 ? errors : undefined,
      });
    }
  } catch (error) {
    console.error('Error applying pricing rules:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to apply pricing rules', details: errorMessage },
      { status: 500 }
    );
  }
}
