import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/quantum-collectibles - Get quantum collectibles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get('ownerId');
    const type = searchParams.get('type');
    const rarity = searchParams.get('rarity');

    const collectibles = await prisma.quantumCollectible.findMany({
      where: {
        ...(ownerId && { ownerId }),
        ...(type && { type }),
        ...(rarity && { rarity }),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: collectibles,
    });
  } catch (error) {
    console.error('Error fetching quantum collectibles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quantum collectibles' },
      { status: 500 }
    );
  }
}

// POST /api/quantum-collectibles - Create quantum collectible
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      type,
      quantumState,
      celebrityLink,
      properties,
      currentValue,
      rarity,
      ownerId,
    } = body;

    if (!name || !type || !currentValue || !rarity) {
      return NextResponse.json(
        { success: false, error: 'Name, type, currentValue, and rarity required' },
        { status: 400 }
      );
    }

    const collectible = await prisma.quantumCollectible.create({
      data: {
        name,
        type,
        quantumState: quantumState || null,
        celebrityLink: celebrityLink || null,
        properties: properties || null,
        currentValue: BigInt(currentValue),
        rarity,
        ownerId: ownerId || null,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: collectible,
      message: 'Quantum collectible created successfully',
    });
  } catch (error) {
    console.error('Error creating quantum collectible:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create quantum collectible' },
      { status: 500 }
    );
  }
}

// PUT /api/quantum-collectibles - Update quantum collectible
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      collectibleId,
      name,
      type,
      quantumState,
      celebrityLink,
      properties,
      currentValue,
      rarity,
      ownerId,
      isActive,
    } = body;

    if (!collectibleId) {
      return NextResponse.json(
        { success: false, error: 'Collectible ID required' },
        { status: 400 }
      );
    }

    const data: any = {};
    if (name !== undefined) data.name = name;
    if (type !== undefined) data.type = type;
    if (quantumState !== undefined) data.quantumState = quantumState;
    if (celebrityLink !== undefined) data.celebrityLink = celebrityLink;
    if (properties !== undefined) data.properties = properties;
    if (currentValue !== undefined) data.currentValue = BigInt(currentValue);
    if (rarity !== undefined) data.rarity = rarity;
    if (ownerId !== undefined) data.ownerId = ownerId;
    if (isActive !== undefined) data.isActive = isActive;

    const collectible = await prisma.quantumCollectible.update({
      where: { id: collectibleId },
      data,
    });

    return NextResponse.json({
      success: true,
      data: collectible,
    });
  } catch (error) {
    console.error('Error updating quantum collectible:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update quantum collectible' },
      { status: 500 }
    );
  }
}
