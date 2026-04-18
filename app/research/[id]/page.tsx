"use client";
import ResearchPanel from "@/components/ResearchPanel";
import { useParams, useRouter } from "next/navigation";

export default function ResearchPage() {
  const params = useParams();
  const router = useRouter();
  if (!params?.id) return null;
  return (
    <ResearchPanel
      id={params.id as string}
      onClose={() => router.back()}
    />
  );
}
