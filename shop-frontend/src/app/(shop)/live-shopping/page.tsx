'use client';

import LiveShoppingViewer from '@/components/live-shopping/LiveShoppingViewer';

export default function LiveShoppingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <LiveShoppingViewer sessionId="demo-session-1" />
    </div>
  );
}
