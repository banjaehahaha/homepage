"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LegacyProjectRedirect() {
  const params = useParams();
  const router = useRouter();
  useEffect(() => {
    if (params?.id) {
      router.replace(`/projects/${params.id}`);
    }
  }, [params, router]);
  return null;
}
