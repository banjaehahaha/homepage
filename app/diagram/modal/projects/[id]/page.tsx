import ProjectModal from "@/projects/ProjectModal";

export default function Page({ params }: any) {
  return <ProjectModal id={params.id} />;
}