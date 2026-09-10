import { NextRequest, NextResponse } from 'next/server';

// GET /api/style-evolution/eras - Get available style eras
export async function GET(request: NextRequest) {
  try {
    
    const eras = [
      {
        id: 'era-1',
        name: '1920s - Art Deco',
        description: 'Roaring twenties with geometric patterns and luxurious materials',
        timeRange: '1920-1929',
        keyCharacteristics: ['geometric patterns', 'luxurious materials', 'beaded dresses', 'cloche hats'],
        colors: ['gold', 'black', 'silver', 'cream'],
        iconicPieces: ['flapper dresses', 'art deco jewelry', 'cloche hats', 't-strap shoes'],
        accessibility: 'high',
        quantumStability: 0.85
      },
      {
        id: 'era-2',
        name: '1950s - Mid-Century',
        description: 'Post-war optimism with feminine silhouettes and vibrant colors',
        timeRange: '1950-1959',
        keyCharacteristics: ['feminine silhouettes', 'vibrant colors', 'full skirts', 'cinched waists'],
        colors: ['pastel pink', 'turquoise', 'red', 'black'],
        iconicPieces: ['poodle skirts', 'cardigan sweaters', 'saddle shoes', 'pearl necklaces'],
        accessibility: 'high',
        quantumStability: 0.92
      },
      {
        id: 'era-3',
        name: '1970s - Disco & Bohemian',
        description: 'Free-spirited era with bold patterns and diverse styles',
        timeRange: '1970-1979',
        keyCharacteristics: ['bold patterns', 'bell bottoms', 'platform shoes', 'tie-dye'],
        colors: ['orange', 'brown', 'yellow', 'psychedelic'],
        iconicPieces: ['bell bottom jeans', 'platform shoes', 'tie-dye shirts', 'headbands'],
        accessibility: 'medium',
        quantumStability: 0.78
      },
      {
        id: 'era-4',
        name: '1990s - Grunge & Minimalism',
        description: 'Contrasting era with both grunge and minimalist aesthetics',
        timeRange: '1990-1999',
        keyCharacteristics: ['flannel shirts', 'minimalist designs', 'doc martens', 'slip dresses'],
        colors: ['plaid', 'black', 'white', 'denim'],
        iconicPieces: ['flannel shirts', 'doc martens', 'choker necklaces', 'mini backpacks'],
        accessibility: 'high',
        quantumStability: 0.88
      },
      {
        id: 'era-5',
        name: '2040s - Tech-Integrated',
        description: 'Future era with smart fabrics and AI-enhanced designs',
        timeRange: '2040-2049',
        keyCharacteristics: ['smart fabrics', 'AI designs', 'adaptive clothing', 'holographic elements'],
        colors: ['iridescent', 'chromatic', 'neon', 'transparent'],
        iconicPieces: ['color-changing fabrics', 'holographic accessories', 'adaptive shoes', 'neural-integrated wearables'],
        accessibility: 'experimental',
        quantumStability: 0.65
      }
    ];

    return NextResponse.json({
      success: true,
      data: eras
    });
  } catch (error) {
    console.error('Error fetching style eras:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch style eras' },
      { status: 500 }
    );
  }
}
