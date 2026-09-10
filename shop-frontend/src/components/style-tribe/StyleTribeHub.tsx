'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Crown, 
  Star, 
  Heart, 
  MessageCircle,
  ShoppingBag,
  TrendingUp,
  Calendar,
  Award,
  Target,
  Zap,
  Eye,
  Plus,
  Settings,
  Gift,
  BarChart3,
  Clock,
  CheckCircle
} from 'lucide-react';

interface StyleTribe {
  id: string;
  name: string;
  description: string;
  aesthetic: string;
  memberCount: number;
  maxMembers: number;
  leaderId: string;
  leader: {
    id: string;
    name: string;
    avatar?: string;
  };
  tags: string[];
  requirements: {
    minStyleScore: number;
    aesthetic: string;
    invitationRequired: boolean;
  };
  perks: string[];
  isActive: boolean;
  createdAt: string;
}

interface TribeMember {
  id: string;
  userId: string;
  tribeId: string;
  role: 'leader' | 'moderator' | 'member' | 'vip';
  joinDate: string;
  contributionScore: number;
  styleAlignment: number;
  activities: {
    posts: number;
    comments: number;
    likes: number;
    shares: number;
  };
  achievements: string[];
}

interface CollectiveShopping {
  id: string;
  tribeId: string;
  title: string;
  description: string;
  type: 'group_buy' | 'style_challenge' | 'trend_setting' | 'brand_collaboration';
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  participants: string[];
  targetProducts: any[];
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  deadline: string;
  rewards: {
    points: number;
    badges: string[];
    exclusiveAccess: string[];
  };
}

interface TrendInitiative {
  id: string;
  tribeId: string;
  title: string;
  description: string;
  trendType: 'fashion' | 'lifestyle' | 'beauty' | 'accessories';
  impact: number;
  participants: number;
  status: 'proposed' | 'active' | 'trending' | 'established';
  metrics: {
    views: number;
    likes: number;
    shares: number;
    adoption: number;
  };
  hashtags: string[];
}

