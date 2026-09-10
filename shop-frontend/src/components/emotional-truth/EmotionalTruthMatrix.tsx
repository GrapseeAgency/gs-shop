'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Heart, 
  Brain, 
  Eye, 
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Users,
  MessageCircle,
  Star,
  Zap,
  Activity,
  Target,
  Clock,
  Award,
  Lightbulb
} from 'lucide-react';

interface EmotionalTruthScore {
  overall: number;
  authenticity: number;
  emotionalConsistency: number;
  behavioralAlignment: number;
  neuralCoherence: number;
  socialValidation: number;
  temporalStability: number;
}

interface TruthAnalysis {
  id: string;
  reviewId: string;
  productId: string;
  userId: string;
  timestamp: string;
  scores: EmotionalTruthScore;
  verdict: 'authentic' | 'questionable' | 'synthetic' | 'manipulated';
  confidence: number;
  redFlags: string[];
  greenFlags: string[];
  neuralData: {
    emotionalPatterns: number[];
    cognitiveLoad: number;
    attention: number;
    memoryActivation: number;
  };
  behavioralData: {
    typingSpeed: number;
    editingPattern: number;
    timeSpent: number;
    revisionCount: number;
  };
  socialContext: {
    reviewerHistory: number;
    socialConnections: number;
    influenceScore: number;
  };
}

interface ProductTruthSummary {
  productId: string;
  productName: string;
  averageTruthScore: number;
  totalReviews: number;
  authenticReviews: number;
  questionableReviews: number;
  syntheticReviews: number;
  truthTrend: 'improving' | 'declining' | 'stable';
  lastAnalyzed: string;
  confidence: number;
}

interface VerificationRequest {
  id: string;
  reviewId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requestedBy: string;
  reason: string;
  createdAt: string;
  completedAt?: string;
}

