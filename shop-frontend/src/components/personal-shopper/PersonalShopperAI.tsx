'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, 
  MessageCircle, 
  Calendar, 
  ShoppingBag, 
  TrendingUp,
  Star,
  Heart,
  Target,
  Clock,
  CheckCircle,
  Brain,
  Lightbulb,
  Zap,
  Gift,
  Users,
  BarChart3,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface PersonalShopperAI {
  id: string;
  userId: string;
  name: string;
  personality: {
    type: 'fashion_expert' | 'budget_conscious' | 'trendsetter' | 'classic' | 'eco_friendly';
    traits: string[];
    communicationStyle: 'professional' | 'friendly' | 'enthusiastic' | 'minimal';
  };
  capabilities: {
    styleAnalysis: boolean;
    budgetPlanning: boolean;
    trendForecasting: boolean;
    personalShopping: boolean;
    lifePlanning: boolean;
  };
  learningData: {
    preferences: Record<string, any>;
    purchaseHistory: any[];
    feedback: any[];
    accuracy: number;
  };
  isActive: boolean;
  lastInteraction: string;
}

interface ConsultationSession {
  id: string;
  aiId: string;
  type: 'style_advice' | 'shopping_planning' | 'budget_analysis' | 'life_planning' | 'trend_consultation';
  status: 'active' | 'paused' | 'completed';
  startTime: string;
  messages: Message[];
  recommendations: Recommendation[];
  context: any;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: string;
  type: 'text' | 'recommendation' | 'analysis' | 'question';
  data?: any;
}

interface Recommendation {
  id: string;
  type: 'product' | 'outfit' | 'brand' | 'trend' | 'advice';
  title: string;
  description: string;
  reasoning: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
  products?: any[];
  actionItems?: string[];
}

interface LifePlan {
  id: string;
  timeframe: string;
  goals: {
    category: string;
    description: string;
    priority: number;
    progress: number;
  }[];
  recommendations: string[];
  milestones: any[];
}

