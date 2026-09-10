'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { 
  Settings, 
  Atom, 
  Clock, 
  Zap, 
  Target,
  Eye,
  Play,
  Pause,
  RefreshCw,
  Globe,
  Box,
  Lightbulb,
  Sparkles,
  Move3d,
  Layers,
  Palette,
  Volume2,
  Thermometer,
  Wind,
  Timer
} from 'lucide-react';

interface RealitySettings {
  physics: {
    gravity: number;
    timeFlow: number;
    friction: number;
    elasticity: number;
    quantumEffects: boolean;
  };
  environment: {
    lighting: {
      intensity: number;
      color: string;
      shadows: boolean;
      ambientOcclusion: boolean;
    };
    atmosphere: {
      density: number;
      particles: boolean;
      weather: 'clear' | 'cloudy' | 'rainy' | 'snowy';
      temperature: number;
    };
    audio: {
      enabled: boolean;
      volume: number;
      spatialAudio: boolean;
      reverb: number;
    };
  };
  dimensions: {
    count: number;
    visible: number[];
    portals: boolean;
    wormholes: boolean;
    quantumTunneling: boolean;
  };
  customization: {
    theme: string;
    colorScheme: string;
    effects: string[];
    personalReality: boolean;
  };
}

interface RealitySession {
  id: string;
  userId: string;
  name: string;
  settings: RealitySettings;
  isActive: boolean;
  startTime: string;
  duration: number;
  energyConsumption: number;
  stability: number;
  participants: string[];
  sharedReality: boolean;
}

interface DimensionPortal {
  id: string;
  name: string;
  type: 'portal' | 'wormhole' | 'quantum_tunnel';
  destination: string;
  coordinates: [number, number, number];
  isActive: boolean;
  energyRequired: number;
  stability: number;
}

