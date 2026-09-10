'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dna, 
  Heart, 
  Brain, 
  Activity, 
  Shield, 
  Zap,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  User,
  ShoppingBag
} from 'lucide-react';

interface DNAProfile {
  id: string;
  userId: string;
  geneticMarkers: {
    health: string[];
    personality: string[];
    physical: string[];
    lifestyle: string[];
  };
  healthFactors: {
    category: string;
    risk: number;
    recommendations: string[];
  }[];
  personalityTraits: {
    trait: string;
    strength: number;
    description: string;
  }[];
  stylePredisposition: {
    colorPreferences: string[];
    styleCategories: string[];
    materialSensitivities: string[];
    comfortLevels: Record<string, number>;
  };
  analysisStatus: 'pending' | 'processing' | 'completed' | 'failed';
  completedAt?: string;
}

interface ProductCompatibility {
  productId: string;
  productName: string;
  compatibilityScore: number;
  factors: {
    genetic: number;
    lifestyle: number;
    preference: number;
  };
  recommendations: string[];
}

export default function DNAAnalysisDashboard() {
  const [profile, setProfile] = useState<DNAProfile | null>(null);
  const [compatibilities, setCompatibilities] = useState<ProductCompatibility[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    fetchDNAProfile();
    fetchCompatibilities();
  }, []);

  const fetchDNAProfile = async () => {
    try {
      const response = await fetch('/api/dna/analysis?userId=current');
      const data = await response.json();
      if (data.success) {
        setProfile(data.data);
      }
    } catch (error) {
      console.error('Error fetching DNA profile:', error);
    }
  };

  const fetchCompatibilities = async () => {
    try {
      const response = await fetch('/api/dna/compatibility?userId=current');
      const data = await response.json();
      if (data.success) {
        setCompatibilities(data.data);
      }
    } catch (error) {
      console.error('Error fetching compatibilities:', error);
    }
  };

  const submitSample = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/dna/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'current',
          sampleType: 'saliva',
          sampleData: {},
          priority: 'standard'
        })
      });
      const data = await response.json();
      if (data.success) {
        setProfile(data.data);
      }
    } catch (error) {
      console.error('Error submitting DNA sample:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getDefaultProduct = async (): Promise<string | null> => {
    try {
      const response = await fetch('/api/products?limit=1');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.length > 0) {
          return data.data[0].id;
        }
      }
    } catch (error) {
      console.error('Error fetching default product:', error);
    }
    return null;
  };

  const checkCompatibility = async (productId?: string) => {
    // If no productId provided, get a default product or show selection
    const targetProductId = productId || await getDefaultProduct();
    
    if (!targetProductId) {
      console.warn('No product selected for compatibility check');
      return;
    }
    
    try {
      const response = await fetch('/api/dna/compatibility/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'current',
          productId: targetProductId
        })
      });
      const data = await response.json();
      if (data.success) {
        setCompatibilities(prev => [...prev.filter(c => c.productId !== productId), data.data]);
      }
    } catch (error) {
      console.error('Error checking compatibility:', error);
    }
  };

  const getHealthIcon = (category: string) => {
    switch (category) {
      case 'cardiovascular': return <Heart className="w-4 h-4" />;
      case 'neurological': return <Brain className="w-4 h-4" />;
      case 'metabolic': return <Activity className="w-4 h-4" />;
      case 'immune': return <Shield className="w-4 h-4" />;
      default: return <Dna className="w-4 h-4" />;
    }
  };

  const getRiskColor = (risk: number) => {
    if (risk < 0.3) return 'text-green-600';
    if (risk < 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCompatibilityColor = (score: number) => {
    if (score > 0.8) return 'bg-green-500';
    if (score > 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Dna className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Loading DNA profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* DNA Status Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Dna className="w-5 h-5" />
              DNA Analysis Status
            </CardTitle>
            <div className="flex items-center gap-2">
              {profile.analysisStatus === 'completed' ? (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Completed
                </Badge>
              ) : profile.analysisStatus === 'processing' ? (
                <Badge variant="secondary">
                  <Clock className="w-3 h-3 mr-1" />
                  Processing
                </Badge>
              ) : profile.analysisStatus === 'failed' ? (
                <Badge variant="destructive">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Failed
                </Badge>
              ) : (
                <Badge variant="outline">
                  <Clock className="w-3 h-3 mr-1" />
                  Pending
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {profile.analysisStatus === 'completed' 
                  ? `Analysis completed on ${new Date(profile.completedAt!).toLocaleDateString()}`
                  : 'DNA analysis in progress...'
                }
              </p>
            </div>
            {profile.analysisStatus === 'pending' && (
              <Button onClick={() => submitSample()} disabled={isAnalyzing}>
                {isAnalyzing ? 'Submitting...' : 'Submit Sample'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="health">Health Factors</TabsTrigger>
          <TabsTrigger value="personality">Personality</TabsTrigger>
          <TabsTrigger value="compatibility">Compatibility</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Genetic Markers */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Genetic Markers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Health Markers</span>
                    <span>{profile.geneticMarkers.health.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Personality Markers</span>
                    <span>{profile.geneticMarkers.personality.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Physical Markers</span>
                    <span>{profile.geneticMarkers.physical.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Lifestyle Markers</span>
                    <span>{profile.geneticMarkers.lifestyle.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Style Predisposition */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Style Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-2">Color Preferences</p>
                    <div className="flex flex-wrap gap-1">
                      {profile.stylePredisposition.colorPreferences.slice(0, 4).map((color, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {color}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Style Categories</p>
                    <div className="flex flex-wrap gap-1">
                      {profile.stylePredisposition.styleCategories.slice(0, 3).map((style, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {style}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personality Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Personality</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {profile.personalityTraits.slice(0, 3).map((trait, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{trait.trait}</span>
                        <span>{Math.round(trait.strength * 100)}%</span>
                      </div>
                      <Progress value={trait.strength * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Health Factors & Genetic Predispositions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profile.healthFactors.map((factor, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getHealthIcon(factor.category)}
                        <span className="font-medium capitalize">{factor.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${getRiskColor(factor.risk)}`}>
                          {Math.round(factor.risk * 100)}% Risk
                        </span>
                        <div className={`w-3 h-3 rounded-full ${getCompatibilityColor(1 - factor.risk)}`} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Risk Level</span>
                        <span>{factor.risk < 0.3 ? 'Low' : factor.risk < 0.7 ? 'Moderate' : 'High'}</span>
                      </div>
                      <Progress value={factor.risk * 100} />
                    </div>

                    {factor.recommendations.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium mb-2">Recommendations:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {factor.recommendations.map((rec, recIndex) => (
                            <li key={recIndex} className="flex items-center gap-2">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Personality Traits & Behavioral Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profile.personalityTraits.map((trait, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{trait.trait}</span>
                      <Badge variant="secondary">
                        {Math.round(trait.strength * 100)}%
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{trait.description}</p>
                    <Progress value={trait.strength * 100} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compatibility" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Product Compatibility Analysis
                </CardTitle>
                <Button onClick={() => checkCompatibility()}>
                  Check New Product
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {compatibilities.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No compatibility analyses available</p>
                ) : (
                  compatibilities.map((compatibility, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{compatibility.productName}</h4>
                          <p className="text-sm text-gray-600">Product #{compatibility.productId}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">
                            {Math.round(compatibility.compatibilityScore * 100)}%
                          </div>
                          <p className="text-sm text-gray-600">Compatible</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Genetic</p>
                          <p className="font-medium">{Math.round(compatibility.factors.genetic * 100)}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Lifestyle</p>
                          <p className="font-medium">{Math.round(compatibility.factors.lifestyle * 100)}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Preference</p>
                          <p className="font-medium">{Math.round(compatibility.factors.preference * 100)}%</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Overall Compatibility</span>
                          <span>{Math.round(compatibility.compatibilityScore * 100)}%</span>
                        </div>
                        <Progress value={compatibility.compatibilityScore * 100} />
                      </div>

                      {compatibility.recommendations.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium mb-2">Why this matches:</p>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {compatibility.recommendations.map((rec, recIndex) => (
                              <li key={recIndex} className="flex items-center gap-2">
                                <TrendingUp className="w-3 h-3 text-green-500" />
                                {rec}
                              </li>
                            ))}
                          </ul>
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
