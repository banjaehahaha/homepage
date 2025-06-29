'use client';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import MediaDiagramMotion from "@/components/MediaDiagramMotion";


export default function DiagramLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [modalId, setModalId] = useState<string | null>(null);

  // 경로에서 모달 열릴지 체크
  useEffect(() => {
    const match = pathname.match(/^\/diagram\/projects\/([^/]+)$/);
    setModalId(match ? match[1] : null);
  }, [pathname]);

  return (
    <>
      <MediaDiagramMotion /> {/* 항상 유지 */}
      {children} {/* 여기에 모달이 들어옴 */}
    </>
  );
}

// 실제 모달 컴포넌트
function ProjectModal({ id }: { id: string }) {
  // 클라이언트에서 fetch, or import ProjectDetail page directly
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white p-10 rounded max-w-xl w-full relative">
        {/* Project info fetch/render */}
        <ProjectDetail id={id} />
        {/* 닫기버튼 */}
        <button
          onClick={() => window.history.back()}
          className="absolute top-4 right-4 text-black"
        >✕</button>
      </div>
    </div>
  );
}

// 예시용, 진짜로는 page.tsx나 따로 분리
function ProjectDetail({ id }: { id: string }) {
  return <div>프로젝트 {id} 상세 내용!</div>;
}
