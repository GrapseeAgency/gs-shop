'use client';

import DigitalTwinViewer from '@/components/digital-twin/DigitalTwinViewer';

export default function DigitalTwinPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <DigitalTwinViewer userId="current" />
    </div>
  );
}
