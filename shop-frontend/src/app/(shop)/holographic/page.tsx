'use client';

import HolographicViewer from '@/components/holographic/HolographicViewer';

export default function HolographicPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <HolographicViewer productId="demo-product" />
    </div>
  );
}
