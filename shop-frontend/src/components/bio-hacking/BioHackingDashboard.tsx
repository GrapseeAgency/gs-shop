'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Heart, 
  Brain, 
  Zap, 
  Target,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  Play,
  Pause,
  RefreshCw,
  Settings,
  BarChart3,
  Eye,
  Flame,
  Shield,
  Battery,
  Droplets,
  Wind
} from 'lucide-react';

interface BioHackingSession {
  id: string;
  userId: string;
  type: 'neural_optimization' | 'stress_reduction' | 'focus_enhancement' | 'sleep_improvement' | 'metabolism_boost';
  status: 'scheduled' | 'active' | 'paused' | 'completed' | 'failed';
  startTime: string;
  endTime?: string;
  duration: number;
  progress: number;
  protocols: BioProtocol[];
  realTimeData: {
    heartRate: number;
    stressLevel: number;
    focusLevel: number;
    energyLevel: number;
    sleepQuality: number;
  };
  optimizations: {
    category: string;
    improvement: number;
    baseline: number;
    current: number;
  }[];
  recommendations: string[];
}

interface BioProtocol {
  id: string;
  name: string;
  description: string;
  type: 'neural' | 'physiological' | 'nutritional' | 'environmental';
  isActive: boolean;
  effectiveness: number;
  duration: number;
  parameters: Record<string, any>;
}

interface BiometricData {
  timestamp: string;
  heartRate: number;
  bloodPressure: {
    systolic: number;
    diastolic: number;
  };
  stress: number;
  focus: number;
  energy: number;
  sleep: number;
  hydration: number;
  temperature: number;
}

