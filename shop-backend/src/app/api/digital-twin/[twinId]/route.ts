import { NextRequest, NextResponse } from 'next/server';

// GET /api/digital-twin/[twinId] - Get digital twin
export async function GET(request: NextRequest, { params }: { params: Promise<{ twinId: string }> }) {
  try {
    const { twinId } = await params;

    
    const digitalTwin = {
      id: 'dt-' + twinId,
      userId: twinId,
      name: 'Digital Twin',
      createdAt: '2024-05-15',
      lastUpdated: '2024-05-20',
      version: '2.1',
      bodyMeasurements: {
        height: 175,
        weight: 70,
        chest: 96,
        waist: 82,
        hips: 94,
        shoulders: 44,
        armLength: 65,
        legLength: 95,
        shoeSize: 42
      },
      stylePreferences: {
        colors: ['black', 'white', 'navy', 'gray'],
        styles: ['minimalist', 'casual', 'professional'],
        brands: ['Uniqlo', 'Everlane', 'Allbirds'],
        fit: 'slim',
        occasions: ['work', 'casual', 'formal']
      },
      appearance: {
        skinTone: 'medium',
        hairColor: 'brown',
        eyeColor: 'brown',
        bodyType: 'athletic',
        faceShape: 'oval'
      },
      biometricData: {
        metabolism: 'medium',
        activityLevel: 'moderate',
        stressLevel: 0.3,
        sleepQuality: 0.8,
        energyLevel: 0.7
      },
      shoppingBehavior: {
        budgetRange: { min: 50, max: 200 },
        preferredCategories: ['clothing', 'shoes', 'accessories'],
        shoppingFrequency: 'weekly',
        returnRate: 0.15,
        brandLoyalty: 0.6
      },
      evolutionHistory: [
        {
          date: '2024-05-15',
          version: '1.0',
          changes: ['Initial creation', 'Basic measurements'],
          accuracy: 0.75
        },
        {
          date: '2024-05-18',
          version: '2.0',
          changes: ['Updated measurements', 'Style preferences refined'],
          accuracy: 0.85
        },
        {
          date: '2024-05-20',
          version: '2.1',
          changes: ['Biometric integration', 'Shopping behavior analysis'],
          accuracy: 0.92
        }
      ],
      accuracy: 0.92,
      syncStatus: 'active'
    };

    return NextResponse.json({
      success: true,
      data: digitalTwin
    });
  } catch (error) {
    console.error('Error fetching digital twin:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch digital twin' },
      { status: 500 }
    );
  }
}
