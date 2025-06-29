import ProjectModal from "@/projects/ProjectModal";

interface PageProps {
  params: { id: string }
}

export default function Page({ params }: PageProps) {
  return <ProjectModal id={params.id} />;
}