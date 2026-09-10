'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { 
  Users, 
  Clock, 
  Eye, 
  Settings, 
  Play, 
  Pause, 
  RotateCcw,
  TrendingUp,
  Activity,
  Heart,
  Brain,
  ShoppingBag,
  Calendar,
  Zap,
  Target
} from 'lucide-react';

interface DigitalTwin {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  bodyMeasurements: {
    height: number;
    weight: number;
    chest: number;
    waist: number;
    hips: number;
    inseam: number;
  };
  stylePreferences: {
    colors: string[];
    brands: string[];
    categories: string[];
    fitPreferences: string[];
  };
  shoppingHistory: {
    purchases: any[];
    browsing: any[];
    wishlist: any[];
  };
  biometricData: {
    heartRate: number;
    stressLevel: number;
    activityLevel: number;
    sleepQuality: number;
  };
  evolutionTimeline: {
    timestamp: string;
    changes: any;
    reason: string;
  }[];
  isActive: boolean;
  lastUpdated: string;
}

interface TimeTravelSession {
  id: string;
  destination: string;
  purpose: string;
  duration: string;
  quantumParameters: any;
  temporalShopping: any;
  isActive: boolean;
  startTime: string;
}

export default function DigitalTwinViewer({ userId }: { userId: string }) {
  const [digitalTwin, setDigitalTwin] = useState<DigitalTwin | null>(null);
  const [timeTravelSession, setTimeTravelSession] = useState<TimeTravelSession | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState('present');
  const [bodyScale, setBodyScale] = useState([1.0]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fetchDigitalTwin();
    const interval = setInterval(() => {
      if (isPlaying) {
        advanceTime();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, currentTimeIndex]);

  const fetchDigitalTwin = async () => {
    try {
      const response = await fetch(`/api/digital-twin/${userId}`);
      const data = await response.json();
      if (data.success) {
        setDigitalTwin(data.data);
      }
    } catch (error) {
      console.error('Error fetching digital twin:', error);
    }
  };

  const createTimeTravelSession = async (destination: string, purpose: string) => {
    try {
      const response = await fetch('/api/time-travel/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          destination,
          purpose,
          duration: '1-hour',
          quantumStabilization: true
        })
      });
      const data = await response.json();
      if (data.success) {
        setTimeTravelSession(data.data);
      }
    } catch (error) {
      console.error('Error creating time travel session:', error);
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

  const tryOnVirtualOutfit = async (productId?: string) => {
    if (!digitalTwin) return;

    // If no productId provided, get a default product or show selection
    const targetProductId = productId || await getDefaultProduct();
    
    if (!targetProductId) {
      console.warn('No product selected for virtual try-on');
      return;
    }

    try {
      const response = await fetch(`/api/digital-twin/${digitalTwin.id}/try-on`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: targetProductId,
          bodyMeasurements: digitalTwin.bodyMeasurements,
          stylePreferences: digitalTwin.stylePreferences
        })
      });
      const data = await response.json();
      if (data.success) {
        updateTwinVisualization(data.data);
      }
    } catch (error) {
      console.error('Error trying on virtual outfit:', error);
    }
  };

  const evolveTwin = async (timeFrame: string) => {
    if (!digitalTwin) return;

    try {
      const response = await fetch(`/api/digital-twin/${digitalTwin.id}/evolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeFrame,
          factors: ['style', 'preferences', 'body_changes'],
          quantumEnhanced: true
        })
      });
      const data = await response.json();
      if (data.success) {
        setDigitalTwin(data.data);
      }
    } catch (error) {
      console.error('Error evolving twin:', error);
    }
  };

  const advanceTime = () => {
    if (digitalTwin && digitalTwin.evolutionTimeline) {
      const nextIndex = (currentTimeIndex + 1) % digitalTwin.evolutionTimeline.length;
      setCurrentTimeIndex(nextIndex);
    }
  };

  const updateTwinVisualization = (outfitData: any) => {
    if (canvasRef.current) {
      // Update the 3D visualization with the new outfit
      console.log('Updating twin visualization with outfit:', outfitData);
    }
  };

  const getBiometricColor = (value: number, type: string) => {
    const thresholds: { [key: string]: { good: number; warning: number } } = {
      heartRate: { good: 80, warning: 100 },
      stress: { good: 0.3, warning: 0.7 },
      activity: { good: 0.5, warning: 0.8 },
      sleep: { good: 0.7, warning: 0.5 }
    };
    
    const threshold = thresholds[type];
    if (!threshold) return 'text-gray-600';
    
    if (type === 'stress') {
      return value <= threshold.good ? 'text-green-600' : 
             value <= threshold.warning ? 'text-yellow-600' : 'text-red-600';
    } else {
      return value >= threshold.good ? 'text-green-600' : 
             value >= threshold.warning ? 'text-yellow-600' : 'text-red-600';
    }
  };

  if (!digitalTwin) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Loading digital twin...</p>
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
              <Users className="w-5 h-5" />
              Digital Twin - {digitalTwin.name}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={digitalTwin.isActive ? "default" : "secondary"}>
                {digitalTwin.isActive ? 'Active' : 'Inactive'}
              </Badge>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Configure
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3D Visualization */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>3D Twin Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Canvas for 3D rendering */}
                <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    className="w-full h-96"
                    style={{ background: 'transparent' }}
                  />
                  
                  {/* Time Travel Overlay */}
                  {timeTravelSession && timeTravelSession.isActive && (
                    <div className="absolute top-4 left-4">
                      <Badge variant="secondary" className="bg-purple-600 text-white">
                        <Clock className="w-3 h-3 mr-1" />
                        {timeTravelSession.destination}
                      </Badge>
                    </div>
                  )}

                  {/* Controls */}
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setCurrentTimeIndex(0)}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => createTimeTravelSession('2020s', 'style_evolution')}
                      >
                        <Clock className="w-4 h-4 mr-1" />
                        Time Travel
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Body Scale Control */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Body Scale</label>
                  <Slider
                    value={bodyScale}
                    onValueChange={setBodyScale}
                    min={0.5}
                    max={1.5}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Button variant="outline" size="sm" onClick={() => tryOnVirtualOutfit()}>
                    <Eye className="w-4 h-4 mr-2" />
                    Try On
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => evolveTwin('6-months')}>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Evolve
                  </Button>
                  <Button variant="outline" size="sm">
                    <Activity className="w-4 h-4 mr-2" />
                    Animate
                  </Button>
                  <Button variant="outline" size="sm">
                    <Target className="w-4 h-4 mr-2" />
                    Compare
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Evolution Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Evolution Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {digitalTwin.evolutionTimeline.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No evolution data available</p>
                ) : (
                  digitalTwin.evolutionTimeline.map((event, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className={`w-3 h-3 rounded-full ${
                        index === currentTimeIndex ? 'bg-blue-500' : 'bg-gray-300'
                      }`} />
                      <div className="flex-1">
                        <p className="font-medium">{event.reason}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(event.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {index === currentTimeIndex ? 'Current' : 'Past'}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          {/* Body Measurements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Body Measurements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Height</span>
                  <span>{digitalTwin.bodyMeasurements.height} cm</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Weight</span>
                  <span>{digitalTwin.bodyMeasurements.weight} kg</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Chest</span>
                  <span>{digitalTwin.bodyMeasurements.chest} cm</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Waist</span>
                  <span>{digitalTwin.bodyMeasurements.waist} cm</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Hips</span>
                  <span>{digitalTwin.bodyMeasurements.hips} cm</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Inseam</span>
                  <span>{digitalTwin.bodyMeasurements.inseam} cm</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Style Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Style Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-2">Colors</p>
                  <div className="flex flex-wrap gap-1">
                    {digitalTwin.stylePreferences.colors.slice(0, 4).map((color, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {color}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Brands</p>
                  <div className="flex flex-wrap gap-1">
                    {digitalTwin.stylePreferences.brands.slice(0, 3).map((brand, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {brand}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Categories</p>
                  <div className="flex flex-wrap gap-1">
                    {digitalTwin.stylePreferences.categories.slice(0, 3).map((category, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Biometric Data */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Biometric Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    <span className="text-sm">Heart Rate</span>
                  </div>
                  <span className={`text-sm font-medium ${getBiometricColor(digitalTwin.biometricData.heartRate, 'heartRate')}`}>
                    {digitalTwin.biometricData.heartRate} bpm
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    <span className="text-sm">Stress Level</span>
                  </div>
                  <span className={`text-sm font-medium ${getBiometricColor(digitalTwin.biometricData.stressLevel, 'stress')}`}>
                    {Math.round(digitalTwin.biometricData.stressLevel * 100)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    <span className="text-sm">Activity Level</span>
                  </div>
                  <span className={`text-sm font-medium ${getBiometricColor(digitalTwin.biometricData.activityLevel, 'activity')}`}>
                    {Math.round(digitalTwin.biometricData.activityLevel * 100)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Sleep Quality</span>
                  </div>
                  <span className={`text-sm font-medium ${getBiometricColor(digitalTwin.biometricData.sleepQuality, 'sleep')}`}>
                    {Math.round(digitalTwin.biometricData.sleepQuality * 100)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shopping Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Shopping Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4" />
                    <span className="text-sm">Purchases</span>
                  </div>
                  <span className="text-sm font-medium">
                    {digitalTwin.shoppingHistory.purchases.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm">Browsing</span>
                  </div>
                  <span className="text-sm font-medium">
                    {digitalTwin.shoppingHistory.browsing.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    <span className="text-sm">Wishlist</span>
                  </div>
                  <span className="text-sm font-medium">
                    {digitalTwin.shoppingHistory.wishlist.length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
