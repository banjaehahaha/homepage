"use client";
import ExhibitionPanel from "@/components/ExhibitionPanel";
import { useParams, useRouter } from "next/navigation";

export default function ExhibitionPage() {
  const params = useParams();
  const router = useRouter();
  if (!params?.id) return null;
  return (
    <ExhibitionPanel
      id={params.id as string}
      onClose={() => router.back()}
    />
  );
}
