'use client';

import StyleEvolutionDashboard from '@/components/style-evolution/StyleEvolutionDashboard';

export default function StyleEvolutionPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <StyleEvolutionDashboard userId="current" />
    </div>
  );
}
