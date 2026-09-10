'use client';

import BioHackingDashboard from '@/components/bio-hacking/BioHackingDashboard';

export default function BioHackingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <BioHackingDashboard userId="current" />
    </div>
  );
}