export default function RealityCustomizationDashboard({ userId }: { userId: string }) {
  const [sessions, setSessions] = useState<RealitySession[]>([]);
  const [activeSession, setActiveSession] = useState<RealitySession | null>(null);
  const [currentSettings, setCurrentSettings] = useState<RealitySettings | null>(null);
  const [portals, setPortals] = useState<DimensionPortal[]>([]);
  const [isApplying, setIsApplying] = useState(false);
  const [activeTab, setActiveTab] = useState('physics');

  useEffect(() => {
    fetchSessions();
    fetchCurrentSettings();
    fetchPortals();
  }, [userId]);

  const fetchSessions = async () => {
    try {
      const response = await fetch(`/api/reality-customization?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setSessions(data.data);
        const active = data.data.find((s: RealitySession) => s.isActive);
        if (active) {
          setActiveSession(active);
          setCurrentSettings(active.settings);
        }
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const fetchCurrentSettings = async () => {
    try {
      const response = await fetch(`/api/reality-customization/current?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setCurrentSettings(data.data);
      }
    } catch (error) {
      console.error('Error fetching current settings:', error);
    }
  };

  const fetchPortals = async () => {
    try {
      const response = await fetch(`/api/reality-customization/portals?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setPortals(data.data);
      }
    } catch (error) {
      console.error('Error fetching portals:', error);
    }
  };

  const createRealitySession = async (name: string, settings: RealitySettings) => {
    try {
      const response = await fetch('/api/reality-customization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name,
          settings,
          sharedReality: false,
          energyLimit: 1000
        })
      });
      const data = await response.json();
      if (data.success) {
        setActiveSession(data.data);
        setCurrentSettings(data.data.settings);
        fetchSessions();
      }
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const updatePhysicsSettings = async (updates: Partial<RealitySettings['physics']>) => {
    if (!currentSettings) return;

    setIsApplying(true);
    try {
      const newSettings = {
        ...currentSettings,
        physics: { ...currentSettings.physics, ...updates }
      };

      const response = await fetch('/api/reality-customization/physics', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          sessionId: activeSession?.id,
          settings: newSettings.physics
        })
      });
      const data = await response.json();
      if (data.success) {
        setCurrentSettings(newSettings);
        if (activeSession) {
          setActiveSession({ ...activeSession, settings: newSettings });
        }
      }
    } catch (error) {
      console.error('Error updating physics settings:', error);
    } finally {
      setIsApplying(false);
    }
  };

  const updateEnvironmentSettings = async (updates: Partial<RealitySettings['environment']>) => {
    if (!currentSettings) return;

    setIsApplying(true);
    try {
      const newSettings = {
        ...currentSettings,
        environment: { ...currentSettings.environment, ...updates }
      };

      const response = await fetch('/api/reality-customization/environment', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          sessionId: activeSession?.id,
          settings: newSettings.environment
        })
      });
      const data = await response.json();
      if (data.success) {
        setCurrentSettings(newSettings);
        if (activeSession) {
          setActiveSession({ ...activeSession, settings: newSettings });
        }
      }
    } catch (error) {
      console.error('Error updating environment settings:', error);
    } finally {
      setIsApplying(false);
    }
  };

  const openDimensionPortal = async (portalId: string) => {
    try {
      const response = await fetch(`/api/reality-customization/portals/${portalId}/open`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          sessionId: activeSession?.id
        })
      });
      const data = await response.json();
      if (data.success) {
        fetchPortals();
      }
    } catch (error) {
      console.error('Error opening portal:', error);
    }
  };

  const getPortalIcon = (type: string) => {
    switch (type) {
      case 'portal': return <Globe className="w-5 h-5" />;
      case 'wormhole': return <Sparkles className="w-5 h-5" />;
      case 'quantum_tunnel': return <Atom className="w-5 h-5" />;
      default: return <Box className="w-5 h-5" />;
    }
  };

  const getStabilityColor = (stability: number) => {
    if (stability > 0.8) return 'text-green-600';
    if (stability > 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!currentSettings) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Settings className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Loading reality customization...</p>
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
              <Settings className="w-5 h-5" />
              Reality Customization - Physics Manipulation
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={activeSession ? "default" : "secondary"}>
                {activeSession ? 'Active Session' : 'No Session'}
              </Badge>
              <Button onClick={() => createRealitySession('Custom Reality', currentSettings)}>
                <Play className="w-4 h-4 mr-2" />
                Start Session
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Active Session Status */}
      {activeSession && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Active Session: {activeSession.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round((Date.now() - new Date(activeSession.startTime).getTime()) / 60000)} min
                </p>
                <p className="text-sm text-gray-600">Duration</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {activeSession.energyConsumption} kW
                </p>
                <p className="text-sm text-gray-600">Energy Use</p>
              </div>
              <div className="text-center">
                <p className={`text-2xl font-bold ${getStabilityColor(activeSession.stability)}`}>
                  {Math.round(activeSession.stability * 100)}%
                </p>
                <p className="text-sm text-gray-600">Stability</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {activeSession.participants.length}
                </p>
                <p className="text-sm text-gray-600">Participants</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Customization Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="physics">Physics</TabsTrigger>
          <TabsTrigger value="environment">Environment</TabsTrigger>
          <TabsTrigger value="dimensions">Dimensions</TabsTrigger>
          <TabsTrigger value="portals">Portals</TabsTrigger>
        </TabsList>

        <TabsContent value="physics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Physics Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Gravity</label>
                  <Slider
                    value={[currentSettings.physics.gravity]}
                    onValueChange={(value) => updatePhysicsSettings({ gravity: value[0] })}
                    min={0}
                    max={20}
                    step={0.1}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-600">
                    {currentSettings.physics.gravity.toFixed(1)} m/s (Earth: 9.8)
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Time Flow</label>
                  <Slider
                    value={[currentSettings.physics.timeFlow]}
                    onValueChange={(value) => updatePhysicsSettings({ timeFlow: value[0] })}
                    min={0.1}
                    max={10}
                    step={0.1}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-600">
                    {currentSettings.physics.timeFlow.toFixed(1)}x (Normal: 1.0)
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Friction</label>
                  <Slider
                    value={[currentSettings.physics.friction]}
                    onValueChange={(value) => updatePhysicsSettings({ friction: value[0] })}
                    min={0}
                    max={1}
                    step={0.01}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-600">
                    {(currentSettings.physics.friction * 100).toFixed(0)}%
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Elasticity</label>
                  <Slider
                    value={[currentSettings.physics.elasticity]}
                    onValueChange={(value) => updatePhysicsSettings({ elasticity: value[0] })}
                    min={0}
                    max={2}
                    step={0.01}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-600">
                    {currentSettings.physics.elasticity.toFixed(2)} coefficient
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Atom className="w-5 h-5" />
                  Quantum Effects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">Quantum Effects</p>
                      <p className="text-sm text-gray-600">Enable quantum phenomena</p>
                    </div>
                    <Button
                      variant={currentSettings.physics.quantumEffects ? "default" : "outline"}
                      onClick={() => updatePhysicsSettings({ quantumEffects: !currentSettings.physics.quantumEffects })}
                    >
                      {currentSettings.physics.quantumEffects ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Preset Physics</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updatePhysicsSettings({
                          gravity: 9.8,
                          timeFlow: 1.0,
                          friction: 0.3,
                          elasticity: 0.8
                        })}
                      >
                        Earth
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updatePhysicsSettings({
                          gravity: 1.6,
                          timeFlow: 1.0,
                          friction: 0.2,
                          elasticity: 0.9
                        })}
                      >
                        Moon
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updatePhysicsSettings({
                          gravity: 3.7,
                          timeFlow: 1.0,
                          friction: 0.25,
                          elasticity: 0.85
                        })}
                      >
                        Mars
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updatePhysicsSettings({
                          gravity: 0,
                          timeFlow: 1.0,
                          friction: 0,
                          elasticity: 1.0
                        })}
                      >
                        Zero-G
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="environment" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Lighting & Atmosphere
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Light Intensity</label>
                  <Slider
                    value={[currentSettings.environment.lighting.intensity]}
                    onValueChange={(value) => updateEnvironmentSettings({
                      lighting: { ...currentSettings.environment.lighting, intensity: value[0] }
                    })}
                    min={0}
                    max={2}
                    step={0.1}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-600">
                    {(currentSettings.environment.lighting.intensity * 100).toFixed(0)}%
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Temperature</label>
                  <Slider
                    value={[currentSettings.environment.atmosphere.temperature]}
                    onValueChange={(value) => updateEnvironmentSettings({
                      atmosphere: { ...currentSettings.environment.atmosphere, temperature: value[0] }
                    })}
                    min={-50}
                    max={50}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-600">
                    {currentSettings.environment.atmosphere.temperature}C
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Atmospheric Density</label>
                  <Slider
                    value={[currentSettings.environment.atmosphere.density]}
                    onValueChange={(value) => updateEnvironmentSettings({
                      atmosphere: { ...currentSettings.environment.atmosphere, density: value[0] }
                    })}
                    min={0}
                    max={2}
                    step={0.1}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-600">
                    {currentSettings.environment.atmosphere.density.toFixed(1)}x
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Weather</label>
                  <select
                    value={currentSettings.environment.atmosphere.weather}
                    onChange={(e) => updateEnvironmentSettings({
                      atmosphere: { ...currentSettings.environment.atmosphere, weather: e.target.value as any }
                    })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="clear">Clear</option>
                    <option value="cloudy">Cloudy</option>
                    <option value="rainy">Rainy</option>
                    <option value="snowy">Snowy</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5" />
                  Audio Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Audio Enabled</p>
                    <p className="text-sm text-gray-600">Spatial audio system</p>
                  </div>
                  <Button
                    variant={currentSettings.environment.audio.enabled ? "default" : "outline"}
                    onClick={() => updateEnvironmentSettings({
                      audio: { ...currentSettings.environment.audio, enabled: !currentSettings.environment.audio.enabled }
                    })}
                  >
                    {currentSettings.environment.audio.enabled ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Master Volume</label>
                  <Slider
                    value={[currentSettings.environment.audio.volume]}
                    onValueChange={(value) => updateEnvironmentSettings({
                      audio: { ...currentSettings.environment.audio, volume: value[0] }
                    })}
                    min={0}
                    max={1}
                    step={0.01}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-600">
                    {Math.round(currentSettings.environment.audio.volume * 100)}%
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Reverb</label>
                  <Slider
                    value={[currentSettings.environment.audio.reverb]}
                    onValueChange={(value) => updateEnvironmentSettings({
                      audio: { ...currentSettings.environment.audio, reverb: value[0] }
                    })}
                    min={0}
                    max={1}
                    step={0.01}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-600">
                    {Math.round(currentSettings.environment.audio.reverb * 100)}%
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="dimensions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Dimensional Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Number of Dimensions</label>
                    <Slider
                      value={[currentSettings.dimensions.count]}
                      onValueChange={(value) => {
                        const newSettings = {
                          ...currentSettings,
                          dimensions: {
                            ...currentSettings.dimensions,
                            count: value[0],
                            visible: Array.from({ length: value[0] }, (_, i) => i)
                          }
                        };
                        setCurrentSettings(newSettings);
                      }}
                      min={1}
                    max={11}
                    step={1}
                    className="w-full"
                    />
                    <p className="text-xs text-gray-600">
                      {currentSettings.dimensions.count} dimensions
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Visible Dimensions</p>
                    <div className="flex flex-wrap gap-2">
                      {currentSettings.dimensions.visible.map((dim, index) => (
                        <Badge key={index} variant="secondary">
                          {dim === 0 ? 'X' : dim === 1 ? 'Y' : dim === 2 ? 'Z' : `D${dim + 1}`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">Dimensional Portals</p>
                      <p className="text-sm text-gray-600">Enable portal technology</p>
                    </div>
                    <Button
                      variant={currentSettings.dimensions.portals ? "default" : "outline"}
                      onClick={() => {
                        const newSettings = {
                          ...currentSettings,
                          dimensions: {
                            ...currentSettings.dimensions,
                            portals: !currentSettings.dimensions.portals
                          }
                        };
                        setCurrentSettings(newSettings);
                      }}
                    >
                      {currentSettings.dimensions.portals ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">Wormholes</p>
                      <p className="text-sm text-gray-600">Enable wormhole travel</p>
                    </div>
                    <Button
                      variant={currentSettings.dimensions.wormholes ? "default" : "outline"}
                      onClick={() => {
                        const newSettings = {
                          ...currentSettings,
                          dimensions: {
                            ...currentSettings.dimensions,
                            wormholes: !currentSettings.dimensions.wormholes
                          }
                        };
                        setCurrentSettings(newSettings);
                      }}
                    >
                      {currentSettings.dimensions.wormholes ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">Quantum Tunneling</p>
                      <p className="text-sm text-gray-600">Enable quantum tunneling</p>
                    </div>
                    <Button
                      variant={currentSettings.dimensions.quantumTunneling ? "default" : "outline"}
                      onClick={() => {
                        const newSettings = {
                          ...currentSettings,
                          dimensions: {
                            ...currentSettings.dimensions,
                            quantumTunneling: !currentSettings.dimensions.quantumTunneling
                          }
                        };
                        setCurrentSettings(newSettings);
                      }}
                    >
                      {currentSettings.dimensions.quantumTunneling ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portals" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Dimensional Portals
                </CardTitle>
                <Button variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Scan Portals
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {portals.map((portal) => (
                  <Card key={portal.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getPortalIcon(portal.type)}
                          <span className="font-medium">{portal.name}</span>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${
                          portal.isActive ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                      </div>

                      <p className="text-sm text-gray-600 mb-3">{portal.destination}</p>

                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between text-sm">
                          <span>Energy Required</span>
                          <span>{portal.energyRequired} kW</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Stability</span>
                          <span className={getStabilityColor(portal.stability)}>
                            {Math.round(portal.stability * 100)}%
                          </span>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => openDimensionPortal(portal.id)}
                        disabled={portal.isActive}
                        className="w-full"
                      >
                        {portal.isActive ? 'Active' : 'Open Portal'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
