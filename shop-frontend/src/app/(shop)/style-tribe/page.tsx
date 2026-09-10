'use client';

import StyleTribeHub from '@/components/style-tribe/StyleTribeHub';

export default function StyleTribePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <StyleTribeHub userId="current" />
    </div>
  );
}
