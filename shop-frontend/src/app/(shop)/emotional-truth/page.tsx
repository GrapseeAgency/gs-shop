'use client';

import EmotionalTruthMatrix from '@/components/emotional-truth/EmotionalTruthMatrix';

export default function EmotionalTruthPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <EmotionalTruthMatrix userId="current" />
    </div>
  );
}
