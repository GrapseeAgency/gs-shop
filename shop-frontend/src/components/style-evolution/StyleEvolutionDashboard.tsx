'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  TrendingUp, 
  Eye, 
  Calendar, 
  Zap,
  Brain,
  Palette,
  Star,
  ArrowRight,
  RefreshCw,
  Play,
  BarChart3,
  Lightbulb,
  Target
} from 'lucide-react';

interface StyleEvolution {
  id: string;
  userId: string;
  currentStyle: {
    era: string;
    dominantColors: string[];
    keyPieces: string[];
    aesthetic: string;
  };
  evolutionHistory: {
    timestamp: string;
    era: string;
    changes: {
      added: string[];
      removed: string[];
      modified: string[];
    };
    influences: string[];
    confidence: number;
  }[];
  futurePredictions: {
    timeframe: string;
    predictedStyles: string[];
    confidence: number;
    keyTrends: string[];
    recommendations: string[];
  }[];
  socialImpact: {
    influenceScore: number;
    trendsetterStatus: boolean;
    followers: number;
    impactLevel: 'local' | 'regional' | 'national' | 'global';
  };
  evolutionScore: number;
  lastAnalyzed: string;
}

interface TimeTravelEra {
  name: string;
  period: string;
  description: string;
  keyCharacteristics: string[];
  colorPalette: string[];
  popularItems: string[];
  accessibility: number;
}

