'use client';
import { usePathname } from 'next/navigation';
import MediaDiagramMotion from "@/components/MediaDiagramMotion";

export default function DiagramLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MediaDiagramMotion />
      {children}
    </>
  );
}
