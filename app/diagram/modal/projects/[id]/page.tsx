// app/diagram/modal/projects/[id]/page.tsx

import ProjectModal from "@/projects/ProjectModal";

export default function Page({ params }: { params: { id: string } }) {
  return <ProjectModal id={params.id} />;
}
