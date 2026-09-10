'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Gem, 
  Crown, 
  Star, 
  Sparkles, 
  Eye,
  Heart,
  Clock,
  DollarSign,
  Award,
  Target,
  ShoppingBag,
  Zap,
  BarChart3,
  Users,
  CheckCircle,
  Lock,
  Key,
  Shield,
  Diamond
} from 'lucide-react';

interface LuxuryProduct {
  id: string;
  name: string;
  description: string;
  category: 'beyond_commerce' | 'experiential' | 'exclusive_access' | 'custom_creation' | 'investment';
  price: {
    amount: number;
    currency: string;
    negotiable: boolean;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  exclusivity: {
    limited: boolean;
    quantity?: number;
    timeLimited?: boolean;
    deadline?: string;
  };
  features: string[];
  benefits: string[];
  requirements: {
    vipLevel: number;
    verification: boolean;
    invitation: boolean;
  };
  status: 'available' | 'reserved' | 'sold' | 'coming_soon';
  images: string[];
  owner?: string;
  createdAt: string;
}

interface QuantumCollectible {
  id: string;
  name: string;
  celebrity: {
    name: string;
    avatar?: string;
    profession: string;
    entanglementStrength: number;
  };
  type: 'memory' | 'experience' | 'skill' | 'moment' | 'signature';
  quantumState: {
    coherence: number;
    entanglement: number;
    superposition: boolean;
    collapsed: boolean;
  };
  value: {
    initial: number;
    current: number;
    currency: string;
  };
  ownership: {
    currentOwner?: string;
    previousOwners: string[];
    transferHistory: any[];
  };
  properties: string[];
  experience: string;
  isTradable: boolean;
  createdAt: string;
}

interface ExclusiveAccess {
  id: string;
  title: string;
  description: string;
  type: 'event' | 'service' | 'location' | 'experience' | 'consultation';
  provider: string;
  availability: {
    slots: number;
    booked: number;
    waitlist: number;
  };
  pricing: {
    basePrice: number;
    currency: string;
    includes: string[];
  };
  requirements: {
    membershipLevel: string;
    verification: boolean;
    referrals?: number;
  };
  timeline: {
    duration: string;
    frequency: string;
    nextAvailable: string;
  };
  status: 'available' | 'booked' | 'full' | 'coming_soon';
}

export default function LuxuryProductsHub({ userId }: { userId: string }) {
  const [luxuryProducts, setLuxuryProducts] = useState<LuxuryProduct[]>([]);
  const [quantumCollectibles, setQuantumCollectibles] = useState<QuantumCollectible[]>([]);
  const [exclusiveAccess, setExclusiveAccess] = useState<ExclusiveAccess[]>([]);
  const [userVipLevel, setUserVipLevel] = useState(0);
  const [activeTab, setActiveTab] = useState('products');
  const [selectedProduct, setSelectedProduct] = useState<LuxuryProduct | null>(null);

  useEffect(() => {
    fetchLuxuryProducts();
    fetchQuantumCollectibles();
    fetchExclusiveAccess();
    fetchUserVipLevel();
  }, [userId]);

  const fetchLuxuryProducts = async () => {
    try {
      const response = await fetch(`/api/luxury-products?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setLuxuryProducts(data.data);
      }
    } catch (error) {
      console.error('Error fetching luxury products:', error);
    }
  };

  const fetchQuantumCollectibles = async () => {
    try {
      const response = await fetch(`/api/quantum-collectibles?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setQuantumCollectibles(data.data);
      }
    } catch (error) {
      console.error('Error fetching quantum collectibles:', error);
    }
  };

  const fetchExclusiveAccess = async () => {
    try {
      const response = await fetch(`/api/exclusive-access?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setExclusiveAccess(data.data);
      }
    } catch (error) {
      console.error('Error fetching exclusive access:', error);
    }
  };

  const fetchUserVipLevel = async () => {
    try {
      const response = await fetch(`/api/user/vip-level/${userId}`);
      const data = await response.json();
      if (data.success) {
        setUserVipLevel(data.data.level);
      }
    } catch (error) {
      console.error('Error fetching VIP level:', error);
    }
  };

  const purchaseLuxuryProduct = async (productId: string, offerAmount?: number) => {
    try {
      const response = await fetch(`/api/luxury-products/${productId}/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          offerAmount,
          paymentMethod: 'quantum_wallet'
        })
      });
      const data = await response.json();
      if (data.success) {
        fetchLuxuryProducts();
      }
    } catch (error) {
      console.error('Error purchasing luxury product:', error);
    }
  };

  const entangleWithCelebrity = async (collectibleId: string) => {
    try {
      const response = await fetch(`/api/quantum-collectibles/${collectibleId}/entangle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          entanglementStrength: 0.8
        })
      });
      const data = await response.json();
      if (data.success) {
        fetchQuantumCollectibles();
      }
    } catch (error) {
      console.error('Error entangling with celebrity:', error);
    }
  };

  const bookExclusiveAccess = async (accessId: string) => {
    try {
      const response = await fetch(`/api/exclusive-access/${accessId}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          participants: 1,
          specialRequests: []
        })
      });
      const data = await response.json();
      if (data.success) {
        fetchExclusiveAccess();
      }
    } catch (error) {
      console.error('Error booking exclusive access:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'beyond_commerce': return <Gem className="w-5 h-5" />;
      case 'experiential': return <Star className="w-5 h-5" />;
      case 'exclusive_access': return <Key className="w-5 h-5" />;
      case 'custom_creation': return <Sparkles className="w-5 h-5" />;
      case 'investment': return <DollarSign className="w-5 h-5" />;
      default: return <Gem className="w-5 h-5" />;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'mythic': return 'text-purple-600 border-purple-400';
      case 'legendary': return 'text-yellow-600 border-yellow-400';
      case 'epic': return 'text-purple-600 border-purple-400';
      case 'rare': return 'text-blue-600 border-blue-400';
      case 'common': return 'text-gray-600 border-gray-400';
      default: return 'text-gray-600 border-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'reserved': return 'bg-yellow-500';
      case 'sold': return 'bg-red-500';
      case 'booked': return 'bg-blue-500';
      case 'full': return 'bg-red-500';
      case 'coming_soon': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'crypto' ? 'USD' : currency
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5" />
              Luxury Products & Beyond-Commerce
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                VIP Level {userVipLevel}
              </Badge>
              <Button variant="outline">
                <Shield className="w-4 h-4 mr-2" />
                Verify Status
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="products">Luxury Products</TabsTrigger>
          <TabsTrigger value="collectibles">Quantum Collectibles</TabsTrigger>
          <TabsTrigger value="access">Exclusive Access</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {luxuryProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(product.status)}`} />
                      {getCategoryIcon(product.category)}
                    </div>
                    <Badge variant="outline" className={getRarityColor(product.rarity)}>
                      {product.rarity}
                    </Badge>
                  </div>

                  <h3 className="font-medium mb-2">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Price</span>
                      <span className="text-sm">
                        {formatCurrency(product.price.amount, product.price.currency)}
                        {product.price.negotiable && ' (Negotiable)'}
                      </span>
                    </div>
                    {product.exclusivity.limited && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Limited</span>
                        <span className="text-sm">
                          {product.exclusivity.quantity || 'Limited'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {product.features.slice(0, 2).map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>

                  <div className="space-y-2">
                    {product.requirements.vipLevel > userVipLevel ? (
                      <Button size="sm" disabled className="w-full">
                        <Lock className="w-3 h-3 mr-1" />
                        VIP {product.requirements.vipLevel} Required
                      </Button>
                    ) : product.status === 'available' ? (
                      <Button 
                        size="sm" 
                        onClick={() => purchaseLuxuryProduct(product.id)}
                        className="w-full"
                      >
                        <ShoppingBag className="w-3 h-3 mr-1" />
                        Purchase
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" disabled className="w-full">
                        {product.status.replace('_', ' ')}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="collectibles" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quantumCollectibles.map((collectible) => (
              <Card key={collectible.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={collectible.celebrity.avatar} />
                        <AvatarFallback>{collectible.celebrity?.name?.charAt(0) || 'C'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{collectible.name}</h4>
                        <p className="text-sm text-gray-600">{collectible.celebrity.name}</p>
                        <p className="text-xs text-gray-500">{collectible.celebrity.profession}</p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {collectible.type}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">{collectible.experience}</p>

                  <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                    <div>
                      <p className="text-gray-600">Quantum Coherence</p>
                      <p className="font-medium">{Math.round(collectible.quantumState.coherence * 100)}%</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Entanglement</p>
                      <p className="font-medium">{Math.round(collectible.quantumState.entanglement * 100)}%</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Current Value</p>
                      <p className="font-medium">
                        {formatCurrency(collectible.value.current, collectible.value.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Owners</p>
                      <p className="font-medium">{collectible.ownership.previousOwners.length + 1}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        collectible.quantumState.superposition ? 'bg-purple-500' : 'bg-gray-400'
                      }`} />
                      <span className="text-sm">
                        {collectible.quantumState.superposition ? 'Superposition Active' : 'Collapsed State'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {collectible.properties.slice(0, 3).map((property, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {property}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    {collectible.isTradable ? (
                      <Button size="sm" className="flex-1">
                        <DollarSign className="w-3 h-3 mr-1" />
                        Trade
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" disabled className="flex-1">
                        Not Tradable
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => entangleWithCelebrity(collectible.id)}
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      Entangle
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="access" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exclusiveAccess.map((access) => (
              <Card key={access.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{access.title}</h4>
                      <p className="text-sm text-gray-600">{access.provider}</p>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(access.status)}`} />
                  </div>

                  <p className="text-sm text-gray-600 mb-3">{access.description}</p>

                  <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                    <div>
                      <p className="text-gray-600">Availability</p>
                      <p className="font-medium">
                        {access.availability.booked}/{access.availability.slots}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Duration</p>
                      <p className="font-medium">{access.timeline.duration}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Price</p>
                      <p className="font-medium">
                        {formatCurrency(access.pricing.basePrice, access.pricing.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Next Available</p>
                      <p className="font-medium">
                        {new Date(access.timeline.nextAvailable).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <p className="text-sm font-medium">Includes:</p>
                    <div className="flex flex-wrap gap-1">
                      {access.pricing.includes.slice(0, 3).map((item, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {access.requirements.membershipLevel > `VIP ${userVipLevel}` ? (
                      <Button size="sm" disabled className="w-full">
                        <Lock className="w-3 h-3 mr-1" />
                        {access.requirements.membershipLevel} Required
                      </Button>
                    ) : access.status === 'available' ? (
                      <Button 
                        size="sm" 
                        onClick={() => bookExclusiveAccess(access.id)}
                        className="w-full"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Book Now
                      </Button>
                    ) : access.status === 'full' ? (
                      <Button size="sm" variant="outline" className="w-full">
                        Join Waitlist ({access.availability.waitlist})
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" disabled className="w-full">
                        {access.status.replace('_', ' ')}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