export default function StyleEvolutionDashboard({ userId }: { userId: string }) {
  const [styleEvolution, setStyleEvolution] = useState<StyleEvolution | null>(null);
  const [availableEras, setAvailableEras] = useState<TimeTravelEra[]>([]);
  const [selectedEra, setSelectedEra] = useState<TimeTravelEra | null>(null);
  const [isTimeTraveling, setIsTimeTraveling] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    fetchStyleEvolution();
    fetchAvailableEras();
  }, [userId]);

  const fetchStyleEvolution = async () => {
    try {
      const response = await fetch(`/api/style-evolution?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setStyleEvolution(data.data);
      }
    } catch (error) {
      console.error('Error fetching style evolution:', error);
    }
  };

  const fetchAvailableEras = async () => {
    try {
      const response = await fetch('/api/style-evolution/eras');
      const data = await response.json();
      if (data.success) {
        setAvailableEras(data.data);
      }
    } catch (error) {
      console.error('Error fetching available eras:', error);
    }
  };

  const timeTravelToEra = async (era: TimeTravelEra) => {
    setIsTimeTraveling(true);
    try {
      const response = await fetch('/api/style-evolution/time-travel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          destination: era.name,
          purpose: 'style_exploration',
          duration: '30-minutes'
        })
      });
      const data = await response.json();
      if (data.success) {
        setSelectedEra(era);
        setTimeout(() => {
          setIsTimeTraveling(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Error time traveling:', error);
      setIsTimeTraveling(false);
    }
  };

  const predictFutureStyle = async (timeframe: string) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/style-evolution/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          timeframe,
          includeSocialImpact: true,
          quantumEnhanced: true
        })
      });
      const data = await response.json();
      if (data.success) {
        setStyleEvolution(data.data);
      }
    } catch (error) {
      console.error('Error predicting future style:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeCurrentStyle = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/style-evolution/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          analysisType: 'comprehensive',
          includeSocialData: true
        })
      });
      const data = await response.json();
      if (data.success) {
        setStyleEvolution(data.data);
      }
    } catch (error) {
      console.error('Error analyzing style:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getImpactLevelColor = (level: string) => {
    switch (level) {
      case 'global': return 'text-purple-600';
      case 'national': return 'text-blue-600';
      case 'regional': return 'text-green-600';
      case 'local': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.8) return 'text-green-600';
    if (confidence > 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!styleEvolution) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Loading style evolution data...</p>
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
              <Clock className="w-5 h-5" />
              Style Evolution - AI Fashion Time Machine
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button onClick={analyzeCurrentStyle} disabled={isAnalyzing}>
                {isAnalyzing ? 'Analyzing...' : 'Analyze Style'}
              </Button>
              <Button variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Current Style Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Era</p>
                <p className="text-lg font-bold">{styleEvolution.currentStyle.era}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Evolution Score</p>
                <p className="text-lg font-bold">{Math.round(styleEvolution.evolutionScore * 100)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Influence Score</p>
                <p className="text-lg font-bold">{Math.round(styleEvolution.socialImpact.influenceScore)}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Impact Level</p>
                <p className="text-lg font-bold capitalize">{styleEvolution.socialImpact.impactLevel}</p>
              </div>
              <Target className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="time-travel">Time Travel</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="evolution">Evolution</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Style Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Current Style Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Aesthetic</p>
                    <Badge variant="secondary">{styleEvolution.currentStyle.aesthetic}</Badge>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-2">Dominant Colors</p>
                    <div className="flex flex-wrap gap-2">
                      {styleEvolution.currentStyle.dominantColors.map((color, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-sm">{color}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Key Pieces</p>
                    <div className="flex flex-wrap gap-1">
                      {styleEvolution.currentStyle.keyPieces.map((piece, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {piece}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span>Trendsetter Status</span>
                      <Badge variant={styleEvolution.socialImpact.trendsetterStatus ? "default" : "secondary"}>
                        {styleEvolution.socialImpact.trendsetterStatus ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span>Followers</span>
                      <span>{styleEvolution.socialImpact.followers.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Impact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Social Impact Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Influence Score</span>
                      <span className={getImpactLevelColor(styleEvolution.socialImpact.impactLevel)}>
                        {Math.round(styleEvolution.socialImpact.influenceScore)}
                      </span>
                    </div>
                    <Progress value={styleEvolution.socialImpact.influenceScore} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Evolution Score</span>
                      <span className={getConfidenceColor(styleEvolution.evolutionScore)}>
                        {Math.round(styleEvolution.evolutionScore * 100)}%
                      </span>
                    </div>
                    <Progress value={styleEvolution.evolutionScore * 100} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {styleEvolution.evolutionHistory.length}
                      </p>
                      <p className="text-sm text-gray-600">Style Changes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {styleEvolution.futurePredictions.length}
                      </p>
                      <p className="text-sm text-gray-600">Predictions</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600">
                      Last analyzed: {new Date(styleEvolution.lastAnalyzed).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="time-travel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Fashion Time Travel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isTimeTraveling ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-lg font-medium">Traveling to {selectedEra?.name}...</p>
                  </div>
                ) : selectedEra ? (
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium text-lg mb-2">{selectedEra.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{selectedEra.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium mb-2">Key Characteristics</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedEra.keyCharacteristics.map((char, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {char}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium mb-2">Popular Items</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedEra.popularItems.map((item, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-sm font-medium mb-2">Color Palette</p>
                        <div className="flex gap-2">
                          {selectedEra.colorPalette.map((color, index) => (
                            <div
                              key={index}
                              className="w-8 h-8 rounded border"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Accessibility</span>
                          <span>{Math.round(selectedEra.accessibility * 100)}%</span>
                        </div>
                        <Progress value={selectedEra.accessibility * 100} />
                      </div>
                    </div>

                    <Button 
                      onClick={() => setSelectedEra(null)}
                      variant="outline"
                      className="w-full"
                    >
                      Return to Present
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableEras.map((era) => (
                      <Card key={era.name} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <h3 className="font-medium mb-2">{era.name}</h3>
                          <p className="text-sm text-gray-600 mb-3">{era.period}</p>
                          <p className="text-xs text-gray-500 mb-4 line-clamp-2">{era.description}</p>
                          <Button 
                            size="sm" 
                            onClick={() => timeTravelToEra(era)}
                            className="w-full"
                          >
                            <Clock className="w-3 h-3 mr-1" />
                            Travel
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Future Style Predictions
                </CardTitle>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => predictFutureStyle('6-months')}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? 'Predicting...' : '6 Months'}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => predictFutureStyle('2-years')}
                    disabled={isAnalyzing}
                  >
                    2 Years
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {styleEvolution.futurePredictions.length === 0 ? (
                  <div className="text-center py-8">
                    <Brain className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">No predictions available</p>
                    <Button onClick={() => predictFutureStyle('6-months')} className="mt-4">
                      Generate Predictions
                    </Button>
                  </div>
                ) : (
                  styleEvolution.futurePredictions.map((prediction, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{prediction.timeframe}</h4>
                        <Badge variant="outline">
                          <span className={getConfidenceColor(prediction.confidence)}>
                            {Math.round(prediction.confidence * 100)}% confidence
                          </span>
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium mb-2">Predicted Styles</p>
                          <div className="flex flex-wrap gap-1">
                            {prediction.predictedStyles.map((style, styleIndex) => (
                              <Badge key={styleIndex} variant="secondary" className="text-xs">
                                {style}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium mb-2">Key Trends</p>
                          <div className="flex flex-wrap gap-1">
                            {prediction.keyTrends.map((trend, trendIndex) => (
                              <Badge key={trendIndex} variant="outline" className="text-xs">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                {trend}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium mb-2">Recommendations</p>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {prediction.recommendations.map((rec, recIndex) => (
                              <li key={recIndex} className="flex items-center gap-2">
                                <Lightbulb className="w-3 h-3 text-yellow-500" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evolution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Style Evolution History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {styleEvolution.evolutionHistory.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No evolution history available</p>
                ) : (
                  styleEvolution.evolutionHistory.map((event, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{event.era}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(event.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">
                            <span className={getConfidenceColor(event.confidence)}>
                              {Math.round(event.confidence * 100)}%
                            </span>
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm font-medium mb-1 text-green-600">Added</p>
                          <div className="flex flex-wrap gap-1">
                            {event.changes.added.map((item, itemIndex) => (
                              <Badge key={itemIndex} variant="secondary" className="text-xs">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium mb-1 text-red-600">Removed</p>
                          <div className="flex flex-wrap gap-1">
                            {event.changes.removed.map((item, itemIndex) => (
                              <Badge key={itemIndex} variant="destructive" className="text-xs">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium mb-1 text-blue-600">Modified</p>
                          <div className="flex flex-wrap gap-1">
                            {event.changes.modified.map((item, itemIndex) => (
                              <Badge key={itemIndex} variant="outline" className="text-xs">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      {event.influences.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm font-medium mb-2">Influences</p>
                          <div className="flex flex-wrap gap-1">
                            {event.influences.map((influence, influenceIndex) => (
                              <Badge key={influenceIndex} variant="outline" className="text-xs">
                                <Star className="w-3 h-3 mr-1" />
                                {influence}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
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
