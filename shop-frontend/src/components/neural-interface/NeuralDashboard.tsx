'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Activity, Zap, Wifi, WifiOff, AlertCircle } from 'lucide-react';

interface NeuralProfile {
  id: string;
  userId: string;
  deviceType: string;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  calibrationLevel: number;
  brainwavePatterns: {
    alpha: number;
    beta: number;
    theta: number;
    delta: number;
  };
  emotionalState: {
    primary: string;
    intensity: number;
    stability: number;
  };
  cognitiveLoad: number;
  lastSync: string;
}

interface NeuralSignal {
  timestamp: string;
  type: 'attention' | 'emotion' | 'intent' | 'command';
  strength: number;
  data: any;
}

export default function NeuralDashboard() {
  const [profile, setProfile] = useState<NeuralProfile | null>(null);
  const [signals, setSignals] = useState<NeuralSignal[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchNeuralProfile();
    const interval = setInterval(fetchSignals, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchNeuralProfile = async () => {
    try {
      const response = await fetch('/api/neural/profile?userId=current');
      const data = await response.json();
      if (data.success) {
        setProfile(data.data);
      }
    } catch (error) {
      console.error('Error fetching neural profile:', error);
    }
  };

  const fetchSignals = async () => {
    try {
      const response = await fetch('/api/neural/signals?userId=current');
      if (!response.ok) {
        console.warn('Neural signals API not available:', response.status);
        setSignals([]); // Clear signals when API is unavailable
        return;
      }
      const data = await response.json();
      if (data.success && data.data) {
        setSignals(data.data.slice(-10)); // Keep last 10 signals
      } else {
        setSignals([]); // Clear signals if no data
      }
    } catch (error) {
      console.error('Error fetching neural signals:', error);
      setSignals([]); // Clear signals on error
    }
  };

  const connectDevice = async (deviceType: string) => {
    setIsConnecting(true);
    try {
      const response = await fetch('/api/neural/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'current',
          deviceType,
          calibrationLevel: 'advanced'
        })
      });
      const data = await response.json();
      if (data.success) {
        setProfile(data.data);
      }
    } catch (error) {
      console.error('Error connecting device:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectDevice = async () => {
    try {
      const response = await fetch('/api/neural/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'current' })
      });
      const data = await response.json();
      if (data.success) {
        setProfile(data.data);
      }
    } catch (error) {
      console.error('Error disconnecting device:', error);
    }
  };

  const calibrateDevice = async () => {
    try {
      const response = await fetch('/api/neural/calibrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'current',
          calibrationType: 'full'
        })
      });
      const data = await response.json();
      if (data.success) {
        setProfile(data.data);
      }
    } catch (error) {
      console.error('Error calibrating device:', error);
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Brain className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Loading neural interface...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Neural Interface Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {profile.connectionStatus === 'connected' ? (
                <Wifi className="w-5 h-5 text-green-500" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-500" />
              )}
              <div>
                <p className="font-medium">
                  {profile.deviceType ? profile.deviceType.charAt(0).toUpperCase() + profile.deviceType.slice(1) : 'Unknown'} Device
                </p>
                <p className="text-sm text-gray-600">
                  {profile.connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {profile.connectionStatus === 'connected' ? (
                <>
                  <Button variant="outline" onClick={calibrateDevice}>
                    Calibrate
                  </Button>
                  <Button variant="destructive" onClick={disconnectDevice}>
                    Disconnect
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => connectDevice('eeg_headset')}
                  disabled={isConnecting}
                >
                  {isConnecting ? 'Connecting...' : 'Connect Device'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="brainwaves">Brainwaves</TabsTrigger>
          <TabsTrigger value="signals">Signals</TabsTrigger>
          <TabsTrigger value="commands">Commands</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Emotional State */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Emotional State</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Primary Emotion</span>
                    <Badge variant="secondary">
                      {profile.emotionalState?.primary || 'Unknown'}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Intensity</span>
                      <span>{Math.round((profile.emotionalState?.intensity || 0) * 100)}%</span>
                    </div>
                    <Progress value={(profile.emotionalState?.intensity || 0) * 100} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Stability</span>
                      <span>{Math.round((profile.emotionalState?.stability || 0) * 100)}%</span>
                    </div>
                    <Progress value={(profile.emotionalState?.stability || 0) * 100} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cognitive Load */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cognitive Load</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current Load</span>
                    <Badge variant={(profile.cognitiveLoad || 0) > 0.7 ? "destructive" : "secondary"}>
                      {(profile.cognitiveLoad || 0) > 0.7 ? 'High' : (profile.cognitiveLoad || 0) > 0.4 ? 'Medium' : 'Low'}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Load Level</span>
                      <span>{Math.round((profile.cognitiveLoad || 0) * 100)}%</span>
                    </div>
                    <Progress value={(profile.cognitiveLoad || 0) * 100} />
                  </div>
                  <p className="text-xs text-gray-600">
                    {(profile.cognitiveLoad || 0) > 0.7 ? 'Consider taking a break' : 'Optimal for learning'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Calibration Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Calibration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Level</span>
                    <Badge variant="secondary">
                      {profile.calibrationLevel}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Calibration</span>
                      <span>{(profile.calibrationLevel || 0) >= 80 ? '100%' : '75%'}</span>
                    </div>
                    <Progress value={(profile.calibrationLevel || 0) >= 80 ? 100 : 75} />
                  </div>
                  <p className="text-xs text-gray-600">
                    Last sync: {profile.lastSync ? new Date(profile.lastSync).toLocaleTimeString() : 'Never'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="brainwaves" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Brainwave Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(profile.brainwavePatterns || {}).map(([wave, value]) => (
                  <div key={wave} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{wave}</span>
                      <span className="text-sm">{Math.round(value * 100)}%</span>
                    </div>
                    <Progress value={value * 100} />
                    <p className="text-xs text-gray-600">
                      {wave === 'alpha' && 'Relaxed awareness'}
                      {wave === 'beta' && 'Active thinking'}
                      {wave === 'theta' && 'Deep meditation'}
                      {wave === 'delta' && 'Deep sleep'}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="signals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Recent Neural Signals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {signals.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No signals detected</p>
                ) : (
                  signals.map((signal, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{signal.type}</Badge>
                        <div>
                          <p className="text-sm font-medium">
                            {signal.type === 'attention' && 'Focus detected'}
                            {signal.type === 'emotion' && 'Emotional response'}
                            {signal.type === 'intent' && 'Purchase intent'}
                            {signal.type === 'command' && 'Neural command'}
                          </p>
                          <p className="text-xs text-gray-600">
                            {new Date(signal.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{Math.round(signal.strength * 100)}%</p>
                        <p className="text-xs text-gray-600">Strength</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commands" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Neural Commands</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <Brain className="w-6 h-6 mb-2" />
                  <span>Think to Search</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Zap className="w-6 h-6 mb-2" />
                  <span>Neural Purchase</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Activity className="w-6 h-6 mb-2" />
                  <span>Focus Mode</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <AlertCircle className="w-6 h-6 mb-2" />
                  <span>Stress Alert</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
