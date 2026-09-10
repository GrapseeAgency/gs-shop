'use client';

import RealityCustomizationDashboard from '@/components/reality-customization/RealityCustomizationDashboard';

export default function RealityCustomizationPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <RealityCustomizationDashboard userId="current" />
    </div>
  );
}
