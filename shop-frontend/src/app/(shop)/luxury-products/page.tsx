'use client';

import LuxuryProductsHub from '@/components/luxury-products/LuxuryProductsHub';

export default function LuxuryProductsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <LuxuryProductsHub userId="current" />
    </div>
  );
}
