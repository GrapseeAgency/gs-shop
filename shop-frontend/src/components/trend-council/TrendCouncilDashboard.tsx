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
  Star, 
  TrendingUp, 
  Award, 
  Target,
  Eye,
  Calendar,
  BarChart3,
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  Zap,
  Lightbulb,
  Globe,
  Heart,
  MessageCircle,
  Vote,
  Download
} from 'lucide-react';

interface CouncilMember {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  role: 'chair' | 'member' | 'junior_member' | 'honorary';
  expertise: string[];
  influenceScore: number;
  accuracyRate: number;
  contributions: {
    predictions: number;
    validations: number;
    vetoes: number;
  };
  joinDate: string;
  isActive: boolean;
}

interface TrendPrediction {
  id: string;
  title: string;
  description: string;
  category: 'fashion' | 'beauty' | 'lifestyle' | 'technology' | 'culture';
  timeframe: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'revolutionary';
  status: 'proposed' | 'under_review' | 'approved' | 'rejected' | 'validated' | 'debunked';
  proposer: CouncilMember;
  supporters: CouncilMember[];
  validators: CouncilMember[];
  evidence: string[];
  metrics: {
    views: number;
    shares: number;
    discussions: number;
    accuracy: number;
  };
  createdAt: string;
  validatedAt?: string;
}

interface VotingSession {
  id: string;
  title: string;
  description: string;
  type: 'prediction_approval' | 'trend_validation' | 'membership' | 'policy_change';
  status: 'active' | 'completed' | 'cancelled';
  startTime: string;
  endTime: string;
  votes: {
    for: number;
    against: number;
    abstain: number;
    total: number;
  };
  participants: string[];
  quorumRequired: number;
  result?: 'approved' | 'rejected' | 'tie';
}

interface TrendReport {
  id: string;
  title: string;
  period: string;
  summary: string;
  keyTrends: string[];
  predictions: TrendPrediction[];
  impact: {
    economic: number;
    social: number;
    cultural: number;
  };
  downloads: number;
  rating: number;
  publishedAt: string;
}

