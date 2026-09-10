import { prisma } from './prisma';

export interface PricingResult {
  newPrice: number;
  oldPrice: number;
  reason: string;
  ruleId?: string;
  metadata: {
    competitorPrice?: number;
    marketAverage?: number;
    adjustment?: number;
    minPriceApplied?: boolean;
    maxPriceApplied?: boolean;
  };
}

/**
 * Calculate new price based on pricing rules
 */
export async function calculateOptimalPrice(productId: string): Promise<PricingResult | null> {
  // Get product
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, price: true, name: true },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  const oldPrice = product.price;

  // Get active pricing rules for this product
  const rules = await prisma.pricingRule.findMany({
    where: {
      OR: [
        { productId },
        { productId: null }, // Global rules
      ],
      isActive: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  if (rules.length === 0) {
    return null; // No rules to apply
  }

  // Get competitor prices
  const competitorPrices = await prisma.competitorPrice.findMany({
    where: {
      productId,
      isActive: true,
    },
    orderBy: { scrapedAt: 'desc' },
  });

  // Get latest price per competitor
  const latestPrices = competitorPrices.reduce((acc, curr) => {
    if (!acc[curr.competitor] || new Date(curr.scrapedAt) > new Date(acc[curr.competitor].scrapedAt)) {
      acc[curr.competitor] = curr;
    }
    return acc;
  }, {} as Record<string, typeof competitorPrices[0]>);

  const priceList = Object.values(latestPrices).map(p => p.price);
  const marketAverage = priceList.length > 0
    ? priceList.reduce((a, b) => a + b, 0) / priceList.length
    : oldPrice;

  let bestPrice: number | null = null;
  let appliedRule: typeof rules[0] | null = null;

  // Try each rule and pick the best (lowest) price
  for (const rule of rules) {
    let calculatedPrice: number | null = null;

    switch (rule.ruleType) {
      case 'cheapest_competitor':
        // Price = cheapest competitor price + adjustment
        if (priceList.length > 0) {
          const cheapest = Math.min(...priceList);
          calculatedPrice = cheapest + rule.adjustment;
        }
        break;

      case 'percentage_below':
        // Price = target price - percentage
        let targetPrice: number;
        if (rule.targetCompetitor === 'market_average') {
          targetPrice = marketAverage;
        } else if (latestPrices[rule.targetCompetitor!]) {
          targetPrice = latestPrices[rule.targetCompetitor!].price;
        } else {
          targetPrice = oldPrice;
        }
        // adjustment is percentage (e.g., -10 = 10% below)
        calculatedPrice = targetPrice * (1 + rule.adjustment / 100);
        break;

      case 'fixed_price':
        // Fixed price amount
        calculatedPrice = rule.adjustment;
        break;

      case 'range':
        // Keep price within range based on market
        if (priceList.length > 0) {
          const cheapest = Math.min(...priceList);
          const mostExpensive = Math.max(...priceList);
          // Position within range based on adjustment (0-1)
          const position = Math.max(0, Math.min(1, rule.adjustment / 100));
          calculatedPrice = cheapest + (mostExpensive - cheapest) * position;
        }
        break;
    }

    if (calculatedPrice !== null) {
      // Apply min/max constraints
      let constrainedPrice = calculatedPrice;
      let minApplied = false;
      let maxApplied = false;

      if (rule.minPrice !== null && constrainedPrice < rule.minPrice) {
        constrainedPrice = rule.minPrice;
        minApplied = true;
      }
      if (rule.maxPrice !== null && constrainedPrice > rule.maxPrice) {
        constrainedPrice = rule.maxPrice;
        maxApplied = true;
      }

      // Pick the best (lowest) price from all rules
      if (bestPrice === null || constrainedPrice < bestPrice) {
        bestPrice = constrainedPrice;
        appliedRule = rule;
      }
    }
  }

  if (bestPrice === null || Math.abs(bestPrice - oldPrice) < 0.01) {
    return null; // No change needed
  }

  return {
    newPrice: Math.round(bestPrice * 100) / 100,
    oldPrice,
    reason: 'pricing_rule',
    ruleId: appliedRule?.id,
    metadata: {
      competitorPrice: priceList.length > 0 ? Math.min(...priceList) : undefined,
      marketAverage,
      adjustment: appliedRule?.adjustment,
    },
  };
}

/**
 * Apply calculated price to product
 */
export async function applyPriceChange(
  productId: string,
  result: PricingResult,
  triggeredBy: string = 'system'
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // Update product price
    await tx.product.update({
      where: { id: productId },
      data: {
        price: result.newPrice,
        comparePrice: result.oldPrice, // Show old price as compare
      },
    });

    // Record in price history
    await tx.priceHistory.create({
      data: {
        productId,
        price: result.oldPrice,
        recordedAt: new Date(),
      },
    });

    // Log the change
    // Filter out undefined values from metadata before stringifying
    const cleanMetadata = Object.fromEntries(
      Object.entries(result.metadata || {}).filter(([_, v]) => v !== undefined)
    );
    await tx.priceChangeLog.create({
      data: {
        productId,
        oldPrice: result.oldPrice,
        newPrice: result.newPrice,
        reason: result.reason,
        triggeredBy,
        ruleId: result.ruleId,
        metadata: Object.keys(cleanMetadata).length > 0 ? JSON.stringify(cleanMetadata) : null,
      },
    });

    // Update rule's last applied info
    if (result.ruleId) {
      await tx.pricingRule.update({
        where: { id: result.ruleId },
        data: {
          lastAppliedAt: new Date(),
          lastAppliedPrice: result.newPrice,
        },
      });
    }
  });
}

/**
 * Run pricing engine for all products or specific product
 */
export async function runPricingEngine(productId?: string): Promise<{
  processed: number;
  updated: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let processed = 0;
  let updated = 0;

  try {
    console.log('[PricingEngine] Starting runPricingEngine...');
    // Get products to process
    let products;
    if (productId) {
      products = await prisma.product.findMany({ where: { id: productId } });
    } else {
      // Get products that have active pricing rules
      const rules = await prisma.pricingRule.findMany({
        where: { isActive: true },
        select: { productId: true },
        distinct: ['productId'],
      });
      
      const productIds = rules
        .map(r => r.productId)
        .filter((id): id is string => id !== null);
      
      if (productIds.length === 0) {
        return { processed: 0, updated: 0, errors: ['No products with active pricing rules found'] };
      }
      
      products = await prisma.product.findMany({
        where: { id: { in: productIds } },
      });
    }

    console.log(`[PricingEngine] Found ${products.length} products to process`);

    for (const product of products) {
      processed++;
      console.log(`[PricingEngine] Processing product ${product.id}...`);
      try {
        const result = await calculateOptimalPrice(product.id);
        if (result) {
          console.log(`[PricingEngine] Applying price change for ${product.id}: ${result.oldPrice} -> ${result.newPrice}`);
          await applyPriceChange(product.id, result, 'system');
          updated++;
        } else {
          console.log(`[PricingEngine] No price change needed for ${product.id}`);
        }
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Unknown error';
        console.error(`[PricingEngine] Error for product ${product.id}: ${errMsg}`);
        errors.push(`Product ${product.id}: ${errMsg}`);
      }
    }
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[PricingEngine] Engine error: ${errMsg}`);
    errors.push(`Engine error: ${errMsg}`);
  }

  return { processed, updated, errors };
}
