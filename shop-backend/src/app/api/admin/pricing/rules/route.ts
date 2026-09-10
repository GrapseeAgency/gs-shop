import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminApiKey } from '@/lib/admin-api-auth';

// GET - List pricing rules
export async function GET(request: NextRequest) {
  const admin = await verifyAdminApiKey(request, 'read');
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const isActive = searchParams.get('isActive');

    const where: any = {};
    if (productId) where.productId = productId;
    if (isActive !== null) where.isActive = isActive === 'true';

    const rules = await prisma.pricingRule.findMany({
      where,
      include: {
        product: {
          select: { id: true, name: true, price: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      rules,
    });
  } catch (error) {
    console.error('Error fetching pricing rules:', error);
    return NextResponse.json({ error: 'Failed to fetch pricing rules' }, { status: 500 });
  }
}

// POST - Create pricing rule
export async function POST(request: NextRequest) {
  const admin = await verifyAdminApiKey(request, 'write');
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      productId,
      name,
      ruleType, // "cheapest_competitor", "percentage_below", "fixed_price", "range"
      type, // Alternative field name
      targetCompetitor, // Competitor name or "market_average"
      target, // Alternative field name
      adjustment, // e.g., -10 for 10% cheaper, or fixed amount
      minPrice,
      maxPrice,
    } = body;

    // Support both field name variations
    const ruleTypeValue = ruleType || type;
    const targetValue = targetCompetitor || target;

    if (!name || !ruleTypeValue) {
      return NextResponse.json(
        { error: 'name and ruleType (or type) required' },
        { status: 400 }
      );
    }

    const rule = await prisma.pricingRule.create({
      data: {
        productId: productId || null,
        name,
        ruleType: ruleTypeValue,
        targetCompetitor: targetValue,
        adjustment: Number(adjustment) || 0,
        minPrice: minPrice ? Number(minPrice) : null,
        maxPrice: maxPrice ? Number(maxPrice) : null,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Pricing rule created',
      rule,
    });
  } catch (error) {
    console.error('Error creating pricing rule:', error);
    return NextResponse.json({ error: 'Failed to create pricing rule' }, { status: 500 });
  }
}

// PUT - Update pricing rule
export async function PUT(request: NextRequest) {
  const admin = await verifyAdminApiKey(request, 'write');
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Rule ID required' }, { status: 400 });
    }

    const data: any = {};
    if (updateData.name !== undefined) data.name = updateData.name;
    if (updateData.ruleType !== undefined) data.ruleType = updateData.ruleType;
    if (updateData.targetCompetitor !== undefined) data.targetCompetitor = updateData.targetCompetitor;
    if (updateData.adjustment !== undefined) data.adjustment = Number(updateData.adjustment);
    if (updateData.minPrice !== undefined) data.minPrice = updateData.minPrice ? Number(updateData.minPrice) : null;
    if (updateData.maxPrice !== undefined) data.maxPrice = updateData.maxPrice ? Number(updateData.maxPrice) : null;
    if (updateData.isActive !== undefined) data.isActive = updateData.isActive;

    const rule = await prisma.pricingRule.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      success: true,
      message: 'Pricing rule updated',
      rule,
    });
  } catch (error) {
    console.error('Error updating pricing rule:', error);
    return NextResponse.json({ error: 'Failed to update pricing rule' }, { status: 500 });
  }
}

// DELETE - Delete pricing rule
export async function DELETE(request: NextRequest) {
  const admin = await verifyAdminApiKey(request, 'write');
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Rule ID required' }, { status: 400 });
    }

    await prisma.pricingRule.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'Pricing rule deleted',
    });
  } catch (error) {
    console.error('Error deleting pricing rule:', error);
    return NextResponse.json({ error: 'Failed to delete pricing rule' }, { status: 500 });
  }
}
