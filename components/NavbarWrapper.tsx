"use client";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import CVPanel from "@/components/CVPanel";
import ArchivePanel from "@/components/ArchivePanel";

export default function NavbarWrapper() {
    const [topPanel, setTopPanel] = useState<null | "cv" | "archive">(null);
    const router = useRouter();

    const pathname = usePathname();
    const goToCV = () => {
      router.push(`/cv?from=${encodeURIComponent(pathname)}`);
    };

    const showCVPanel = topPanel === "cv";
    const showArchivePanel = topPanel === "archive";
  return (
    <>
        <div className="fixed bottom-0 left-0 w-full bg-black flex justify-around py-2 z-[9999] border-t border-zinc-800 md:hidden">
          <a href="/diagram" className="text-white text-lg flex flex-col items-center">
            Works
          </a>
          <button onClick={() => setTopPanel("cv")}>CV</button>
          <button onClick={() => setTopPanel("archive")}>Archive</button>
          <a
            href="https://instagram.com/ban_jaeha"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white text-lg flex flex-col items-center"
          >
            Instagram
          </a>
        </div>

        {showCVPanel && (
        <CVPanel
          onClose={() => setTopPanel(null)}
          zIndex={topPanel === "cv" ? 51 : 50}
        />
      )}
      {showArchivePanel && (
        <ArchivePanel
          onClose={() => setTopPanel(null)}
          zIndex={topPanel === "archive" ? 51 : 50}
        />
      )}


    </>
  );
}
