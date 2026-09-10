'use client';

import ShoppingGamesHub from '@/components/shopping-games/ShoppingGamesHub';

export default function ShoppingGamesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ShoppingGamesHub userId="current" />
    </div>
  );
}