export default function PersonalShopperAI({ userId }: { userId: string }) {
  const [aiShopper, setAiShopper] = useState<PersonalShopperAI | null>(null);
  const [activeSession, setActiveSession] = useState<ConsultationSession | null>(null);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const [isTyping, setIsTyping] = useState(false);
  const [lifePlan, setLifePlan] = useState<LifePlan | null>(null);

  useEffect(() => {
    fetchAIShopper();
    fetchActiveSession();
    fetchLifePlan();
  }, [userId]);

  const fetchAIShopper = async () => {
    try {
      const response = await fetch(`/api/personal-shopper?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setAiShopper(data.data);
      }
    } catch (error) {
      console.error('Error fetching AI shopper:', error);
    }
  };

  const fetchActiveSession = async () => {
    try {
      const response = await fetch(`/api/personal-shopper/session/active?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setActiveSession(data.data);
      }
    } catch (error) {
      console.error('Error fetching active session:', error);
    }
  };

  const fetchLifePlan = async () => {
    try {
      const response = await fetch(`/api/personal-shopper/life-plan?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setLifePlan(data.data);
      }
    } catch (error) {
      console.error('Error fetching life plan:', error);
    }
  };

  const startConsultation = async (type: string) => {
    try {
      const response = await fetch('/api/personal-shopper/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          type,
          context: {
            budget: 'flexible',
            preferences: 'modern',
            timeframe: 'current_season'
          }
        })
      });
      const data = await response.json();
      if (data.success) {
        setActiveSession(data.data);
        setActiveTab('chat');
      }
    } catch (error) {
      console.error('Error starting consultation:', error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !activeSession) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: message,
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    setActiveSession(prev => prev ? {
      ...prev,
      messages: [...prev.messages, userMessage]
    } : null);

    setMessage('');
    setIsTyping(true);

    try {
      const response = await fetch(`/api/personal-shopper/session/${activeSession.id}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          context: activeSession.context
        })
      });
      const data = await response.json();
      if (data.success) {
        setActiveSession(data.data);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const getPrediction = async (category: string) => {
    try {
      const response = await fetch('/api/personal-shopper/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          category,
          timeframe: '30-days',
          includeTrends: true
        })
      });
      const data = await response.json();
      if (data.success) {
        // Handle prediction response
        console.log('Prediction:', data.data);
      }
    } catch (error) {
      console.error('Error getting prediction:', error);
    }
  };

  const optimizeBudget = async () => {
    try {
      const response = await fetch('/api/personal-shopper/budget/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          budget: 5000,
          categories: ['clothing', 'accessories', 'shoes'],
          timeframe: 'monthly'
        })
      });
      const data = await response.json();
      if (data.success) {
        // Handle budget optimization
        console.log('Budget optimization:', data.data);
      }
    } catch (error) {
      console.error('Error optimizing budget:', error);
    }
  };

  const getPersonalityIcon = (type: string) => {
    switch (type) {
      case 'fashion_expert': return <Star className="w-5 h-5" />;
      case 'budget_conscious': return <Target className="w-5 h-5" />;
      case 'trendsetter': return <TrendingUp className="w-5 h-5" />;
      case 'classic': return <Heart className="w-5 h-5" />;
      case 'eco_friendly': return <Sparkles className="w-5 h-5" />;
      default: return <Bot className="w-5 h-5" />;
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'product': return <ShoppingBag className="w-4 h-4" />;
      case 'outfit': return <Users className="w-4 h-4" />;
      case 'brand': return <Star className="w-4 h-4" />;
      case 'trend': return <TrendingUp className="w-4 h-4" />;
      case 'advice': return <Lightbulb className="w-4 h-4" />;
      default: return <Gift className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (!aiShopper) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Bot className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Loading Personal Shopper AI...</p>
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
              <Bot className="w-5 h-5" />
              Personal Shopper AI - {aiShopper.name}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={aiShopper.isActive ? "default" : "secondary"}>
                {aiShopper.isActive ? 'Active' : 'Inactive'}
              </Badge>
              <Button variant="outline">
                <Brain className="w-4 h-4 mr-2" />
                Train AI
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* AI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Personality</p>
                <p className="text-lg font-bold capitalize">{aiShopper.personality.type.replace('_', ' ')}</p>
              </div>
              {getPersonalityIcon(aiShopper.personality.type)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Accuracy</p>
                <p className="text-lg font-bold">{Math.round(aiShopper.learningData.accuracy * 100)}%</p>
              </div>
              <Target className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Interactions</p>
                <p className="text-lg font-bold">{aiShopper.learningData.feedback.length}</p>
              </div>
              <MessageCircle className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Capabilities</p>
                <p className="text-lg font-bold">{Object.values(aiShopper.capabilities).filter(Boolean).length}</p>
              </div>
              <Zap className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="chat">AI Chat</TabsTrigger>
          <TabsTrigger value="consultations">Consultations</TabsTrigger>
          <TabsTrigger value="life-plan">Life Plan</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat Interface */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    AI Conversation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Messages */}
                    <div className="h-96 overflow-y-auto space-y-3 border rounded-lg p-4">
                      {activeSession?.messages.length === 0 ? (
                        <div className="text-center py-8">
                          <Bot className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                          <p className="text-gray-600">Start a conversation with your AI shopper</p>
                          <Button onClick={() => startConsultation('style_advice')} className="mt-4">
                            Start Style Consultation
                          </Button>
                        </div>
                      ) : (
                        activeSession?.messages.map((msg) => (
                          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${
                              msg.sender === 'user' 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              <p className="text-sm">{msg.content}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Ask your AI shopper anything..."
                        className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={!activeSession}
                      />
                      <Button onClick={sendMessage} disabled={!activeSession || !message.trim()}>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    onClick={() => startConsultation('style_advice')}
                    className="w-full justify-start"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Style Advice
                  </Button>
                  <Button 
                    onClick={() => startConsultation('shopping_planning')}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Shopping Plan
                  </Button>
                  <Button 
                    onClick={() => startConsultation('budget_analysis')}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Budget Analysis
                  </Button>
                  <Button 
                    onClick={() => startConsultation('life_planning')}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Life Planning
                  </Button>
                </CardContent>
              </Card>

              {/* AI Traits */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">AI Personality</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{aiShopper.personality.communicationStyle}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {aiShopper.personality.traits.map((trait, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {trait}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="consultations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Consultation History & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeSession?.recommendations.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No recommendations available</p>
              ) : (
                <div className="space-y-4">
                  {activeSession?.recommendations.map((rec) => (
                    <div key={rec.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getRecommendationIcon(rec.type)}
                          <div>
                            <h4 className="font-medium">{rec.title}</h4>
                            <p className="text-sm text-gray-600">{rec.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className={getPriorityColor(rec.priority)}>
                            {rec.priority}
                          </Badge>
                          <p className="text-xs text-gray-600 mt-1">
                            {Math.round(rec.confidence * 100)}% confidence
                          </p>
                        </div>
                      </div>

                      <p className="text-sm text-gray-700 mb-3">{rec.reasoning}</p>

                      {rec.actionItems && rec.actionItems.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Action Items:</p>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {rec.actionItems.map((item, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="life-plan" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Personal Life Plan
                </CardTitle>
                <Button onClick={() => startConsultation('life_planning')}>
                  Update Plan
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {lifePlan ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                    <div>
                      <p className="font-medium">Timeframe</p>
                      <p className="text-sm text-gray-600">{lifePlan.timeframe}</p>
                    </div>
                    <Badge variant="outline">Active</Badge>
                  </div>

                  <div className="space-y-3">
                    <p className="font-medium">Goals Progress</p>
                    {lifePlan.goals.map((goal, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{goal.category}</h4>
                          <Badge variant="outline">{goal.priority}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{Math.round(goal.progress * 100)}%</span>
                          </div>
                          <Progress value={goal.progress * 100} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {lifePlan.recommendations.length > 0 && (
                    <div className="space-y-2">
                      <p className="font-medium">AI Recommendations</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {lifePlan.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <Lightbulb className="w-3 h-3 text-yellow-500" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">No life plan created yet</p>
                  <Button onClick={() => startConsultation('life_planning')} className="mt-4">
                    Create Life Plan
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Shopping Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      onClick={() => getPrediction('style')}
                      variant="outline"
                      className="h-20 flex-col"
                    >
                      <TrendingUp className="w-6 h-6 mb-2" />
                      Style Prediction
                    </Button>
                    <Button 
                      onClick={() => getPrediction('budget')}
                      variant="outline"
                      className="h-20 flex-col"
                    >
                      <Target className="w-6 h-6 mb-2" />
                      Budget Forecast
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">AI Learning Progress</p>
                    <Progress value={aiShopper.learningData.accuracy * 100} />
                    <p className="text-xs text-gray-600">
                      Based on {aiShopper.learningData.feedback.length} interactions
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  AI Capabilities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(aiShopper.capabilities).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm capitalize">{key.replace('_', ' ')}</span>
                      <Badge variant={value ? "default" : "secondary"}>
                        {value ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
