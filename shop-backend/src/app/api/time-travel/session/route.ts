import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth-options";

// POST /api/time-travel/session - Start time travel session
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { userId, targetDate, scenario = 'shopping_experience', products } = body;

    const targetUserId = userId || session?.user?.id;

    if (!targetUserId || !targetDate) {
      return NextResponse.json(
        { success: false, error: 'User authentication and target date required' },
        { status: 401 }
      );
    }

    // Validate target date
    const targetDateObj = new Date(targetDate);
    const now = new Date();
    if (isNaN(targetDateObj.getTime()) || targetDateObj > now) {
      return NextResponse.json(
        { success: false, error: 'Invalid target date - must be a valid past date' },
        { status: 400 }
      );
    }

    // Validate scenario
    const validScenarios = ['shopping_experience', 'market_analysis', 'fashion_evolution', 'price_history', 'consumer_behavior'];
    if (!validScenarios.includes(scenario)) {
      return NextResponse.json(
        { success: false, error: 'Invalid scenario type' },
        { status: 400 }
      );
    }

    // Validate products if provided
    let validatedProducts = [];
    if (products && products.length > 0) {
      const dbProducts = await prisma.product.findMany({
        where: { 
          id: { in: products },
          isActive: true 
        },
        select: { id: true, name: true }
      });
      validatedProducts = dbProducts;
    }

    // Create timeline data
    const timeline = {
      era: determineEra(targetDate),
      technology: determineTechnology(targetDate),
      fashion: determineFashion(targetDate),
      economy: determineEconomy(targetDate)
    };

    // Generate quantum state
    const quantumState = {
    };

    // Generate predictions based on target date and scenario
    const predictions = generatePredictions(targetDate, scenario);

    // Create time travel session in database
    const timeTravelSession = await prisma.timeTravelSession.create({
      data: {
        userId: targetUserId,
        timeEra: 'future',
        targetDate: targetDateObj,
        scenario,
        estimatedDuration: 300,
        products: JSON.stringify(validatedProducts),
        timeline: JSON.stringify(timeline),
        quantumState: JSON.stringify(quantumState),
        predictions: JSON.stringify(predictions),
        interactions: JSON.stringify([])
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: timeTravelSession,
      message: 'Time travel session initiated successfully'
    });
  } catch (error) {
    console.error('Error starting time travel session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to start time travel session' },
      { status: 500 }
    );
  }
}

// GET /api/time-travel/session - Get session status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID required' },
        { status: 400 }
      );
    }

    // Get session from database
    const timeTravelSession = await prisma.timeTravelSession.findUnique({
      where: { id: sessionId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    });

    if (!timeTravelSession) {
      return NextResponse.json(
        { success: false, error: 'Time travel session not found' },
        { status: 404 }
      );
    }

    // Check if user has permission to view this session
    if (session?.user?.id !== timeTravelSession.userId) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // Calculate session progress and remaining time
    const elapsed = Date.now() - new Date(timeTravelSession.startTime).getTime();
    const estimatedDuration = timeTravelSession.estimatedDuration || 300
    const progress = Math.min(1, elapsed / (estimatedDuration * 1000))
    const remainingTime = Math.max(0, (estimatedDuration * 1000) - elapsed)
    // Generate insights based on session data
    const insights = generateSessionInsights(timeTravelSession);

    // Generate recommendations
    const recommendations = generateRecommendations(timeTravelSession);

    // Update session status if needed
    let updatedStatus = timeTravelSession.status;
    if (progress >= 1 && timeTravelSession.status === 'active') {
      updatedStatus = 'completed';
      await prisma.timeTravelSession.update({
        where: { id: sessionId },
        data: { 
          status: 'completed',
          endTime: new Date()
        }
      });
    }

    const quantumState = timeTravelSession.quantumState ? JSON.parse(timeTravelSession.quantumState as string) : {}
    const interactions = timeTravelSession.interactions ? JSON.parse(timeTravelSession.interactions as string) : []
    const sessionData = {
      id: timeTravelSession.id,
      status: updatedStatus,
      progress: Math.round(progress * 100) / 100,
      quantumStability: quantumState.stability || 0.85,
      dataCollected: {
        fashionTrends: interactions.filter((i: any) => i.type === 'fashion').length || 12,
        pricingData: interactions.filter((i: any) => i.type === 'pricing').length || 8,
        consumerBehavior: interactions.filter((i: any) => i.type === 'behavior').length || 15,
        marketAnalysis: interactions.filter((i: any) => i.type === 'market').length || 6
      },
      insights,
      remainingTime: Math.round(remainingTime / 1000),
      recommendations,
      timeline: timeTravelSession.timeline,
      predictions: timeTravelSession.predictions,
      products: timeTravelSession.products,
      startTime: timeTravelSession.startTime,
      targetDate: timeTravelSession.targetDate,
      scenario: timeTravelSession.scenario
    };

    return NextResponse.json({
      success: true,
      data: sessionData
    });
  } catch (error) {
    console.error('Error fetching time travel session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch time travel session' },
      { status: 500 }
    );
  }
}