export default function TrendCouncilDashboard({ userId }: { userId: string }) {
  const [councilMembers, setCouncilMembers] = useState<CouncilMember[]>([]);
  const [predictions, setPredictions] = useState<TrendPrediction[]>([]);
  const [votingSessions, setVotingSessions] = useState<VotingSession[]>([]);
  const [reports, setReports] = useState<TrendReport[]>([]);
  const [userMembership, setUserMembership] = useState<CouncilMember | null>(null);
  const [activeTab, setActiveTab] = useState('predictions');
  const [isVoting, setIsVoting] = useState<string | null>(null);

  useEffect(() => {
    fetchCouncilMembers();
    fetchPredictions();
    fetchVotingSessions();
    fetchReports();
    fetchUserMembership();
  }, [userId]);

  const fetchCouncilMembers = async () => {
    try {
      const response = await fetch('/api/trend-council/members');
      const data = await response.json();
      if (data.success) {
        setCouncilMembers(data.data);
      }
    } catch (error) {
      console.error('Error fetching council members:', error);
    }
  };

  const fetchPredictions = async () => {
    try {
      const response = await fetch('/api/trend-council/predictions');
      const data = await response.json();
      if (data.success) {
        setPredictions(data.data);
      }
    } catch (error) {
      console.error('Error fetching predictions:', error);
    }
  };

  const fetchVotingSessions = async () => {
    try {
      const response = await fetch('/api/trend-council/voting');
      const data = await response.json();
      if (data.success) {
        setVotingSessions(data.data);
      }
    } catch (error) {
      console.error('Error fetching voting sessions:', error);
    }
  };

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/trend-council/reports');
      const data = await response.json();
      if (data.success) {
        setReports(data.data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const fetchUserMembership = async () => {
    try {
      const response = await fetch(`/api/trend-council/membership/${userId}`);
      const data = await response.json();
      if (data.success) {
        setUserMembership(data.data);
      }
    } catch (error) {
      console.error('Error fetching user membership:', error);
    }
  };

  const submitPrediction = async (title: string, description: string, category: string) => {
    try {
      const response = await fetch('/api/trend-council/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          title,
          description,
          category,
          timeframe: '6-months',
          confidence: 0.75,
          impact: 'high',
          evidence: ['market_research', 'social_media_analysis']
        })
      });
      const data = await response.json();
      if (data.success) {
        fetchPredictions();
      }
    } catch (error) {
      console.error('Error submitting prediction:', error);
    }
  };

  const voteOnPrediction = async (predictionId: string, vote: 'for' | 'against' | 'abstain') => {
    setIsVoting(predictionId);
    try {
      const response = await fetch(`/api/trend-council/predictions/${predictionId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          vote,
          reasoning: 'Based on current market trends'
        })
      });
      const data = await response.json();
      if (data.success) {
        fetchPredictions();
      }
    } catch (error) {
      console.error('Error voting on prediction:', error);
    } finally {
      setIsVoting(null);
    }
  };

  const voteOnSession = async (sessionId: string, vote: 'for' | 'against' | 'abstain') => {
    setIsVoting(sessionId);
    try {
      const response = await fetch(`/api/trend-council/voting/${sessionId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          vote
        })
      });
      const data = await response.json();
      if (data.success) {
        fetchVotingSessions();
      }
    } catch (error) {
      console.error('Error voting on session:', error);
    } finally {
      setIsVoting(null);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'chair': return 'text-yellow-600';
      case 'member': return 'text-blue-600';
      case 'junior_member': return 'text-green-600';
      case 'honorary': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'validated': return 'bg-blue-500';
      case 'under_review': return 'bg-yellow-500';
      case 'rejected': return 'bg-red-500';
      case 'debunked': return 'bg-gray-500';
      case 'active': return 'bg-blue-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'revolutionary': return 'text-purple-600';
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (!userMembership) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Crown className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">You are not a member of the Trend Council</p>
          <Button className="mt-4">Apply for Membership</Button>
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
              Trend Council - Elite Trendsetters
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={getRoleColor(userMembership.role)}>
                {userMembership.role.replace('_', ' ')}
              </Badge>
              <Badge variant="outline">
                Accuracy: {Math.round(userMembership.accuracyRate * 100)}%
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Council Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Council Members</p>
                <p className="text-2xl font-bold">{councilMembers.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Predictions</p>
                <p className="text-2xl font-bold">
                  {predictions.filter(p => p.status === 'approved' || p.status === 'under_review').length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Your Contributions</p>
                <p className="text-2xl font-bold">{userMembership.contributions.predictions}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Influence Score</p>
                <p className="text-2xl font-bold">{Math.round(userMembership.influenceScore)}</p>
              </div>
              <Award className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="voting">Voting</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Trend Predictions
                </CardTitle>
                <Button onClick={() => submitPrediction('New Trend', 'Description', 'fashion')}>
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Submit Prediction
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {predictions.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No predictions available</p>
                ) : (
                  predictions.map((prediction) => (
                    <div key={prediction.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(prediction.status)}`} />
                          <div>
                            <h4 className="font-medium">{prediction.title}</h4>
                            <p className="text-sm text-gray-600">{prediction.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className={getImpactColor(prediction.impact)}>
                            {prediction.impact}
                          </Badge>
                          <p className="text-xs text-gray-600 mt-1">
                            {Math.round(prediction.confidence * 100)}% confidence
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                        <div>
                          <p className="text-gray-600">Category</p>
                          <p className="font-medium capitalize">{prediction.category}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Timeframe</p>
                          <p className="font-medium">{prediction.timeframe}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Supporters</p>
                          <p className="font-medium">{prediction.supporters.length}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Accuracy</p>
                          <p className="font-medium">
                            {prediction.metrics.accuracy ? Math.round(prediction.metrics.accuracy * 100) + '%' : 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={prediction.proposer.avatar} />
                            <AvatarFallback>{prediction.proposer?.name?.charAt(0) || 'T'}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-gray-600">
                            Proposed by {prediction.proposer.name}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {(prediction.status === 'under_review' || prediction.status === 'proposed') && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => voteOnPrediction(prediction.id, 'for')}
                                disabled={isVoting === prediction.id}
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Support
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => voteOnPrediction(prediction.id, 'against')}
                                disabled={isVoting === prediction.id}
                              >
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          <Button size="sm" variant="outline">
                            <Eye className="w-3 h-3 mr-1" />
                            Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="voting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Vote className="w-5 h-5" />
                Active Voting Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {votingSessions.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No active voting sessions</p>
                ) : (
                  votingSessions.map((session) => (
                    <div key={session.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(session.status)}`} />
                          <div>
                            <h4 className="font-medium">{session.title}</h4>
                            <p className="text-sm text-gray-600">{session.description}</p>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {session.type.replace('_', ' ')}
                        </Badge>
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between text-sm">
                          <span>For</span>
                          <span>{session.votes.for} ({Math.round(session.votes.for / session.votes.total * 100)}%)</span>
                        </div>
                        <Progress value={(session.votes.for / session.votes.total) * 100} />
                        
                        <div className="flex justify-between text-sm">
                          <span>Against</span>
                          <span>{session.votes.against} ({Math.round(session.votes.against / session.votes.total * 100)}%)</span>
                        </div>
                        <Progress value={(session.votes.against / session.votes.total) * 100} />
                        
                        <div className="flex justify-between text-sm">
                          <span>Abstain</span>
                          <span>{session.votes.abstain} ({Math.round(session.votes.abstain / session.votes.total * 100)}%)</span>
                        </div>
                        <Progress value={(session.votes.abstain / session.votes.total) * 100} />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          <p>Participants: {session.participants.length}/{session.quorumRequired} (quorum)</p>
                          <p>Ends: {new Date(session.endTime).toLocaleString()}</p>
                        </div>
                        {session.status === 'active' && (
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => voteOnSession(session.id, 'for')}
                              disabled={isVoting === session.id}
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              For
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => voteOnSession(session.id, 'against')}
                              disabled={isVoting === session.id}
                            >
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Against
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Council Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {councilMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name?.charAt(0) || 'M'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-gray-600">
                          Joined {new Date(member.joinDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className={getRoleColor(member.role)}>
                        {member.role.replace('_', ' ')}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-1">
                        Accuracy: {Math.round(member.accuracyRate * 100)}%
                      </p>
                      <p className="text-xs text-gray-500">
                        {member.contributions.predictions} predictions
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Trend Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No reports available</p>
                ) : (
                  reports.map((report) => (
                    <div key={report.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{report.title}</h4>
                          <p className="text-sm text-gray-600">{report.summary}</p>
                        </div>
                        <Badge variant="outline">
                          {report.period}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                        <div>
                          <p className="text-gray-600">Economic Impact</p>
                          <p className="font-medium">{report.impact.economic}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Social Impact</p>
                          <p className="font-medium">{report.impact.social}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Cultural Impact</p>
                          <p className="font-medium">{report.impact.cultural}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Rating</p>
                          <p className="font-medium">{report.rating.toFixed(1)}/5.0</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          {report.keyTrends.slice(0, 3).map((trend, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {trend}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Download className="w-4 h-4" />
                          <span>{report.downloads} downloads</span>
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
