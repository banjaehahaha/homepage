//"use client"; // 만약 사용 중인 Next.js가 App Router 기반이면 필요

// // app/diagram/page.tsx (Server Component)
//import DiagramPageClient from './DiagramPageClient';

//export default function Page() {
//  return <DiagramPageClient />;
//}



import MediaDiagramMotion from '../../components/MediaDiagramMotion'; 

export default function Page() {
  return (
    <main className="w-full h-screen">
      <MediaDiagramMotion />
    </main>
  );
}