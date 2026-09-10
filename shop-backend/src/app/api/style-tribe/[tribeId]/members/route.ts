import { NextRequest, NextResponse } from 'next/server';

// GET /api/style-tribe/[tribeId]/members - Get tribe members
export async function GET(request: NextRequest, { params }: { params: Promise<{ tribeId: string }> }) {
  try {
    const { tribeId } = await params;

    
    const members = [
      {
        id: 'member-1',
        userId: 'user-1',
        name: 'Emma Thompson',
        username: 'emma_style',
        avatar: '/images/members/emma.jpg',
        role: 'leader',
        joinedAt: '2024-01-15',
        status: 'active',
        stats: {
          posts: 156,
          likes: 892,
          shares: 234,
          influence: 0.92
        },
        specialties: ['minimalist fashion', 'sustainable brands', 'capsule wardrobes'],
        achievements: [
          { id: 'ach-1', name: 'Trendsetter', icon: '' },
          { id: 'ach-2', name: 'Style Guru', icon: '' }
        ]
      },
      {
        id: 'member-2',
        userId: 'user-2',
        name: 'Marcus Chen',
        username: 'marcus_fashion',
        avatar: '/images/members/marcus.jpg',
        role: 'moderator',
        joinedAt: '2024-02-20',
        status: 'active',
        stats: {
          posts: 89,
          likes: 456,
          shares: 123,
          influence: 0.78
        },
        specialties: ['street style', 'urban fashion', 'contemporary trends'],
        achievements: [
          { id: 'ach-3', name: 'Community Builder', icon: '' }
        ]
      },
      {
        id: 'member-3',
        userId: 'user-3',
        name: 'Sophie Laurent',
        username: 'sophie_chic',
        avatar: '/images/members/sophie.jpg',
        role: 'member',
        joinedAt: '2024-03-10',
        status: 'active',
        stats: {
          posts: 45,
          likes: 234,
          shares: 67,
          influence: 0.65
        },
        specialties: ['luxury fashion', 'brand analysis', 'investment pieces'],
        achievements: []
      },
      {
        id: 'member-4',
        userId: 'user-4',
        name: 'David Kim',
        username: 'david_style',
        avatar: '/images/members/david.jpg',
        role: 'member',
        joinedAt: '2024-03-25',
        status: 'active',
        stats: {
          posts: 23,
          likes: 123,
          shares: 34,
          influence: 0.52
        },
        specialties: ['vintage fashion', 'thrifting', 'sustainable shopping'],
        achievements: []
      }
    ];

    return NextResponse.json({
      success: true,
      data: members,
      total: members.length
    });
  } catch (error) {
    console.error('Error fetching tribe members:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tribe members' },
      { status: 500 }
    );
  }
}
