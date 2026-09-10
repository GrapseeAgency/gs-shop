import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (id) {
      const flashbackProduct = await prisma.flashbackProduct.findUnique({
        where: { id },
        include: { product: true },
      });
      if (!flashbackProduct) {
        return NextResponse.json({ error: 'Flashback product not found' }, { status: 404 });
      }
      return NextResponse.json(flashbackProduct);
    }

    const isActive = searchParams.get('active');
    const where: Record<string, any> = {};
    if (isActive === 'true') {
      where.isActive = true;
    } else if (isActive === 'false') {
      where.isActive = false;
    }

    const flashbackProducts = await prisma.flashbackProduct.findMany({
      where,
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(flashbackProducts);
  } catch (error) {
    console.error('Error fetching flashback products:', error);
    return NextResponse.json({ error: 'Failed to fetch flashback products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, flashStart, flashEnd, discount, isActive } = body;

    if (!productId || !flashStart || !flashEnd || discount === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const flashbackProduct = await prisma.flashbackProduct.create({
      data: {
        product: {
          connect: { id: productId as string }
        },
        originalPrice: 100, // Default original price
        flashStart: new Date(flashStart),
        flashEnd: new Date(flashEnd),
        discount: parseInt(discount),
        isActive: isActive !== undefined ? isActive : true,
      },
      include: { product: true },
    });

    return NextResponse.json(flashbackProduct, { status: 201 });
  } catch (error) {
    console.error('Error creating flashback product:', error);
    return NextResponse.json({ error: 'Failed to create flashback product' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Flashback product id missing' }, { status: 400 });
    }

    const body = await request.json();
    const data: Record<string, any> = {};

    if (body.productId !== undefined) data.productId = body.productId;
    if (body.flashStart !== undefined) data.flashStart = new Date(body.flashStart);
    if (body.flashEnd !== undefined) data.flashEnd = new Date(body.flashEnd);
    if (body.discount !== undefined) data.discount = parseInt(body.discount);
    if (body.isActive !== undefined) data.isActive = body.isActive;

    const flashbackProduct = await prisma.flashbackProduct.update({
      where: { id },
      data,
      include: { product: true },
    });

    return NextResponse.json(flashbackProduct);
  } catch (error) {
    console.error('Error updating flashback product:', error);
    return NextResponse.json({ error: 'Failed to update flashback product' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Flashback product id missing' }, { status: 400 });
    }

    await prisma.flashbackProduct.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Flashback product deleted' });
  } catch (error) {
    console.error('Error deleting flashback product:', error);
    return NextResponse.json({ error: 'Failed to delete flashback product' }, { status: 500 });
  }
}