export default function StyleTribeHub({ userId }: { userId: string }) {
  const [userTribes, setUserTribes] = useState<StyleTribe[]>([]);
  const [allTribes, setAllTribes] = useState<StyleTribe[]>([]);
  const [tribeMembers, setTribeMembers] = useState<TribeMember[]>([]);
  const [collectiveShopping, setCollectiveShopping] = useState<CollectiveShopping[]>([]);
  const [trendInitiatives, setTrendInitiatives] = useState<TrendInitiative[]>([]);
  const [activeTab, setActiveTab] = useState('my-tribes');
  const [selectedTribe, setSelectedTribe] = useState<StyleTribe | null>(null);

  useEffect(() => {
    fetchUserTribes();
    fetchAllTribes();
    fetchCollectiveShopping();
    fetchTrendInitiatives();
  }, [userId]);

  const fetchUserTribes = async () => {
    try {
      const response = await fetch(`/api/style-tribe/user/${userId}`);
      const data = await response.json();
      if (data.success) {
        setUserTribes(data.data);
      }
    } catch (error) {
      console.error('Error fetching user tribes:', error);
    }
  };

  const fetchAllTribes = async () => {
    try {
      const response = await fetch('/api/style-tribe/discover');
      const data = await response.json();
      if (data.success) {
        setAllTribes(data.data);
      }
    } catch (error) {
      console.error('Error fetching all tribes:', error);
    }
  };

  const fetchTribeMembers = async (tribeId: string) => {
    try {
      const response = await fetch(`/api/style-tribe/${tribeId}/members`);
      const data = await response.json();
      if (data.success) {
        setTribeMembers(data.data);
      }
    } catch (error) {
      console.error('Error fetching tribe members:', error);
    }
  };

  const fetchCollectiveShopping = async () => {
    try {
      const response = await fetch(`/api/style-tribe/shopping?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setCollectiveShopping(data.data);
      }
    } catch (error) {
      console.error('Error fetching collective shopping:', error);
    }
  };

  const fetchTrendInitiatives = async () => {
    try {
      const response = await fetch(`/api/style-tribe/trends?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setTrendInitiatives(data.data);
      }
    } catch (error) {
      console.error('Error fetching trend initiatives:', error);
    }
  };

  const joinTribe = async (tribeId: string) => {
    try {
      const response = await fetch(`/api/style-tribe/${tribeId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          applicationMessage: 'Passionate about fashion and style'
        })
      });
      const data = await response.json();
      if (data.success) {
        fetchUserTribes();
        fetchAllTribes();
      }
    } catch (error) {
      console.error('Error joining tribe:', error);
    }
  };

  const leaveTribe = async (tribeId: string) => {
    try {
      const response = await fetch(`/api/style-tribe/${tribeId}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await response.json();
      if (data.success) {
        fetchUserTribes();
        if (selectedTribe?.id === tribeId) {
          setSelectedTribe(null);
        }
      }
    } catch (error) {
      console.error('Error leaving tribe:', error);
    }
  };

  const startCollectiveShopping = async (tribeId: string, type: string) => {
    try {
      const response = await fetch('/api/style-tribe/shopping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tribeId,
          userId,
          type,
          title: `Group Shopping Session`,
          description: 'Let\'s shop together!',
          budget: { min: 50, max: 500, currency: 'USD' },
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
      });
      const data = await response.json();
      if (data.success) {
        fetchCollectiveShopping();
      }
    } catch (error) {
      console.error('Error starting collective shopping:', error);
    }
  };

  const proposeTrend = async (tribeId: string, title: string, description: string) => {
    try {
      const response = await fetch('/api/style-tribe/trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tribeId,
          userId,
          title,
          description,
          trendType: 'fashion',
          hashtags: ['styletribe', 'collectivefashion']
        })
      });
      const data = await response.json();
      if (data.success) {
        fetchTrendInitiatives();
      }
    } catch (error) {
      console.error('Error proposing trend:', error);
    }
  };

  const getShoppingIcon = (type: string) => {
    switch (type) {
      case 'group_buy': return <ShoppingBag className="w-5 h-5" />;
      case 'style_challenge': return <Target className="w-5 h-5" />;
      case 'trend_setting': return <TrendingUp className="w-5 h-5" />;
      case 'brand_collaboration': return <Award className="w-5 h-5" />;
      default: return <ShoppingBag className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'planning': return 'bg-blue-500';
      case 'completed': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      case 'trending': return 'bg-purple-500';
      case 'established': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'leader': return 'text-yellow-600';
      case 'moderator': return 'text-blue-600';
      case 'vip': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Style Tribes - Collective Shopping
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {userTribes.length} Tribes
              </Badge>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Tribe
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="my-tribes">My Tribes</TabsTrigger>
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="shopping">Collective Shopping</TabsTrigger>
          <TabsTrigger value="trends">Trend Initiatives</TabsTrigger>
        </TabsList>

        <TabsContent value="my-tribes" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userTribes.map((tribe) => (
              <Card key={tribe.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${tribe.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <div>
                        <h3 className="font-medium">{tribe.name}</h3>
                        <p className="text-sm text-gray-600">{tribe.aesthetic}</p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {tribe.memberCount}/{tribe.maxMembers}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{tribe.description}</p>

                  <div className="flex items-center gap-2 mb-3">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={tribe.leader.avatar} />
                      <AvatarFallback>{tribe.leader?.name?.charAt(0) || 'T'}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-gray-600">Led by {tribe.leader.name}</span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {tribe.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setSelectedTribe(tribe);
                        fetchTribeMembers(tribe.id);
                      }}
                      className="flex-1"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => startCollectiveShopping(tribe.id, 'group_buy')}
                    >
                      <ShoppingBag className="w-3 h-3 mr-1" />
                      Shop
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="discover" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allTribes.filter(tribe => !userTribes.some(userTribe => userTribe.id === tribe.id)).map((tribe) => (
              <Card key={tribe.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${tribe.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <div>
                        <h3 className="font-medium">{tribe.name}</h3>
                        <p className="text-sm text-gray-600">{tribe.aesthetic}</p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {tribe.memberCount}/{tribe.maxMembers}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{tribe.description}</p>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2">
                      <Crown className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs">{tribe.leader.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs">
                        Min Style Score: {tribe.requirements.minStyleScore}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {tribe.tags.slice(0, 2).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <Button 
                    size="sm" 
                    onClick={() => joinTribe(tribe.id)}
                    disabled={tribe.memberCount >= tribe.maxMembers}
                    className="w-full"
                  >
                    {tribe.memberCount >= tribe.maxMembers ? 'Full' : 'Join Tribe'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="shopping" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Collective Shopping Sessions
                </CardTitle>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Start Session
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {collectiveShopping.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">No collective shopping sessions</p>
                  </div>
                ) : (
                  collectiveShopping.map((session) => (
                    <div key={session.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(session.status)}`} />
                          {getShoppingIcon(session.type)}
                          <div>
                            <h4 className="font-medium">{session.title}</h4>
                            <p className="text-sm text-gray-600">{session.description}</p>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {session.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                        <div>
                          <p className="text-gray-600">Participants</p>
                          <p className="font-medium">{session.participants.length}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Budget Range</p>
                          <p className="font-medium">
                            ${session.budget.min}-${session.budget.max}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Target Products</p>
                          <p className="font-medium">{session.targetProducts.length}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Deadline</p>
                          <p className="font-medium">
                            {new Date(session.deadline).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          {session.rewards.badges.map((badge, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {badge}
                            </Badge>
                          ))}
                        </div>
                        <Button size="sm">
                          Join Session
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Trend Initiatives
                </CardTitle>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Propose Trend
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trendInitiatives.length === 0 ? (
                  <div className="text-center py-8">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">No trend initiatives yet</p>
                  </div>
                ) : (
                  trendInitiatives.map((trend) => (
                    <div key={trend.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(trend.status)}`} />
                          <div>
                            <h4 className="font-medium">{trend.title}</h4>
                            <p className="text-sm text-gray-600">{trend.description}</p>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {trend.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                        <div>
                          <p className="text-gray-600">Impact</p>
                          <p className="font-medium">{trend.impact}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Participants</p>
                          <p className="font-medium">{trend.participants}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Views</p>
                          <p className="font-medium">{trend.metrics.views.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Adoption</p>
                          <p className="font-medium">{trend.metrics.adoption}%</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          {trend.hashtags.map((hashtag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              #{hashtag}
                            </Badge>
                          ))}
                        </div>
                        <Button size="sm" variant="outline">
                          Support Trend
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Tribe Details Modal */}
      {selectedTribe && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                {selectedTribe.name} - Members
              </CardTitle>
              <Button 
                variant="outline" 
                onClick={() => setSelectedTribe(null)}
              >
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tribeMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{member.userId?.charAt(0) || 'M'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.userId}</p>
                      <p className="text-sm text-gray-600">
                        Joined {new Date(member.joinDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className={getRoleColor(member.role)}>
                      {member.role}
                    </Badge>
                    <p className="text-sm text-gray-600 mt-1">
                      Score: {member.contributionScore}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
