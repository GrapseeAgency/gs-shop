'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Video, 
  Users, 
  Heart, 
  MessageCircle, 
  ShoppingBag, 
  Zap,
  Eye,
  Clock,
  DollarSign,
  TrendingUp,
  Send,
  Gift,
  Star,
  Brain
} from 'lucide-react';

interface LiveShoppingSession {
  id: string;
  title: string;
  hostId: string;
  host: {
    id: string;
    name: string;
    avatar?: string;
  };
  products: string[];
  startTime: string;
  endTime: string;
  status: 'upcoming' | 'live' | 'ended';
  viewers: number;
  holographicUrl?: string;
  quantumFeatures: boolean;
  dnaMatching: boolean;
  interactions: LiveInteraction[];
  emotionalData?: any;
  neuralBiddings: any[];
}

interface LiveInteraction {
  id: string;
  userId: string;
  type: 'comment' | 'purchase' | 'neural_bid' | 'emotion';
  content: string;
  timestamp: string;
  user: {
    name: string;
    avatar?: string;
  };
  data?: any;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  holographic?: boolean;
  dnaCompatible?: boolean;
}

export default function LiveShoppingViewer({ sessionId }: { sessionId?: string }) {
  const [session, setSession] = useState<LiveShoppingSession | null>(null);
  const [interactions, setInteractions] = useState<LiveInteraction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('live');
  const [neuralBidAmount, setNeuralBidAmount] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Use a default session ID if none provided
  const activeSessionId = sessionId || 'demo-session-1';

  useEffect(() => {
    fetchSession();
    const interval = setInterval(() => {
      fetchSession();
      fetchInteractions();
    }, 3000);
    return () => clearInterval(interval);
  }, [sessionId]);

  const fetchSession = async () => {
    try {
      const response = await fetch(`/api/live-shopping/${activeSessionId}`);
      const data = await response.json();
      if (data.success) {
        setSession(data.data);
        setViewerCount(data.data.viewers);
        if (data.data.status === 'live' && !isConnected) {
          connectToStream();
        }
      }
    } catch (error) {
      console.error('Error fetching session:', error);
    }
  };

  const fetchInteractions = async () => {
    try {
      const response = await fetch(`/api/live-shopping/${activeSessionId}/interactions`);
      const data = await response.json();
      if (data.success) {
        setInteractions(data.data.slice(-20)); // Keep last 20 interactions
      }
    } catch (error) {
      console.error('Error fetching interactions:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/live-shopping/${activeSessionId}/products`);
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const connectToStream = async () => {
    try {
      // Connect to live streaming service
      setIsConnected(true);
      if (videoRef.current && session?.holographicUrl) {
        videoRef.current.src = session.holographicUrl;
      }
    } catch (error) {
      console.error('Error connecting to stream:', error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    try {
      const response = await fetch(`/api/live-shopping/${activeSessionId}/interact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'comment',
          content: message,
          userId: 'current'
        })
      });
      const data = await response.json();
      if (data.success) {
        setMessage('');
        fetchInteractions();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const makePurchase = async (productId: string) => {
    try {
      const response = await fetch(`/api/live-shopping/${activeSessionId}/interact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'purchase',
          content: `Purchased product ${productId}`,
          userId: 'current',
          data: { productId }
        })
      });
      const data = await response.json();
      if (data.success) {
        fetchInteractions();
      }
    } catch (error) {
      console.error('Error making purchase:', error);
    }
  };

  const placeNeuralBid = async (productId: string, amount: number) => {
    try {
      const response = await fetch(`/api/live-shopping/${activeSessionId}/interact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'neural_bid',
          content: `Neural bid $${amount} for product ${productId}`,
          userId: 'current',
          data: { productId, amount }
        })
      });
      const data = await response.json();
      if (data.success) {
        fetchInteractions();
        setNeuralBidAmount(0);
      }
    } catch (error) {
      console.error('Error placing neural bid:', error);
    }
  };

  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-red-500';
      case 'upcoming': return 'bg-yellow-500';
      case 'ended': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Video className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Loading live shopping session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Session Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src={session.host.avatar} />
                <AvatarFallback>{session.host?.name?.charAt(0) || 'H'}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="flex items-center gap-2">
                  {session.title}
                  <div className={`w-3 h-3 rounded-full ${getSessionStatusColor(session.status)}`} />
                </CardTitle>
                <p className="text-sm text-gray-600">Hosted by {session.host.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span className="font-medium">{viewerCount}</span>
              </div>
              {session.quantumFeatures && (
                <Badge variant="secondary">
                  <Zap className="w-3 h-3 mr-1" />
                  Quantum
                </Badge>
              )}
              {session.dnaMatching && (
                <Badge variant="secondary">
                  <Brain className="w-3 h-3 mr-1" />
                  DNA Match
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Video/Stream */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="relative bg-black rounded-lg overflow-hidden">
                {session.holographicUrl ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full aspect-video"
                  />
                ) : (
                  <div className="w-full aspect-video flex items-center justify-center">
                    <div className="text-center text-white">
                      <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">
                        {session.status === 'live' ? 'Stream Starting...' : 'Stream Not Available'}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Live Badge */}
                {session.status === 'live' && (
                  <div className="absolute top-4 left-4">
                    <Badge variant="destructive" className="bg-red-600">
                      <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                      LIVE
                    </Badge>
                  </div>
                )}

                {/* Viewer Count */}
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="bg-black/50 text-white">
                    <Users className="w-3 h-3 mr-1" />
                    {viewerCount}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products Showcase */}
          <Card>
            <CardHeader>
              <CardTitle>Featured Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {products.map((product) => (
                  <div key={product.id} className="border rounded-lg p-3">
                    <div className="aspect-square bg-gray-100 rounded mb-2 relative">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover rounded"
                      />
                      {product.holographic && (
                        <Badge className="absolute top-2 left-2 text-xs">
                          <Zap className="w-3 h-3 mr-1" />
                          3D
                        </Badge>
                      )}
                      {product.dnaCompatible && (
                        <Badge className="absolute top-2 right-2 text-xs">
                          <Brain className="w-3 h-3 mr-1" />
                          DNA
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-medium text-sm truncate">{product.name}</h4>
                    <p className="text-lg font-bold">${product.price}</p>
                    <div className="flex gap-2 mt-2">
                      <Button 
                        size="sm" 
                        onClick={() => makePurchase(product.id)}
                        className="flex-1"
                      >
                        <ShoppingBag className="w-3 h-3 mr-1" />
                        Buy
                      </Button>
                      {session.quantumFeatures && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => placeNeuralBid(product.id, neuralBidAmount || product.price * 1.1)}
                        >
                          <Zap className="w-3 h-3 mr-1" />
                          Bid
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          {/* Interactions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Live Interactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {interactions.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No interactions yet</p>
                ) : (
                  interactions.map((interaction) => (
                    <div key={interaction.id} className="flex gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={interaction.user.avatar} />
                        <AvatarFallback>{interaction.user?.name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{interaction.user.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {interaction.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{interaction.content}</p>
                        <p className="text-xs text-gray-400">{formatTime(interaction.timestamp)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Interaction Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Join the Conversation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button onClick={sendMessage} size="sm">
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              {session.quantumFeatures && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Neural Bid Amount</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={neuralBidAmount}
                      onChange={(e) => setNeuralBidAmount(Number(e.target.value))}
                      placeholder="Enter amount"
                      className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Button variant="outline" size="sm">
                      <Brain className="w-4 h-4 mr-1" />
                      Neural Bid
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Heart className="w-4 h-4 mr-1" />
                  Like
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Gift className="w-4 h-4 mr-1" />
                  Gift
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Star className="w-4 h-4 mr-1" />
                  Rate
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Session Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Session Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Duration</span>
                  <span>
                    {session.startTime && (
                      `${Math.round((Date.now() - new Date(session.startTime).getTime()) / 60000)} min`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Peak Viewers</span>
                  <span>{Math.max(viewerCount, 150)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Engagement</span>
                  <span>High</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Sales</span>
                  <span>{interactions.filter(i => i.type === 'purchase').length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
