import ProjectModal from "@/projects/ProjectModal";

export default function ProjectPage({ params }: { params: { id: string } }) {
  return <ProjectModal id={params.id} />;
}
