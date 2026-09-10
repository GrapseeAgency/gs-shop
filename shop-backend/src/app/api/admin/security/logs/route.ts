import { NextRequest, NextResponse } from "next/server";
import { verifyAdminApiKey } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Verify admin access (you'll need to implement this)
    // const admin = await verifyAdminApiKey(request, 'read');
    // if (!admin) {
    // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // For testing, we'll skip admin verification
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch security logs from database
    const logs = await prisma.securityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        userId: true,
        type: true,
        action: true,
        riskScore: true,
        metadata: true,
        createdAt: true,
        updatedAt: true
      }
    });

    const total = await prisma.securityLog.count();

    return NextResponse.json({
      success: true,
      logs,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Failed to fetch security logs:', error);
    return NextResponse.json({
      error: 'Failed to fetch security logs',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
