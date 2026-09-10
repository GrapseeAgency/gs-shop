'use client';

import PersonalShopperAI from '@/components/personal-shopper/PersonalShopperAI';

export default function PersonalShopperPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <PersonalShopperAI userId="current" />
    </div>
  );
}
