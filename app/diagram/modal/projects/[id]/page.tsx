import ProjectModal from "@/projects/ProjectModal";


export default function ProjectPage({ params }: any) {
  return <ProjectModal id={params.id} />;
}
