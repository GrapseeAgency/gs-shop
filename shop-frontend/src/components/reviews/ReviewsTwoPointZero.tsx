'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageCircle, 
  Star, 
  Heart, 
  Brain, 
  Eye,
  TrendingUp,
  BarChart3,
  Users,
  ThumbsUp,
  ThumbsDown,
  Reply,
  Share2,
  Bookmark,
  Flag,
  Zap,
  Lightbulb,
  Award,
  Target,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface NeuralReview {
  id: string;
  productId: string;
  userId: string;
  user: {
    name: string;
    avatar?: string;
    verified: boolean;
    influenceScore: number;
  };
  rating: number;
  title: string;
  content: string;
  neuralAnalysis: {
    emotionalTone: {
      primary: string;
      secondary: string;
      intensity: number;
    };
    sentiment: {
      overall: number;
      positive: number;
      negative: number;
      neutral: number;
    };
    cognitiveLoad: number;
    authenticity: number;
    engagement: number;
    keywords: string[];
    entities: string[];
  };
  multimedia: {
    images: string[];
    videos: string[];
    audio?: string;
  };
  behavioralData: {
    timeToWrite: number;
    edits: number;
    readingTime: number;
    interactionPattern: string[];
  };
  socialProof: {
    helpfulVotes: number;
    totalVotes: number;
    comments: number;
    shares: number;
    bookmarks: number;
  };
  verification: {
    isVerified: boolean;
    verificationMethod: string;
    confidence: number;
  };
  insights: {
    keyPoints: string[];
    pros: string[];
    cons: string[];
    recommendations: string[];
  };
  responses: ReviewResponse[];
  createdAt: string;
  updatedAt: string;
}

interface ReviewResponse {
  id: string;
  reviewId: string;
  userId: string;
  user: {
    name: string;
    avatar?: string;
  };
  content: string;
  type: 'question' | 'clarification' | 'agreement' | 'disagreement' | 'additional_info';
  neuralAnalysis: {
    sentiment: number;
    relevance: number;
    helpfulness: number;
  };
  createdAt: string;
}

interface ReviewInsight {
  id: string;
  productId: string;
  type: 'summary' | 'trend' | 'recommendation' | 'warning';
  title: string;
  description: string;
  confidence: number;
  data: any;
  generatedAt: string;
}

