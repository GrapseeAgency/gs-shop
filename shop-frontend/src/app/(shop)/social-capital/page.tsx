'use client';

import SocialCapitalDashboard from '@/components/social-capital/SocialCapitalDashboard';

export default function SocialCapitalPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <SocialCapitalDashboard userId="current" />
    </div>
  );
}
