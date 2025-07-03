'use client';
import { useRouter, useSearchParams } from "next/navigation";
import CVPanel from "@/components/CVPanel";

export default function CVPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  return (
    <CVPanel
      onClose={() => {
        if (from) router.replace(from);
        else router.back();
      }}
    />
  );
}
