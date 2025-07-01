import ProjectModal from "@/projects/ProjectModal";


export default async function ProjectPage({ params }: any) {
  const resolvedParams = await params;
  return <ProjectModal id={resolvedParams.id} />;
}