export default function BioHackingDashboard({ userId }: { userId: string }) {
  const [sessions, setSessions] = useState<BioHackingSession[]>([]);
  const [activeSession, setActiveSession] = useState<BioHackingSession | null>(null);
  const [biometricData, setBiometricData] = useState<BiometricData[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchSessions();
    fetchBiometricData();
    const interval = setInterval(() => {
      if (isMonitoring) {
        fetchBiometricData();
        fetchActiveSession();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [userId, isMonitoring]);

  const fetchSessions = async () => {
    try {
      const response = await fetch(`/api/bio-hacking/sessions?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setSessions(data.data);
        const active = data.data.find((s: BioHackingSession) => s.status === 'active');
        if (active) {
          setActiveSession(active);
          setIsMonitoring(true);
        }
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const fetchBiometricData = async () => {
    try {
      const response = await fetch(`/api/bio-hacking/biometrics?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setBiometricData(data.data.slice(-50)); // Last 50 data points
      }
    } catch (error) {
      console.error('Error fetching biometric data:', error);
    }
  };

  const fetchActiveSession = async () => {
    try {
      const response = await fetch(`/api/bio-hacking/sessions/active?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setActiveSession(data.data);
      }
    } catch (error) {
      console.error('Error fetching active session:', error);
    }
  };

  const startSession = async (type: string) => {
    try {
      const response = await fetch('/api/bio-hacking/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          type,
          duration: 30,
          protocols: ['neural_optimization', 'stress_reduction'],
          realTimeOptimization: true
        })
      });
      const data = await response.json();
      if (data.success) {
        setActiveSession(data.data);
        setIsMonitoring(true);
        fetchSessions();
      }
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  const pauseSession = async () => {
    if (!activeSession) return;

    try {
      const response = await fetch(`/api/bio-hacking/sessions/${activeSession.id}/pause`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        setActiveSession(data.data);
        setIsMonitoring(false);
      }
    } catch (error) {
      console.error('Error pausing session:', error);
    }
  };

  const resumeSession = async () => {
    if (!activeSession) return;

    try {
      const response = await fetch(`/api/bio-hacking/sessions/${activeSession.id}/resume`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        setActiveSession(data.data);
        setIsMonitoring(true);
      }
    } catch (error) {
      console.error('Error resuming session:', error);
    }
  };

  const optimizeInRealTime = async () => {
    if (!activeSession) return;

    try {
      const response = await fetch(`/api/bio-hacking/sessions/${activeSession.id}/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          optimizationType: 'real_time',
          metrics: ['stress', 'focus', 'energy']
        })
      });
      const data = await response.json();
      if (data.success) {
        setActiveSession(data.data);
      }
    } catch (error) {
      console.error('Error optimizing session:', error);
    }
  };

  const getSessionIcon = (type: string) => {
    switch (type) {
      case 'neural_optimization': return <Brain className="w-5 h-5" />;
      case 'stress_reduction': return <Shield className="w-5 h-5" />;
      case 'focus_enhancement': return <Target className="w-5 h-5" />;
      case 'sleep_improvement': return <Clock className="w-5 h-5" />;
      case 'metabolism_boost': return <Flame className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      case 'scheduled': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getBiometricColor = (value: number, type: string) => {
    const thresholds: { [key: string]: { optimal: { min: number; max: number } } } = {
      heartRate: { optimal: { min: 60, max: 100 } },
      stress: { optimal: { min: 0, max: 0.3 } },
      focus: { optimal: { min: 0.7, max: 1.0 } },
      energy: { optimal: { min: 0.6, max: 0.9 } },
      sleep: { optimal: { min: 0.8, max: 1.0 } }
    };

    const threshold = thresholds[type];
    if (!threshold) return 'text-gray-600';

    if (value >= threshold.optimal.min && value <= threshold.optimal.max) {
      return 'text-green-600';
    } else if (value < threshold.optimal.min - 0.2 || value > threshold.optimal.max + 0.2) {
      return 'text-red-600';
    } else {
      return 'text-yellow-600';
    }
  };

  const latestBiometric = biometricData[biometricData.length - 1];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Bio-Hacking Dashboard - Biological Optimization
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={isMonitoring ? "default" : "secondary"}>
                {isMonitoring ? 'Monitoring' : 'Inactive'}
              </Badge>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Configure
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Real-time Biometrics */}
      {latestBiometric && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Heart Rate</p>
                  <p className={`text-2xl font-bold ${getBiometricColor(latestBiometric.heartRate, 'heartRate')}`}>
                    {latestBiometric.heartRate} bpm
                  </p>
                </div>
                <Heart className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Stress Level</p>
                  <p className={`text-2xl font-bold ${getBiometricColor(latestBiometric.stress, 'stress')}`}>
                    {Math.round(latestBiometric.stress * 100)}%
                  </p>
                </div>
                <Shield className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Focus Level</p>
                  <p className={`text-2xl font-bold ${getBiometricColor(latestBiometric.focus, 'focus')}`}>
                    {Math.round(latestBiometric.focus * 100)}%
                  </p>
                </div>
                <Target className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Energy Level</p>
                  <p className={`text-2xl font-bold ${getBiometricColor(latestBiometric.energy, 'energy')}`}>
                    {Math.round(latestBiometric.energy * 100)}%
                  </p>
                </div>
                <Battery className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Active Session */}
      {activeSession && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {getSessionIcon(activeSession.type)}
                Active Session: {activeSession.type.replace('_', ' ')}
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(activeSession.status)}`} />
                <Badge variant="outline">
                  {Math.round(activeSession.progress * 100)}% Complete
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Session Progress</span>
                  <span>{Math.round(activeSession.progress * 100)}%</span>
                </div>
                <Progress value={activeSession.progress * 100} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-lg font-bold">
                    {Math.round((Date.now() - new Date(activeSession.startTime).getTime()) / 60000)} min
                  </p>
                  <p className="text-sm text-gray-600">Elapsed</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold">{activeSession.duration} min</p>
                  <p className="text-sm text-gray-600">Duration</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold">{activeSession.protocols.length}</p>
                  <p className="text-sm text-gray-600">Protocols</p>
                </div>
              </div>

              <div className="flex gap-2">
                {activeSession.status === 'active' ? (
                  <>
                    <Button onClick={pauseSession} variant="outline">
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </Button>
                    <Button onClick={optimizeInRealTime}>
                      <Zap className="w-4 h-4 mr-2" />
                      Optimize Now
                    </Button>
                  </>
                ) : activeSession.status === 'paused' ? (
                  <Button onClick={resumeSession}>
                    <Play className="w-4 h-4 mr-2" />
                    Resume
                  </Button>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="protocols">Protocols</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Start */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Quick Start Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={() => startSession('neural_optimization')}
                    disabled={activeSession?.status === 'active'}
                    className="h-20 flex-col"
                  >
                    <Brain className="w-6 h-6 mb-2" />
                    Neural Optimize
                  </Button>
                  <Button 
                    onClick={() => startSession('stress_reduction')}
                    disabled={activeSession?.status === 'active'}
                    variant="outline"
                    className="h-20 flex-col"
                  >
                    <Shield className="w-6 h-6 mb-2" />
                    Stress Relief
                  </Button>
                  <Button 
                    onClick={() => startSession('focus_enhancement')}
                    disabled={activeSession?.status === 'active'}
                    variant="outline"
                    className="h-20 flex-col"
                  >
                    <Target className="w-6 h-6 mb-2" />
                    Focus Boost
                  </Button>
                  <Button 
                    onClick={() => startSession('metabolism_boost')}
                    disabled={activeSession?.status === 'active'}
                    variant="outline"
                    className="h-20 flex-col"
                  >
                    <Flame className="w-6 h-6 mb-2" />
                    Metabolism
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Current Optimizations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Current Optimizations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeSession?.optimizations.map((opt, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium text-sm">{opt.category}</p>
                        <p className="text-xs text-gray-600">
                          {opt.baseline.toFixed(1)}  {opt.current.toFixed(1)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${opt.improvement > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {opt.improvement > 0 ? '+' : ''}{opt.improvement.toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-600">improvement</p>
                      </div>
                    </div>
                  )) || (
                    <p className="text-center text-gray-500 py-8">No active optimizations</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Session History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sessions.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No sessions found</p>
                ) : (
                  sessions.map((session) => (
                    <div key={session.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(session.status)}`} />
                          {getSessionIcon(session.type)}
                          <div>
                            <h4 className="font-medium">{session.type.replace('_', ' ')}</h4>
                            <p className="text-sm text-gray-600">
                              {new Date(session.startTime).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">
                            {session.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Duration</p>
                          <p className="font-medium">{session.duration} minutes</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Progress</p>
                          <p className="font-medium">{Math.round(session.progress * 100)}%</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Protocols</p>
                          <p className="font-medium">{session.protocols.length}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="protocols" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Available Protocols
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'Neural Enhancement', type: 'neural', effectiveness: 0.85 },
                  { name: 'Stress Reduction', type: 'physiological', effectiveness: 0.78 },
                  { name: 'Nutritional Optimization', type: 'nutritional', effectiveness: 0.72 },
                  { name: 'Environmental Adjustment', type: 'environmental', effectiveness: 0.68 },
                ].map((protocol, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{protocol.name}</h4>
                        <Badge variant="outline">{protocol.type}</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Effectiveness</span>
                          <span>{Math.round(protocol.effectiveness * 100)}%</span>
                        </div>
                        <Progress value={protocol.effectiveness * 100} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Biometric Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-3">Heart Rate Trends</h4>
                    <div className="h-32 bg-gray-100 rounded flex items-center justify-center">
                      <BarChart3 className="w-8 h-8 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Stress Patterns</h4>
                    <div className="h-32 bg-gray-100 rounded flex items-center justify-center">
                      <BarChart3 className="w-8 h-8 text-gray-400" />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {latestBiometric ? Math.round(latestBiometric.heartRate) : '--'}
                    </p>
                    <p className="text-sm text-gray-600">Avg Heart Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {latestBiometric ? Math.round(latestBiometric.energy * 100) : '--'}%
                    </p>
                    <p className="text-sm text-gray-600">Avg Energy</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">
                      {latestBiometric ? Math.round(latestBiometric.stress * 100) : '--'}%
                    </p>
                    <p className="text-sm text-gray-600">Avg Stress</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {sessions.length}
                    </p>
                    <p className="text-sm text-gray-600">Total Sessions</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
