'use client';

import dynamic from 'next/dynamic';

const DiagramPageClient = dynamic(() => import('./DiagramPageClient'), { ssr: false });

export default function DiagramPage() {
  return <DiagramPageClient />;
}
