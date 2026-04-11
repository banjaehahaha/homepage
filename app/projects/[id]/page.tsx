"use client";
import ProjectModal from "@/projects/ProjectModal";
import { useParams, useRouter } from "next/navigation";

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  if (!params?.id) return null;
  return (
    <ProjectModal
      id={params.id as string}
      onClose={() => router.push('/diagram')}
      directEntry={true}
    />
  );
}
