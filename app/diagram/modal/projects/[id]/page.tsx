"use client";
import ProjectModal from "@/projects/ProjectModal";
import { useParams, useRouter } from "next/navigation";

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  if (!params?.id) return null;
  return (
    <ProjectModal
      id={typeof params.id === "string" ? params.id : params.id[0]}
      onClose={() => router.back()} // <-- router.back() 전달
    />
  );
}
