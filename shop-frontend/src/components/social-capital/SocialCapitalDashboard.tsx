'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Crown, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Star,
  Heart,
  MessageCircle,
  Share2,
  Gift,
  Target,
  Zap,
  Award,
  BarChart3,
  Eye,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface SocialCapitalMetrics {
  totalCapital: number;
  influenceScore: number;
  engagementRate: number;
  followerCount: number;
  followingCount: number;
  postCount: number;
  averageLikes: number;
  averageComments: number;
  shareRate: number;
  monetizationRate: number;
  brandPartnerships: number;
}

interface EarningOpportunity {
  id: string;
  type: 'sponsorship' | 'affiliate' | 'review' | 'collaboration' | 'campaign';
  brand: string;
  title: string;
  description: string;
  reward: {
    type: 'cash' | 'points' | 'products' | 'exclusive_access';
    amount: number;
    currency: string;
  };
  requirements: {
    minFollowers: number;
    minEngagement: number;
    content: string[];
    timeline: string;
  };
  status: 'available' | 'applied' | 'accepted' | 'completed' | 'expired';
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

interface Transaction {
  id: string;
  type: 'earned' | 'spent' | 'bonus' | 'penalty';
  amount: number;
  description: string;
  source: string;
  timestamp: string;
  balance: number;
}

interface LeaderboardEntry {
  userId: string;
  username: string;
  avatar?: string;
  capital: number;
  rank: number;
  change: number;
  badges: string[];
}

export default function SocialCapitalDashboard({ userId }: { userId: string }) {
  const [metrics, setMetrics] = useState<SocialCapitalMetrics | null>(null);
  const [opportunities, setOpportunities] = useState<EarningOpportunity[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isApplying, setIsApplying] = useState<string | null>(null);

  useEffect(() => {
    fetchMetrics();
    fetchOpportunities();
    fetchTransactions();
    fetchLeaderboard();
  }, [userId]);

  const fetchMetrics = async () => {
    try {
      const response = await fetch(`/api/social-capital/metrics?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setMetrics(data.data);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const fetchOpportunities = async () => {
    try {
      const response = await fetch(`/api/social-capital/opportunities?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setOpportunities(data.data);
      }
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`/api/social-capital/transactions?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setTransactions(data.data.slice(-20)); // Last 20 transactions
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/social-capital/leaderboard');
      const data = await response.json();
      if (data.success) {
        setLeaderboard(data.data);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const applyForOpportunity = async (opportunityId: string) => {
    setIsApplying(opportunityId);
    try {
      const response = await fetch(`/api/social-capital/opportunities/${opportunityId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          applicationData: {
            portfolio: 'link_to_portfolio',
            socialLinks: ['instagram', 'tiktok', 'youtube'],
            whyInterested: 'Passionate about fashion and styling'
          }
        })
      });
      const data = await response.json();
      if (data.success) {
        fetchOpportunities();
      }
    } catch (error) {
      console.error('Error applying for opportunity:', error);
    } finally {
      setIsApplying(null);
    }
  };

  const withdrawEarnings = async (amount: number) => {
    try {
      const response = await fetch('/api/social-capital/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          amount,
          method: 'paypal'
        })
      });
      const data = await response.json();
      if (data.success) {
        fetchMetrics();
        fetchTransactions();
      }
    } catch (error) {
      console.error('Error withdrawing earnings:', error);
    }
  };

  const getOpportunityIcon = (type: string) => {
    switch (type) {
      case 'sponsorship': return <Crown className="w-4 h-4" />;
      case 'affiliate': return <ShoppingBag className="w-4 h-4" />;
      case 'review': return <Star className="w-4 h-4" />;
      case 'collaboration': return <Users className="w-4 h-4" />;
      case 'campaign': return <Target className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'hard': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'applied': return 'bg-blue-500';
      case 'accepted': return 'bg-purple-500';
      case 'completed': return 'bg-gray-500';
      case 'expired': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'points' ? 'USD' : currency
    }).format(amount);
  };

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Crown className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Loading social capital data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5" />
              Social Capital - Influence Monetization
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button onClick={() => withdrawEarnings(100)} variant="outline">
                <DollarSign className="w-4 h-4 mr-2" />
                Withdraw $100
              </Button>
              <Button>
                <TrendingUp className="w-4 h-4 mr-2" />
                Boost Influence
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Capital</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.totalCapital, 'USD')}</p>
              </div>
              <Crown className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Influence Score</p>
                <p className="text-2xl font-bold">{Math.round(metrics.influenceScore)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Followers</p>
                <p className="text-2xl font-bold">{metrics.followerCount.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
                <p className="text-2xl font-bold">{Math.round(metrics.engagementRate * 100)}%</p>
              </div>
              <Heart className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Engagement Rate</span>
                      <span>{Math.round(metrics.engagementRate * 100)}%</span>
                    </div>
                    <Progress value={metrics.engagementRate * 100} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Monetization Rate</span>
                      <span>{Math.round(metrics.monetizationRate * 100)}%</span>
                    </div>
                    <Progress value={metrics.monetizationRate * 100} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Share Rate</span>
                      <span>{Math.round(metrics.shareRate * 100)}%</span>
                    </div>
                    <Progress value={metrics.shareRate * 100} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{metrics.postCount}</p>
                      <p className="text-sm text-gray-600">Total Posts</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{metrics.brandPartnerships}</p>
                      <p className="text-sm text-gray-600">Partnerships</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Earnings Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Earnings Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-600 mb-1">Available Balance</p>
                    <p className="text-2xl font-bold text-green-700">
                      {formatCurrency(metrics.totalCapital, 'USD')}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 border rounded">
                      <p className="text-lg font-bold text-blue-600">
                        {formatCurrency(metrics.averageLikes * 0.01, 'USD')}
                      </p>
                      <p className="text-sm text-gray-600">Avg per Like</p>
                    </div>
                    <div className="text-center p-3 border rounded">
                      <p className="text-lg font-bold text-purple-600">
                        {formatCurrency(metrics.averageComments * 0.05, 'USD')}
                      </p>
                      <p className="text-sm text-gray-600">Avg per Comment</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Monthly Projection</p>
                    <p className="text-lg font-bold">
                      {formatCurrency(metrics.totalCapital * 12, 'USD')}
                    </p>
                  </div>

                  <Button className="w-full">
                    <Zap className="w-4 h-4 mr-2" />
                    Maximize Earnings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Earning Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {opportunities.length === 0 ? (
                  <div className="text-center py-8">
                    <Gift className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">No opportunities available</p>
                  </div>
                ) : (
                  opportunities.map((opportunity) => (
                    <div key={opportunity.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(opportunity.status)}`} />
                          <div>
                            <h4 className="font-medium">{opportunity.title}</h4>
                            <p className="text-sm text-gray-600">{opportunity.brand}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className={getDifficultyColor(opportunity.difficulty)}>
                            {opportunity.difficulty}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">{opportunity.description}</p>

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getOpportunityIcon(opportunity.type)}
                          <span className="text-sm capitalize">{opportunity.type}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {formatCurrency(opportunity.reward.amount, opportunity.reward.currency)}
                          </p>
                          <p className="text-xs text-gray-600 capitalize">{opportunity.reward.type}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                        <div>
                          <p className="text-gray-600">Min Followers</p>
                          <p className="font-medium">{opportunity.requirements.minFollowers.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Min Engagement</p>
                          <p className="font-medium">{Math.round(opportunity.requirements.minEngagement * 100)}%</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {opportunity.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => applyForOpportunity(opportunity.id)}
                          disabled={opportunity.status !== 'available' || isApplying === opportunity.id}
                        >
                          {isApplying === opportunity.id ? 'Applying...' : 
                           opportunity.status === 'available' ? 'Apply' : 
                           (opportunity.status ? opportunity.status.charAt(0).toUpperCase() + opportunity.status.slice(1) : 'Unknown')}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No transactions available</p>
                ) : (
                  transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          transaction.type === 'earned' ? 'bg-green-500' :
                          transaction.type === 'spent' ? 'bg-red-500' :
                          transaction.type === 'bonus' ? 'bg-yellow-500' : 'bg-gray-500'
                        }`} />
                        <div>
                          <p className="font-medium text-sm">{transaction.description}</p>
                          <p className="text-xs text-gray-600">{transaction.source}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${
                          transaction.type === 'earned' || transaction.type === 'bonus' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'earned' || transaction.type === 'bonus' ? '+' : '-'}
                          {formatCurrency(transaction.amount, 'USD')}
                        </p>
                        <p className="text-xs text-gray-600">
                          {new Date(transaction.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Social Capital Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Leaderboard data unavailable</p>
                ) : (
                  leaderboard.map((entry) => (
                    <div key={entry.userId} className={`flex items-center justify-between p-3 rounded ${
                      entry.userId === userId ? 'bg-blue-50 border border-blue-200' : 'border'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className="text-lg font-bold text-gray-600">#{entry.rank}</div>
                        <Avatar>
                          <AvatarImage src={entry.avatar} />
                          <AvatarFallback>{entry.username?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{entry.username}</p>
                          <div className="flex items-center gap-1">
                            {entry.change > 0 ? (
                              <ArrowUpRight className="w-3 h-3 text-green-500" />
                            ) : entry.change < 0 ? (
                              <ArrowDownRight className="w-3 h-3 text-red-500" />
                            ) : null}
                            <span className={`text-xs ${
                              entry.change > 0 ? 'text-green-600' : 
                              entry.change < 0 ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              {entry.change > 0 ? '+' : ''}{entry.change}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(entry.capital, 'USD')}</p>
                        <div className="flex flex-wrap gap-1">
                          {entry.badges.slice(0, 2).map((badge, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {badge}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