export default function ReviewsTwoPointZero({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<NeuralReview[]>([]);
  const [insights, setInsights] = useState<ReviewInsight[]>([]);
  const [selectedReview, setSelectedReview] = useState<NeuralReview | null>(null);
  const [sortBy, setSortBy] = useState<'most_helpful' | 'newest' | 'highest_rating' | 'most_authentic'>('most_helpful');
  const [filterBy, setFilterBy] = useState<'all' | 'verified' | 'with_images' | 'with_insights'>('all');
  const [activeTab, setActiveTab] = useState('reviews');

  useEffect(() => {
    fetchReviews();
    fetchInsights();
  }, [productId, sortBy, filterBy]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews-2.0?productId=${productId}&sortBy=${sortBy}&filter=${filterBy}`);
      const data = await response.json();
      if (data.success) {
        setReviews(data.data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchInsights = async () => {
    try {
      const response = await fetch(`/api/reviews-2.0/insights?productId=${productId}`);
      const data = await response.json();
      if (data.success) {
        setInsights(data.data);
      }
    } catch (error) {
      console.error('Error fetching insights:', error);
    }
  };

  const voteOnReview = async (reviewId: string, voteType: 'helpful' | 'not_helpful') => {
    try {
      const response = await fetch(`/api/reviews-2.0/${reviewId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'current',
          voteType
        })
      });
      const data = await response.json();
      if (data.success) {
        fetchReviews();
      }
    } catch (error) {
      console.error('Error voting on review:', error);
    }
  };

  const respondToReview = async (reviewId: string, content: string, type: string) => {
    try {
      const response = await fetch(`/api/reviews-2.0/${reviewId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'current',
          content,
          type
        })
      });
      const data = await response.json();
      if (data.success) {
        fetchReviews();
        if (selectedReview?.id === reviewId) {
          setSelectedReview(data.data);
        }
      }
    } catch (error) {
      console.error('Error responding to review:', error);
    }
  };

  const generateInsights = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/reviews-2.0/${reviewId}/insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisType: 'comprehensive',
          includeRecommendations: true
        })
      });
      const data = await response.json();
      if (data.success) {
        fetchReviews();
        fetchInsights();
      }
    } catch (error) {
      console.error('Error generating insights:', error);
    }
  };

  const getEmotionalColor = (emotion: string) => {
    switch (emotion) {
      case 'joy': return 'text-yellow-600';
      case 'excitement': return 'text-orange-600';
      case 'satisfaction': return 'text-green-600';
      case 'disappointment': return 'text-red-600';
      case 'frustration': return 'text-red-600';
      case 'neutral': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.6) return 'text-green-600';
    if (sentiment > 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAuthenticityColor = (authenticity: number) => {
    if (authenticity > 0.8) return 'text-green-600';
    if (authenticity > 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'summary': return <BarChart3 className="w-4 h-4" />;
      case 'trend': return <TrendingUp className="w-4 h-4" />;
      case 'recommendation': return <Lightbulb className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Reviews 2.0 - Neural Analysis
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {reviews.length} Reviews
              </Badge>
              <Button variant="outline">
                <Brain className="w-4 h-4 mr-2" />
                AI Analysis
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters and Sort */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="most_helpful">Most Helpful</option>
            <option value="newest">Newest</option>
            <option value="highest_rating">Highest Rating</option>
            <option value="most_authentic">Most Authentic</option>
          </select>
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as any)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Reviews</option>
            <option value="verified">Verified Only</option>
            <option value="with_images">With Images</option>
            <option value="with_insights">With Insights</option>
          </select>
        </div>
        <Button>
          <MessageCircle className="w-4 h-4 mr-2" />
          Write Review
        </Button>
      </div>

      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="space-y-4">
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={review.user.avatar} />
                        <AvatarFallback>{review.user?.name?.charAt(0) || 'R'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{review.user.name}</p>
                          {review.user.verified && (
                            <CheckCircle className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      {review.verification.isVerified && (
                        <Badge variant="secondary" className="text-xs">
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>

                  <h3 className="font-medium mb-2">{review.title}</h3>
                  <p className="text-gray-700 mb-3">{review.content}</p>

                  {/* Neural Analysis */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium">Neural Analysis</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600">Emotion</p>
                        <p className={`font-medium ${getEmotionalColor(review.neuralAnalysis.emotionalTone.primary)}`}>
                          {review.neuralAnalysis.emotionalTone.primary}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Sentiment</p>
                        <p className={`font-medium ${getSentimentColor(review.neuralAnalysis.sentiment.overall)}`}>
                          {Math.round(review.neuralAnalysis.sentiment.overall * 100)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Authenticity</p>
                        <p className={`font-medium ${getAuthenticityColor(review.neuralAnalysis.authenticity)}`}>
                          {Math.round(review.neuralAnalysis.authenticity * 100)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Engagement</p>
                        <p className="font-medium">
                          {Math.round(review.neuralAnalysis.engagement * 100)}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* AI Insights */}
                  {review.insights.keyPoints.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-3 mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium">AI Insights</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Key Points:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {review.insights.keyPoints.slice(0, 2).map((point, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <div className="w-1 h-1 bg-blue-500 rounded-full" />
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Multimedia */}
                  {review.multimedia.images.length > 0 && (
                    <div className="flex gap-2 mb-3">
                      {review.multimedia.images.slice(0, 3).map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Review image ${index + 1}`}
                          className="w-20 h-20 object-cover rounded"
                        />
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => voteOnReview(review.id, 'helpful')}
                        className="flex items-center gap-1"
                      >
                        <ThumbsUp className="w-3 h-3" />
                        {review.socialProof.helpfulVotes}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => voteOnReview(review.id, 'not_helpful')}
                        className="flex items-center gap-1"
                      >
                        <ThumbsDown className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline" className="flex items-center gap-1">
                        <Reply className="w-3 h-3" />
                        {review.responses.length}
                      </Button>
                      <Button size="sm" variant="outline" className="flex items-center gap-1">
                        <Share2 className="w-3 h-3" />
                        {review.socialProof.shares}
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => generateInsights(review.id)}
                      >
                        <Zap className="w-3 h-3 mr-1" />
                        Analyze
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedReview(review)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                AI-Generated Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.map((insight) => (
                  <div key={insight.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getInsightIcon(insight.type)}
                        <div>
                          <h4 className="font-medium">{insight.title}</h4>
                          <p className="text-sm text-gray-600">{insight.description}</p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {Math.round(insight.confidence * 100)}% confidence
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        Generated {new Date(insight.generatedAt).toLocaleString()}
                      </p>
                      <Button size="sm" variant="outline">
                        <Eye className="w-3 h-3 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average Rating</p>
                    <p className="text-2xl font-bold">
                      {reviews.length > 0 
                        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                        : '0.0'
                      }
                    </p>
                  </div>
                  <Star className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Authenticity</p>
                    <p className="text-2xl font-bold">
                      {reviews.length > 0 
                        ? Math.round(reviews.reduce((sum, r) => sum + r.neuralAnalysis.authenticity, 0) / reviews.length * 100)
                        : 0
                      }%
                    </p>
                  </div>
                  <Brain className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Engagement</p>
                    <p className="text-2xl font-bold">
                      {reviews.reduce((sum, r) => sum + r.socialProof.helpfulVotes + r.socialProof.comments, 0)}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Review Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                <BarChart3 className="w-12 h-12 text-gray-400" />
                <p className="text-gray-600 ml-4">Analytics visualization would go here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
