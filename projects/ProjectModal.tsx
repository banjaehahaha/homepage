'use client';
import { useRouter } from 'next/navigation';

interface ProjectModalProps {
  id: string;
}

export default function ProjectModal({ id }: ProjectModalProps) {
  const router = useRouter();

  // 임시: id로 데이터 불러오기(실제로는 fetch나 context 등으로)
  const project = {
    title: '프로젝트 제목',
    caption: '여기는 캡션',
    description: `상세 설명, id: ${id}`,
    image: `/images/${id}_full.png`,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => router.push('/diagram')}>
      <div
        className="bg-white w-full max-w-3xl h-[70vh] rounded-2xl overflow-hidden flex shadow-xl relative"
        onClick={e => e.stopPropagation()} // 바깥 눌렀을 때만 닫힘
      >
        {/* 좌측 텍스트 */}
        <div className="flex-1 p-8 flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-4">{project.title}</h2>
          <div className="text-lg mb-2 text-gray-700">{project.caption}</div>
          <div className="text-base text-gray-500 whitespace-pre-line">{project.description}</div>
        </div>
        {/* 우측 이미지 */}
        <div className="flex-1 flex items-center justify-center bg-gray-100">
          <img src={project.image} alt={project.title} className="object-contain max-h-[90%] max-w-[90%]" />
        </div>
        {/* 닫기버튼 */}
        <button
          className="absolute top-3 right-3 text-3xl text-gray-700 hover:text-black"
          onClick={() => router.push('/diagram')}
        >×</button>
      </div>
    </div>
  );
}
