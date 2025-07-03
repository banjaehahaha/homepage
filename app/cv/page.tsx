'use client';

import { useRouter } from "next/navigation";
import CVPanel from "@/components/CVPanel";

export default function CVPage() {
  const router = useRouter();
  return <CVPanel onClose={() => router.back()} />;
}
