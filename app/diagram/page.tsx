'use client';
import { usePathname } from 'next/navigation';
import MediaDiagramMotion from '@/components/MediaDiagramMotion';
import ProjectModal from '@/projects/ProjectModal';

export default function DiagramPage() {
  const pathname = usePathname();
  // URL에서 id 추출
  const match = pathname.match(/^\/diagram\/projects\/([^/]+)/);
  const modalId = match ? match[1] : null;

  return (
    <>
      <MediaDiagramMotion />
      {modalId && <ProjectModal id={modalId} />}
    </>
  ); 
}
