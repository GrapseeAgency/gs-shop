'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Atom, 
  Zap, 
  Clock, 
  TrendingUp, 
  Package, 
  Brain,
  Activity,
  AlertTriangle,
  CheckCircle,
  Timer
} from 'lucide-react';

interface QuantumPrediction {
  id: string;
  type: 'trend' | 'price' | 'demand' | 'inventory';
  target: string;
  prediction: any;
  confidence: number;
  superposition: boolean;
  collapsedAt?: string;
  createdAt: string;
}

interface QuantumTeleportation {
  id: string;
  productId: string;
  origin: string;
  destination: string;
  status: 'initiating' | 'entangling' | 'teleporting' | 'completed' | 'failed';
  progress: number;
  estimatedArrival: string;
  quantumSignature: string;
}

export default function QuantumDashboard() {
  const [predictions, setPredictions] = useState<QuantumPrediction[]>([]);
  const [teleportations, setTeleportations] = useState<QuantumTeleportation[]>([]);
  const [activeTab, setActiveTab] = useState('predictions');
  const [isCreatingPrediction, setIsCreatingPrediction] = useState(false);

  useEffect(() => {
    fetchPredictions();
    fetchTeleportations();
    const interval = setInterval(() => {
      fetchPredictions();
      fetchTeleportations();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchPredictions = async () => {
    try {
      const response = await fetch('/api/quantum/predictions');
      const data = await response.json();
      if (data.success) {
        setPredictions(data.data);
      }
    } catch (error) {
      console.error('Error fetching predictions:', error);
    }
  };

  const fetchTeleportations = async () => {
    try {
      const response = await fetch('/api/quantum/teleportation');
      const data = await response.json();
      if (data.success) {
        setTeleportations(data.data);
      }
    } catch (error) {
      console.error('Error fetching teleportations:', error);
    }
  };

  const createPrediction = async (type: string, target: string) => {
    setIsCreatingPrediction(true);
    try {
      const response = await fetch('/api/quantum/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          target,
          timeHorizon: '30-days',
          quantumEnhanced: true
        })
      });
      const data = await response.json();
      if (data.success) {
        fetchPredictions();
      }
    } catch (error) {
      console.error('Error creating prediction:', error);
    } finally {
      setIsCreatingPrediction(false);
    }
  };

  const collapsePrediction = async (predictionId: string) => {
    try {
      const response = await fetch(`/api/quantum/predictions/${predictionId}/collapse`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        fetchPredictions();
      }
    } catch (error) {
      console.error('Error collapsing prediction:', error);
    }
  };

  const selectProductForTeleportation = async (): Promise<string | null> => {
    // Get available products from API or use a default selection
    try {
      const response = await fetch('/api/products?limit=10');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.length > 0) {
          // Return the first available product for now
          // In a real implementation, this would show a product selection UI
          return data.data[0].id;
        }
      }
    } catch (error) {
      console.error('Error fetching products for teleportation:', error);
    }
    return null;
  };

  const initiateTeleportation = async (productId?: string, destination?: string) => {
    // If no productId provided, show product selection or use a default
    const targetProductId = productId || await selectProductForTeleportation();
    const targetDestination = destination || 'customer-home';
    
    if (!targetProductId) {
      console.warn('No product selected for teleportation');
      return;
    }
    
    try {
      const response = await fetch('/api/quantum/teleportation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: targetProductId,
          origin: 'warehouse',
          destination: targetDestination,
          quantumStabilization: true
        })
      });
      const data = await response.json();
      if (data.success) {
        fetchTeleportations();
      }
    } catch (error) {
      console.error('Error initiating teleportation:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'initiating': case 'entangling': case 'teleporting': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'failed': return <AlertTriangle className="w-4 h-4" />;
      default: return <Timer className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Quantum Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Predictions</p>
                <p className="text-2xl font-bold">
                  {predictions.filter(p => !p.collapsedAt).length}
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
                <p className="text-sm font-medium text-gray-600">Teleportations</p>
                <p className="text-2xl font-bold">
                  {teleportations.filter(t => t.status !== 'completed' && t.status !== 'failed').length}
                </p>
              </div>
              <Zap className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Confidence</p>
                <p className="text-2xl font-bold">
                  {predictions.length > 0 
                    ? Math.round(predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length * 100)
                    : 0}%
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
                <p className="text-sm font-medium text-gray-600">Quantum State</p>
                <p className="text-2xl font-bold">Stable</p>
              </div>
              <Atom className="w-8 h-8 text-cyan-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="teleportation">Teleportation</TabsTrigger>
          <TabsTrigger value="quantum-lab">Quantum Lab</TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Quantum Predictions
                </CardTitle>
                <Button 
                  onClick={() => createPrediction('trend', 'fashion')}
                  disabled={isCreatingPrediction}
                >
                  {isCreatingPrediction ? 'Creating...' : 'New Prediction'}
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
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{prediction.type}</Badge>
                          <span className="font-medium">{prediction.target}</span>
                          {prediction.superposition && (
                            <Badge variant="secondary">Superposition</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {prediction.collapsedAt ? (
                            <Badge variant="default">Collapsed</Badge>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => collapsePrediction(prediction.id)}
                            >
                              Collapse
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Confidence</span>
                          <span>{Math.round(prediction.confidence * 100)}%</span>
                        </div>
                        <Progress value={prediction.confidence * 100} />
                      </div>

                      <div className="mt-3 text-sm text-gray-600">
                        <p>Created: {new Date(prediction.createdAt).toLocaleString()}</p>
                        {prediction.collapsedAt && (
                          <p>Collapsed: {new Date(prediction.collapsedAt).toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teleportation" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Quantum Teleportation
                </CardTitle>
                <Button onClick={() => initiateTeleportation()}>
                  New Teleportation
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teleportations.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No teleportations in progress</p>
                ) : (
                  teleportations.map((teleport) => (
                    <div key={teleport.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(teleport.status)}`} />
                          <span className="font-medium">Product #{teleport.productId}</span>
                          <Badge variant="outline">{teleport.status}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(teleport.status)}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Route</span>
                          <span>{teleport.origin}  {teleport.destination}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{Math.round(teleport.progress)}%</span>
                        </div>
                        <Progress value={teleport.progress} />
                      </div>

                      <div className="mt-3 text-sm text-gray-600">
                        <p>Quantum Signature: {teleport.quantumSignature}</p>
                        <p>ETA: {new Date(teleport.estimatedArrival).toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quantum-lab" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Atom className="w-5 h-5" />
                  Quantum State Analyzer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Coherence</span>
                      <span>87%</span>
                    </div>
                    <Progress value={87} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Entanglement</span>
                      <span>92%</span>
                    </div>
                    <Progress value={92} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Stability</span>
                      <span>95%</span>
                    </div>
                    <Progress value={95} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Quantum Experiments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Brain className="w-4 h-4 mr-2" />
                    Entangle Particles
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Clock className="w-4 h-4 mr-2" />
                    Time Dilation Test
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Package className="w-4 h-4 mr-2" />
                    Object Teleportation
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Probability Wave
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quantum Computing Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">128</p>
                  <p className="text-sm text-gray-600">Qubits Available</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">99.9%</p>
                  <p className="text-sm text-gray-600">Uptime</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">1.2s</p>
                  <p className="text-sm text-gray-600">Gate Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