export default function EmotionalTruthMatrix({ userId }: { userId: string }) {
  const [analyses, setAnalyses] = useState<TruthAnalysis[]>([]);
  const [productSummaries, setProductSummaries] = useState<ProductTruthSummary[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<TruthAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    fetchAnalyses();
    fetchProductSummaries();
    fetchVerificationRequests();
  }, [userId]);

  const fetchAnalyses = async () => {
    try {
      const response = await fetch(`/api/emotional-truth-matrix/analyses?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setAnalyses(data.data);
      }
    } catch (error) {
      console.error('Error fetching analyses:', error);
    }
  };

  const fetchProductSummaries = async () => {
    try {
      const response = await fetch('/api/emotional-truth-matrix/products/summary');
      const data = await response.json();
      if (data.success) {
        setProductSummaries(data.data);
      }
    } catch (error) {
      console.error('Error fetching product summaries:', error);
    }
  };

  const fetchVerificationRequests = async () => {
    try {
      const response = await fetch(`/api/emotional-truth-matrix/verification?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setVerificationRequests(data.data);
      }
    } catch (error) {
      console.error('Error fetching verification requests:', error);
    }
  };

  const analyzeReview = async (reviewId: string) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/emotional-truth-matrix/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId,
          deepAnalysis: true,
          includeNeuralData: true,
          includeBehavioralData: true,
          includeSocialContext: true
        })
      });
      const data = await response.json();
      if (data.success) {
        fetchAnalyses();
        fetchProductSummaries();
      }
    } catch (error) {
      console.error('Error analyzing review:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getProductsForAnalysis = async (): Promise<string[]> => {
    try {
      const response = await fetch('/api/products?limit=5');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.length > 0) {
          return data.data.map((product: any) => product.id);
        }
      }
    } catch (error) {
      console.error('Error fetching products for analysis:', error);
    }
    return [];
  };

  const batchAnalyze = async (productIds?: string[]) => {
    setIsAnalyzing(true);
    
    // If no productIds provided, get products from API or use defaults
    const targetProductIds = productIds || await getProductsForAnalysis();
    
    if (!targetProductIds || targetProductIds.length === 0) {
      console.warn('No products available for analysis');
      setIsAnalyzing(false);
      return;
    }
    
    try {
      const response = await fetch('/api/emotional-truth-matrix/batch-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productIds: targetProductIds,
          analysisDepth: 'comprehensive',
          includeHistorical: true
        })
      });
      const data = await response.json();
      if (data.success) {
        fetchAnalyses();
        fetchProductSummaries();
      }
    } catch (error) {
      console.error('Error batch analyzing:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const requestVerification = async (reviewId: string, reason: string, priority: string) => {
    try {
      const response = await fetch('/api/emotional-truth-matrix/verification/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId,
          userId,
          reason,
          priority
        })
      });
      const data = await response.json();
      if (data.success) {
        fetchVerificationRequests();
      }
    } catch (error) {
      console.error('Error requesting verification:', error);
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'authentic': return 'text-green-600';
      case 'questionable': return 'text-yellow-600';
      case 'synthetic': return 'text-red-600';
      case 'manipulated': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'authentic': return <CheckCircle className="w-4 h-4" />;
      case 'questionable': return <AlertTriangle className="w-4 h-4" />;
      case 'synthetic': return <AlertTriangle className="w-4 h-4" />;
      case 'manipulated': return <AlertTriangle className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getScoreColor = (score: number) => {
    if (score > 0.8) return 'text-green-600';
    if (score > 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Emotional Truth Matrix - Review Authenticity
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => batchAnalyze()}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? 'Analyzing...' : 'Batch Analyze'}
              </Button>
              <Button variant="outline">
                <BarChart3 className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="analyses">Analyses</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Analyses</p>
                    <p className="text-2xl font-bold">{analyses.length}</p>
                  </div>
                  <Eye className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Authentic Reviews</p>
                    <p className="text-2xl font-bold text-green-600">
                      {analyses.filter(a => a.verdict === 'authentic').length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Questionable</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {analyses.filter(a => a.verdict === 'questionable').length}
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Synthetic</p>
                    <p className="text-2xl font-bold text-red-600">
                      {analyses.filter(a => a.verdict === 'synthetic' || a.verdict === 'manipulated').length}
                    </p>
                  </div>
                  <Shield className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Analyses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Analyses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyses.slice(-5).reverse().map((analysis) => (
                  <div key={analysis.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      {getVerdictIcon(analysis.verdict)}
                      <div>
                        <p className="font-medium">Review {analysis.reviewId}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(analysis.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className={getVerdictColor(analysis.verdict)}>
                        {analysis.verdict}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-1">
                        {Math.round(analysis.scores.overall * 100)}% truth score
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analyses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Detailed Analyses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyses.map((analysis) => (
                  <div key={analysis.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getVerdictIcon(analysis.verdict)}
                        <div>
                          <h4 className="font-medium">Review {analysis.reviewId}</h4>
                          <p className="text-sm text-gray-600">
                            Product {analysis.productId}  {new Date(analysis.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className={getVerdictColor(analysis.verdict)}>
                          {analysis.verdict}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">
                          {Math.round(analysis.confidence * 100)}% confidence
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-600">Authenticity</p>
                        <p className={`font-medium ${getScoreColor(analysis.scores.authenticity)}`}>
                          {Math.round(analysis.scores.authenticity * 100)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Emotional Consistency</p>
                        <p className={`font-medium ${getScoreColor(analysis.scores.emotionalConsistency)}`}>
                          {Math.round(analysis.scores.emotionalConsistency * 100)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Behavioral Alignment</p>
                        <p className={`font-medium ${getScoreColor(analysis.scores.behavioralAlignment)}`}>
                          {Math.round(analysis.scores.behavioralAlignment * 100)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Neural Coherence</p>
                        <p className={`font-medium ${getScoreColor(analysis.scores.neuralCoherence)}`}>
                          {Math.round(analysis.scores.neuralCoherence * 100)}%
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {analysis.greenFlags.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-green-600">Positive Indicators:</p>
                          <div className="flex flex-wrap gap-1">
                            {analysis.greenFlags.map((flag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs bg-green-100">
                                {flag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {analysis.redFlags.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-red-600">Red Flags:</p>
                          <div className="flex flex-wrap gap-1">
                            {analysis.redFlags.map((flag, index) => (
                              <Badge key={index} variant="destructive" className="text-xs">
                                {flag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Product Truth Summaries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {productSummaries.map((summary) => (
                  <div key={summary.productId} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{summary.productName}</h4>
                        <p className="text-sm text-gray-600">Product ID: {summary.productId}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className={getScoreColor(summary.averageTruthScore)}>
                          {Math.round(summary.averageTruthScore * 100)}% Truth Score
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">
                          {summary.totalReviews} reviews
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div className="text-center">
                        <p className="text-lg font-bold text-green-600">{summary.authenticReviews}</p>
                        <p className="text-sm text-gray-600">Authentic</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-yellow-600">{summary.questionableReviews}</p>
                        <p className="text-sm text-gray-600">Questionable</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-red-600">{summary.syntheticReviews}</p>
                        <p className="text-sm text-gray-600">Synthetic</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold">{Math.round(summary.confidence * 100)}%</p>
                        <p className="text-sm text-gray-600">Confidence</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className={`w-4 h-4 ${
                          summary.truthTrend === 'improving' ? 'text-green-600' :
                          summary.truthTrend === 'declining' ? 'text-red-600' : 'text-gray-600'
                        }`} />
                        <span className="text-sm capitalize">{summary.truthTrend}</span>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => analyzeReview('new-review')}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Analyze Reviews
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Verification Requests
                </CardTitle>
                <Button onClick={() => requestVerification('review-123', 'Manual review needed', 'medium')}>
                  <Shield className="w-4 h-4 mr-2" />
                  Request Verification
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {verificationRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        request.status === 'completed' ? 'bg-green-500' :
                        request.status === 'processing' ? 'bg-yellow-500' :
                        request.status === 'failed' ? 'bg-red-500' : 'bg-gray-500'
                      }`} />
                      <div>
                        <p className="font-medium">Review {request.reviewId}</p>
                        <p className="text-sm text-gray-600">{request.reason}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className={getPriorityColor(request.priority)}>
                        {request.priority}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-1">
                        {request.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
