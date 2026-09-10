import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminApiKey } from '@/lib/admin-api-auth';

// POST - Upload SVG content and get storage URL
export async function POST(request: NextRequest) {
  const admin = await verifyAdminApiKey(request, 'write');
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { 
      svgContent,      // Raw SVG XML string
      lottieData,      // Lottie JSON data
      illustrationCode, // React/CSS/HTML code
      illustrationType, // 'svg', 'lottie', 'css', 'react'
      productId,       // Optional: associate with product
      fileName,        // Optional: custom filename
    } = body;

    // Validate input
    if (!svgContent && !lottieData && !illustrationCode) {
      return NextResponse.json({ error: 'No content provided' }, { status: 400 });
    }

    // In production, this would upload to S3/CDN
    // For now, we return the content with a mock URL
    const timestamp = Date.now();
    const type = illustrationType || (svgContent ? 'svg' : lottieData ? 'lottie' : 'code');
    const name = fileName || `${type}_${timestamp}`;
    
    // Mock storage URL - replace with actual S3/CDN upload in production
    const baseUrl = process.env.NEXT_PUBLIC_STORAGE_URL || 'https://storage.grapsee.shop';
    
    let storageData: any = {
      type,
      uploadedAt: new Date().toISOString(),
    };

    if (svgContent) {
      storageData = {
        ...storageData,
        url: `${baseUrl}/svgs/${name}.svg`,
        content: svgContent, // In production, store this and return URL only
        contentType: 'image/svg+xml',
        size: Buffer.byteLength(svgContent, 'utf8'),
      };
    }

    if (lottieData) {
      storageData = {
        ...storageData,
        url: `${baseUrl}/lotties/${name}.json`,
        lottieUrl: `${baseUrl}/lotties/${name}.json`,
        content: lottieData,
        contentType: 'application/json',
        size: Buffer.byteLength(JSON.stringify(lottieData), 'utf8'),
      };
    }

    if (illustrationCode) {
      storageData = {
        ...storageData,
        url: `${baseUrl}/illustrations/${name}.js`,
        code: illustrationCode,
        codeType: illustrationType || 'react',
        contentType: 'application/javascript',
        size: Buffer.byteLength(illustrationCode, 'utf8'),
      };
    }

    return NextResponse.json({
      success: true,
      message: `${type.toUpperCase()} uploaded successfully`,
      data: storageData,
    });
  } catch (error) {
    console.error('SVG upload error:', error);
    return NextResponse.json({ error: 'Failed to upload' }, { status: 500 });
  }
}

// GET - Validate SVG content
export async function GET(request: NextRequest) {
  const admin = await verifyAdminApiKey(request, 'read');
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const content = searchParams.get('content');
    const type = searchParams.get('type') || 'svg'; // svg, lottie

    if (!content) {
      return NextResponse.json({ error: 'No content provided' }, { status: 400 });
    }

    let isValid = false;
    let validationError = null;

    if (type === 'svg') {
      // Basic SVG validation
      isValid = content.includes('<svg') && content.includes('</svg>');
      if (!isValid) validationError = 'Invalid SVG: Missing <svg> tags';
    } else if (type === 'lottie') {
      // Basic Lottie JSON validation
      try {
        const lottie = JSON.parse(content);
        isValid = lottie.v && lottie.fr && lottie.w && lottie.h;
        if (!isValid) validationError = 'Invalid Lottie: Missing required fields (v, fr, w, h)';
      } catch {
        isValid = false;
        validationError = 'Invalid JSON format';
      }
    }

    return NextResponse.json({
      success: true,
      isValid,
      type,
      validationError,
      // Return preview HTML for the content
      previewHtml: type === 'svg' 
        ? `<div style="width:200px;height:200px">${content}</div>`
        : null,
    });
  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json({ error: 'Validation failed' }, { status: 500 });
  }
}
