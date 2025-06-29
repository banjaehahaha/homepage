'use client';
import React from "react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from 'next/navigation';

type ProjectData = {
  id: string;
  title_en: string;
  title_ko: string;
  year: string;
  caption: string;
  description: string;
  image: string;
};


export default function ProjectModal({ id }: { id: string }) {
  const router = useRouter();
  const innerRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<ProjectData | null>(null);

  useEffect(() => {
    fetch("/data/projects.json")
      .then(res => res.json())
      .then((list: ProjectData[]) => {
        const project = list.find((p) => p.id === id);
        setData(project || null);
      });
  }, [id]);

    // 바깥 클릭시 닫기
    useEffect(() => {
      function onClick(e: MouseEvent) {
        if (innerRef.current && !innerRef.current.contains(e.target as Node)) {
          router.back();
        }
      }
      window.addEventListener("mousedown", onClick);
      return () => window.removeEventListener("mousedown", onClick);
    }, [router]);
  
    // ESC로 닫기 (선택)
    useEffect(() => {
      function onKey(e: KeyboardEvent) {
        if (e.key === "Escape") router.back();
      }
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [router]);
  
    if (!data) return (
      <div style={{ color: "#fff", textAlign: "center", padding: 80 }}>
        <div>Loading...</div>
        {/* 프로젝트가 없으면 에러 메시지 */}
        {/* 또는 "해당 프로젝트가 존재하지 않습니다." */}
      </div>
    );

  return (
    <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.7)",
      zIndex: 50,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}
  >
    <div
      ref={innerRef}
      style={{
        background: "#222",
        borderRadius: 20,
        minWidth: "90vw",
        minHeight: "80vh",
        maxWidth: "90vw",
        maxHeight: "80vh",
        width: "70vw",
        height: "60vh",
        padding: 40,
        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        display: "flex",
        flexDirection: "row",
        gap: 32,
        position: "relative"
      }}
      onClick={e => e.stopPropagation()} // 내부 클릭 시 이벤트 버블링 방지
    >
      {/* X 버튼 */}
      <button
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          fontSize: 24,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          zIndex: 10,
          color: "#999"
        }}
        aria-label="Close"
        onClick={() => router.back()}
      >
        ×
      </button>

      {/* 좌: 텍스트, 우: 이미지 */}
      <div style={{ flex: 1, paddingRight: 24, minWidth: 0 }}>
        <h2 style={{ fontWeight: 700, fontSize: 28 }}>{data.title_en}</h2>
        <h2 style={{ fontWeight: 700, fontSize: 28 }}>{data.title_ko}</h2>
        <h2 style={{ fontWeight: 700, fontSize: 28 }}>{data.year}</h2>
        <p style={{ color: "#aaa", fontSize: 18, margin: "12px 0" }}>{data.caption}</p>
        <div style={{ fontSize: 16, margin: "20px 0" }}>{data.description}</div>
      </div>
      <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img
          src={data.image}
          alt={data.title_en}
          style={{
            maxWidth: "100%",
            maxHeight: 320,
            borderRadius: 16,
            objectFit: "cover",
            boxShadow: "0 2px 16px rgba(0,0,0,0.07)"
          }}
        />
      </div>
    </div>
  </div>
  );
}
