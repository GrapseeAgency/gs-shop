'use client';

import TrendCouncilDashboard from '@/components/trend-council/TrendCouncilDashboard';

export default function TrendCouncilPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <TrendCouncilDashboard userId="current" />
    </div>
  );
}
