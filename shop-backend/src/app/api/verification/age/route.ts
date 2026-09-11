import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth-options";

// GET /api/verification/age - Get verification age
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || session?.user?.id;
    const verificationType = searchParams.get('verificationType');
    const status = searchParams.get('status');
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0'));

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User authentication required' },
        { status: 401 }
      );
    }

    // Build where clause
    const whereClause: any = { userId };
    if (verificationType) whereClause.verificationType = verificationType;
    if (status) whereClause.status = status;

    // Get age verifications from database
    const ageVerifications = await prisma.ageVerification.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });

    const total = await prisma.ageVerification.count({
      where: whereClause
    });

    return NextResponse.json({
      success: true,
      data: ageVerifications,
      pagination: {
        limit,
        offset,
        total,
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('Error fetching verification age:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch age verifications' },
      { status: 500 }
    );
  }
}

// POST /api/verification/age - Create verification age
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const {
      userId,
      verificationType,
      documentType,
      documentNumber,
      dateOfBirth,
      issuingCountry,
      metadata
    } = body;

    const targetUserId = userId || session?.user?.id;

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, error: 'User authentication required' },
        { status: 401 }
      );
    }

    if (!verificationType || !documentType || !documentNumber || !dateOfBirth) {
      return NextResponse.json(
        { success: false, error: 'Verification type, document type, document number, and date of birth are required' },
        { status: 400 }
      );
    }

    // Validate verification type
    const validTypes = ['document_verification', 'selfie_verification', 'government_id', 'passport'];
    if (!validTypes.includes(verificationType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification type' },
        { status: 400 }
      );
    }

    // Validate document type
    const validDocumentTypes = ['national_id', 'passport', 'driving_license', 'birth_certificate'];
    if (!validDocumentTypes.includes(documentType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid document type' },
        { status: 400 }
      );
    }

    // Check if user is already verified
    const existingVerification = await prisma.ageVerification.findFirst({
      where: {
        status: 'verified'
      }
    });

    if (existingVerification) {
      return NextResponse.json(
        { success: false, error: 'User is already age verified' },
        { status: 400 }
      );
    }

    // Create age verification
    const ageVerification = await prisma.ageVerification.create({
      data: {
        method: documentType,
        dateOfBirth: dateOfBirth
      }
    });

    return NextResponse.json({
      success: true,
      data: ageVerification,
      message: 'Age verification submitted successfully',
    });
  } catch (error) {
    console.error('Error creating verification age:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create age verification' },
      { status: 500 }
    );
  }
}