function determineEra(targetDate: string): string {
  const year = new Date(targetDate).getFullYear();
  if (year >= 2020) return 'contemporary';
  if (year >= 2000) return 'modern';
  if (year >= 1980) return 'postmodern';
  if (year >= 1960) return 'space_age';
  if (year >= 1940) return 'mid_century';
  if (year >= 1920) return 'art_deco';
  return 'vintage';
}

function determineTechnology(targetDate: string): string {
  const year = new Date(targetDate).getFullYear();
  if (year >= 2020) return 'digital_ai';
  if (year >= 2010) return 'smart_mobile';
  if (year >= 2000) return 'internet_digital';
  if (year >= 1990) return 'personal_computing';
  if (year >= 1980) return 'analog_digital';
  if (year >= 1970) return 'electronic';
  return 'mechanical';
}

function determineFashion(targetDate: string): string {
  const year = new Date(targetDate).getFullYear();
  if (year >= 2020) return 'sustainable_tech';
  if (year >= 2010) return 'fast_fashion';
  if (year >= 2000) return 'minimalist';
  if (year >= 1990) return 'grunge_hip_hop';
  if (year >= 1980) return 'power_dressing';
  if (year >= 1970) return 'disco_punk';
  if (year >= 1960) return 'mod_hippie';
  return 'classic_elegant';
}

function determineEconomy(targetDate: string): string {
  const year = new Date(targetDate).getFullYear();
  if (year >= 2020) return 'digital_economy';
  if (year >= 2010) return 'recovery_growth';
  if (year >= 2000) return 'globalization';
  if (year >= 1990) return 'post_cold_war';
  if (year >= 1980) return 'neoliberal';
  if (year >= 1970) return 'stagflation';
  if (year >= 1960) return 'post_war_boom';
  return 'industrial';
}

function generatePredictions(targetDate: string, scenario: string): any[] {
  const year = new Date(targetDate).getFullYear();
  
  const basePredictions = [
    {
      type: 'fashion',
      confidence: 0.78,
      prediction: 'Classic designs will remain valuable',
      timeframe: 'long_term',
      impact: 'high'
    },
    {
      type: 'pricing',
      confidence: 0.82,
      prediction: 'Quality items appreciate in value',
      timeframe: 'medium_term',
      impact: 'medium'
    },
    {
      type: 'technology',
      confidence: 0.71,
      prediction: 'Smart integration becomes standard',
      timeframe: 'short_term',
      impact: 'high'
    }
  ];

  // Adjust predictions based on scenario
  if (scenario === 'fashion_evolution') {
    return [
      {
        type: 'fashion',
        confidence: 0.85,
        prediction: `${year >= 2000 ? 'Minimalist aesthetics will dominate' : 'Ornate designs will be popular'}`,
        timeframe: 'medium_term',
        impact: 'high'
      },
      ...basePredictions.slice(1)
    ];
  } else if (scenario === 'price_history') {
    return [
      {
        type: 'pricing',
        confidence: 0.90,
        prediction: 'Inflation-adjusted prices show consistent patterns',
        timeframe: 'long_term',
        impact: 'high'
      },
      ...basePredictions.filter(p => p.type !== 'pricing')
    ];
  }

  return basePredictions;
}

function generateSessionInsights(session: any): string[] {
  const insights = [];
  const era = session.timeline?.era;
  const technology = session.timeline?.technology;
  
  if (era) {
    insights.push(`${era.charAt(0).toUpperCase() + era.slice(1)} era shows distinct consumer patterns`);
  }
  
  if (technology) {
    insights.push(`Technology level (${technology.replace('_', ' ')}) significantly impacts purchasing behavior`);
  }
  
  insights.push('Fashion trends show cyclic patterns every 20 years');
  insights.push('Pricing follows inflation-adjusted baselines');
  insights.push('Consumer behavior shifts with technological adoption');
  
  return insights;
}

function generateRecommendations(session: any): string[] {
  const recommendations = [];
  const scenario = session.scenario;
  
  if (scenario === 'shopping_experience') {
    recommendations.push('Focus on sustainable materials');
    recommendations.push('Consider timeless designs');
  } else if (scenario === 'market_analysis') {
    recommendations.push('Analyze market cycles for investment pieces');
    recommendations.push('Monitor economic indicators for pricing trends');
  } else if (scenario === 'fashion_evolution') {
    recommendations.push('Study historical fashion cycles');
    recommendations.push('Identify recurring pattern elements');
  }
  
  recommendations.push('use data for predictive modeling');
  recommendations.push('Consider cultural context in trend analysis');
  
  return recommendations;
}
