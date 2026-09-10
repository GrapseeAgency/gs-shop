'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Box, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Move, 
  Palette, 
  Sun, 
  Eye,
  Download,
  Share2,
  Maximize2
} from 'lucide-react';

interface HolographicProduct {
  id: string;
  name: string;
  modelUrl: string;
  textures: string[];
  animations: string[];
  interactiveElements: string[];
  holographicSettings: {
    scale: number;
    rotation: number;
    lighting: {
      intensity: number;
      color: string;
      position: [number, number, number];
    };
    camera: {
      position: [number, number, number];
      target: [number, number, number];
    };
  };
}

interface ViewSettings {
  mode: '3d' | 'ar' | 'vr';
  quality: 'low' | 'medium' | 'high';
  lighting: 'natural' | 'studio' | 'dramatic';
  background: 'transparent' | 'white' | 'black' | 'gradient';
}

export default function HolographicViewer({ productId }: { productId: string }) {
  const [product, setProduct] = useState<HolographicProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewSettings, setViewSettings] = useState<ViewSettings>({
    mode: '3d',
    quality: 'high',
    lighting: 'studio',
    background: 'transparent'
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentAnimation, setCurrentAnimation] = useState<string>('');
  const [selectedTexture, setSelectedTexture] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fetchHolographicProduct();
  }, [productId]);

  const fetchHolographicProduct = async () => {
    try {
      const response = await fetch(`/api/holographic/products/${productId}`);
      const data = await response.json();
      if (data.success) {
        setProduct(data.data);
        initializeHolographicView(data.data);
      }
    } catch (error) {
      console.error('Error fetching holographic product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeHolographicView = (productData: HolographicProduct) => {
    // Initialize Three.js scene for holographic rendering
    if (canvasRef.current) {
      // This would initialize the actual holographic rendering
      console.log('Initializing holographic view for:', productData.name);
    }
  };

  const updateHolographicSettings = async (settings: Partial<typeof viewSettings>) => {
    const newSettings = { ...viewSettings, ...settings };
    setViewSettings(newSettings);

    try {
      const response = await fetch(`/api/holographic/viewer/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          settings: newSettings
        })
      });
      const data = await response.json();
      if (data.success) {
        // Apply settings to the holographic view
        applyHolographicSettings(data.data);
      }
    } catch (error) {
      console.error('Error updating holographic settings:', error);
    }
  };

  const applyHolographicSettings = (settings: any) => {
    // Apply settings to the holographic view
    console.log('Applying holographic settings:', settings);
  };

  const handleRotation = (axis: 'x' | 'y' | 'z', value: number) => {
    if (!product) return;
    
    const newSettings = {
      ...product.holographicSettings,
      rotation: value
    };

    updateHolographicSettings({ mode: viewSettings.mode });
  };

  const handleScale = (value: number[]) => {
    if (!product) return;
    
    const newSettings = {
      ...product.holographicSettings,
      scale: value[0]
    };

    updateHolographicSettings({ mode: viewSettings.mode });
  };

  const playAnimation = async (animationName: string) => {
    setCurrentAnimation(animationName);
    
    try {
      const response = await fetch(`/api/holographic/animations/play`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          animation: animationName
        })
      });
      const data = await response.json();
      if (data.success) {
        console.log('Animation started:', animationName);
      }
    } catch (error) {
      console.error('Error playing animation:', error);
    }
  };

  const changeTexture = async (textureUrl: string) => {
    setSelectedTexture(textureUrl);
    
    try {
      const response = await fetch(`/api/holographic/textures/change`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          texture: textureUrl
        })
      });
      const data = await response.json();
      if (data.success) {
        console.log('Texture changed:', textureUrl);
      }
    } catch (error) {
      console.error('Error changing texture:', error);
    }
  };

  const captureSnapshot = async () => {
    if (!canvasRef.current) return;
    
    try {
      const response = await fetch(`/api/holographic/snapshot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          settings: viewSettings
        })
      });
      const data = await response.json();
      if (data.success) {
        // Download the snapshot
        const link = document.createElement('a');
        link.href = data.data.snapshotUrl;
        link.download = `holographic-${productId}-${Date.now()}.png`;
        link.click();
      }
    } catch (error) {
      console.error('Error capturing snapshot:', error);
    }
  };

  const shareHologram = async () => {
    try {
      const response = await fetch(`/api/holographic/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          settings: viewSettings
        })
      });
      const data = await response.json();
      if (data.success) {
        // Copy share link to clipboard
        navigator.clipboard.writeText(data.data.shareUrl);
        alert('Share link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing hologram:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Box className="w-12 h-12 mx-auto mb-4 text-blue-500 animate-pulse" />
          <p className="text-gray-600">Loading holographic product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Box className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Holographic product not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`}>
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Box className="w-5 h-5" />
              Holographic Viewer - {product.name}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={captureSnapshot}>
                <Download className="w-4 h-4 mr-2" />
                Snapshot
              </Button>
              <Button variant="outline" size="sm" onClick={shareHologram}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                <Maximize2 className="w-4 h-4 mr-2" />
                {isFullscreen ? 'Exit' : 'Fullscreen'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Viewer */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-0">
              <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg overflow-hidden">
                <canvas
                  ref={canvasRef}
                  className="w-full h-96 lg:h-[600px]"
                  style={{ background: viewSettings.background === 'transparent' ? 'transparent' : 'inherit' }}
                />
                
                {/* Viewer Controls Overlay */}
                <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm">
                      <RotateCw className="w-4 h-4" />
                    </Button>
                    <Button variant="secondary" size="sm">
                      <Move className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm">
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <Button variant="secondary" size="sm">
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Mode Badge */}
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary" className="bg-black/50">
                    {viewSettings.mode.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls Panel */}
        <div className="space-y-4">
          {/* View Mode */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">View Mode</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={viewSettings.mode} onValueChange={(value) => updateHolographicSettings({ mode: value as any })}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="3d">3D</TabsTrigger>
                  <TabsTrigger value="ar">AR</TabsTrigger>
                  <TabsTrigger value="vr">VR</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="space-y-2">
                <label className="text-sm font-medium">Quality</label>
                <select 
                  value={viewSettings.quality}
                  onChange={(e) => updateHolographicSettings({ quality: e.target.value as any })}
                  className="w-full p-2 border rounded"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Lighting</label>
                <select 
                  value={viewSettings.lighting}
                  onChange={(e) => updateHolographicSettings({ lighting: e.target.value as any })}
                  className="w-full p-2 border rounded"
                >
                  <option value="natural">Natural</option>
                  <option value="studio">Studio</option>
                  <option value="dramatic">Dramatic</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Background</label>
                <select 
                  value={viewSettings.background}
                  onChange={(e) => updateHolographicSettings({ background: e.target.value as any })}
                  className="w-full p-2 border rounded"
                >
                  <option value="transparent">Transparent</option>
                  <option value="white">White</option>
                  <option value="black">Black</option>
                  <option value="gradient">Gradient</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Transform Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Transform</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Scale</label>
                <Slider
                  value={[product.holographicSettings.scale]}
                  onValueChange={handleScale}
                  min={0.1}
                  max={3}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Rotation</label>
                <Slider
                  value={[product.holographicSettings.rotation]}
                  onValueChange={(value) => handleRotation('y', value[0])}
                  min={0}
                  max={360}
                  step={1}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Animations */}
          {product.animations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Animations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {product.animations.map((animation) => (
                  <Button
                    key={animation}
                    variant={currentAnimation === animation ? "default" : "outline"}
                    size="sm"
                    onClick={() => playAnimation(animation)}
                    className="w-full"
                  >
                    {animation}
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Textures */}
          {product.textures.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Textures</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {product.textures.map((texture) => (
                  <Button
                    key={texture}
                    variant={selectedTexture === texture ? "default" : "outline"}
                    size="sm"
                    onClick={() => changeTexture(texture)}
                    className="w-full"
                  >
                    <Palette className="w-4 h-4 mr-2" />
                    {texture.split('/').pop()}
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
