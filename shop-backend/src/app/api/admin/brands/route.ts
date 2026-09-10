import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminApiKey } from '@/lib/admin-api-auth';
import { logError, logInfo } from '@/lib/logger';

// GET - List all brands
export async function GET(request: NextRequest) {
  const admin = await verifyAdminApiKey(request, 'read');
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const brands = await prisma.brand.findMany({
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({
      success: true,
      brands,
    });
  } catch (error) {
    console.error('Error fetching brands:', error);
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 });
  }
}

// POST - Create new brand
export async function POST(request: NextRequest) {
  const admin = await verifyAdminApiKey(request, 'write');
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    logInfo('Create brand - received body', body);
    
    const { name, slug, logo, icon, order, isActive } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    const brand = await prisma.brand.create({
      data: {
        name,
        slug,
        logo,
        icon,
        order: order || 0,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json({
      success: true,
      brand,
    });
  } catch (error: any) {
    logError('Create brand', error);
    return NextResponse.json({ 
      error: 'Failed to create brand',
      details: error.message,
      code: error.code
    }, { status: 500 });
  }
}
