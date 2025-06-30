'use client';
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from 'next/navigation';

type ReviewPdf = {
  title: string;
  pdfUrl: string;
  author: string;
};

type WorkType = {
  title_en?: string;
  title_ko?: string;
  year?: string;
  caption?: string;
  description?: string;
  description_ko?: string;
  description_en?: string;
  reviewPdfUrl?: any[];
  videos?: string[];
  youtube?: string[] | string;
  images?: string[];
};

type ProjectData = {
  id: string;
  works?: WorkType[];
  // 아래처럼, 혹시 works 없이 WorkType 필드를 바로 가질 수도 있다면
  title_en?: string;
  title_ko?: string;
  // ...etc, 나머지 WorkType 필드들 전부 옵셔널하게 복사해두기
};

function isProjectData(obj: any): obj is ProjectData {
  return obj && typeof obj === 'object' && Array.isArray(obj.works);
}
function isWorkType(obj: any): obj is WorkType {
  return obj && typeof obj === 'object' && ('title_en' in obj || 'title_ko' in obj);
}

function DescriptionWithReadMore({
  ko, en, maxLength = 160
}: {
  ko: string;
  en: string;
  maxLength?: number;
}) {
  if (!ko && !en) return null;
  const [lang, setLang] = useState<'ko' | 'en'>('en');
  const [expanded, setExpanded] = useState(false);
  const desc = lang === 'ko' ? ko : en;
  // HTML태그 제거 후 길이 판단
  const plain = desc?.replace(/<[^>]*>/g, '') ?? '';
  const isLong = plain.length > maxLength;
  const langSelector = en && ko ? (
    <div style={{ marginBottom: 10 }}>
      <button
        onClick={() => setLang('en')}
        style={{
          fontWeight: lang === 'en' ? 'bold' : 400,
          textDecoration: lang === 'en' ? 'underline' : 'none',
          marginRight: 10,
        }}
      >
        English
      </button>
      <button
        onClick={() => setLang('ko')}
        style={{
          fontWeight: lang === 'ko' ? 'bold' : 400,
          textDecoration: lang === 'ko' ? 'underline' : 'none',
        }}
      >
        한국어
      </button>
    </div>
  ) : null;
  const shortHTML = plain.slice(0, maxLength) + "...";
  return (
    <div style={{ fontSize: 16, margin: "20px 0" }}>
      <div style={{ marginBottom: 10, display: 'flex', gap: 16 }}>
        <span
          onClick={() => setLang('en')}
          style={{
            cursor: "pointer",
            textDecoration: lang === "en" ? "underline" : "none",
            fontWeight: lang === "en" ? 700 : 400,
            fontSize: 16
          }}
        >
          English
        </span>
        <span
          onClick={() => setLang('ko')}
          style={{
            cursor: "pointer",
            textDecoration: lang === "ko" ? "underline" : "none",
            fontWeight: lang === "ko" ? 700 : 400,
            fontSize: 16
          }}
        >
          한국어
        </span>
      </div>
      {!expanded && isLong ? (
        <>
          <div style={{ whiteSpace: 'pre-line' }}>{shortHTML}</div>
          <button
            onClick={() => setExpanded(true)}
            style={{
              color: "#92F90E",
              fontWeight: 600,
              fontSize: 15,
              marginTop: 4,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0
            }}
          >Read more</button>
        </>
      ) : (
        <div
          style={{ whiteSpace: 'pre-line' }}
          dangerouslySetInnerHTML={{ __html: desc }}
        />
      )}
    </div>
  );
}


export default function ProjectModal({ id }: { id: string }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const innerRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<ProjectData | WorkType | null>(null);
  const [zoomIdx, setZoomIdx] = useState<number | null>(null);
  const [zoomTarget, setZoomTarget] = useState<{workIdx: number, imgIdx: number} | null>(null);
  const works: WorkType[] =
  isProjectData(data) && data.works && data.works.length > 0
    ? data.works
    : isWorkType(data)
    ? [data]
    : [];

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
        if (
          overlayRef.current &&
          contentRef.current &&
          e.target instanceof Node &&
          overlayRef.current === e.target // "검정 배경"만 클릭한 경우
        ) {
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
      </div>
    );
  
    if (!data) return (
      <div style={{ color: "#fff", textAlign: "center", padding: 80 }}>
        <div>Loading...</div>
        {/* 프로젝트가 없으면 에러 메시지 */}
        {/* 또는 "해당 프로젝트가 존재하지 않습니다." */}
      </div>
    );

  return (
    <div
    ref={overlayRef}
    style={{
      position: "fixed",
      zIndex: 9999,
      left: 0,
      top: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(15,15,18,0.93)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <div
      ref={contentRef}
      style={{
        width: "90vw",
        maxWidth: "90vw",
        maxHeight: "80vh", // 전체 제한
        minHeight: "80vh", // 최소 높이
        minWidth: "90vw",
        background: "#222",
        borderRadius: 5,
        boxShadow: "0 4px 32px #000a",
        display: "flex",
        flexDirection: "column",   // 반드시 column!
        overflow: "auto",
        padding: "0",  // (원하는 여백 필요시 조절)
        overflowY: "hidden", 
      }}
    >
    {works.map((work, idx) => (
    <div
      key={idx}
      style={{
        display: "flex",
        flexDirection: "row", // 가로로 텍스트/이미지 배치
        gap: "32px",
        alignItems: "flex-start",
        marginBottom: "32px", // 워크들 사이 간격
        width: "100%",
      }}
    >
      {/* ----------- 좌: 텍스트 ----------- */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          minHeight: 0, // 스크롤 활성화
          maxHeight: "80vh", // 부모와 똑같이!
          overflowY: "auto",
          padding: 36,
          whiteSpace: "pre-line",
          boxSizing: "border-box",
        }}
      >
        <h2 style={{ fontWeight: 700, fontSize: 28 }}>{work.title_en || ""}</h2>
        <h2 style={{ fontWeight: 700, fontSize: 28 }}>{work.title_ko || ""}</h2>
        <h4>{work.year || ""}</h4>
        <p 
          style={{ color: "#aaa", fontSize: 18, margin: "12px 0" }}
          dangerouslySetInnerHTML={{ __html: work.caption || "" }}
          ></p>
        <div
          style={{ fontSize: 16, margin: "20px 0" }}
          dangerouslySetInnerHTML={{ __html: work.description || "" }}
        ></div>
        <DescriptionWithReadMore
          en={work.description_en || ""}
          ko={work.description_ko || ""}
          maxLength={800}
        />
        {Array.isArray(work.reviewPdfUrl) && work.reviewPdfUrl.length > 0 && (
          <div style={{ marginTop: 24 }}>
            {work.reviewPdfUrl.map((review, idx) => (
              <a
                key={idx}
                href={review.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  color: "#92F90E",
                  fontWeight: 400,
                  fontSize: 16,
                  marginBottom: 14,
                  textDecoration: "none",
                  transition: "text-decoration 0.15s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(146, 249, 14, 0.13)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {review.title}
                {review.author && (
                  <span
                    style={{
                      fontWeight: 400,
                      fontSize: 16,
                      marginLeft: 7,
                    }}
                  >
                    {" "}
                    / {review.author}
                  </span>
                )}
                <span style={{ fontWeight: 400, fontSize: 16, marginLeft: 7 }}>
                  →
                </span>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* ----------- 우: 이미지/영상 ----------- */}
      <div
        style={{
          flex: 1.5,
          minWidth: 0,
          minHeight: 0, // 스크롤 활성화
          maxHeight: "80vh", // 부모와 똑같이!
          overflowY: "auto",
          padding: 36,
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: 24,

        }}
      >
        {Array.isArray(work.videos) && work.videos.map((src, vIdx) => {
        // Vimeo
        if (/vimeo\.com/.test(src)) {
          // Vimeo 임베드 URL로 자동 변환
          const id = src.match(/vimeo\.com\/(\d+)/)?.[1];
          const embedUrl = id ? `https://player.vimeo.com/video/${id}` : src;
          return (
            <iframe
              key={`vimeo-${vIdx}`}
              src={embedUrl}
              title={`Vimeo video player ${vIdx + 1}`}
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              style={{
                borderRadius: 5,
                background: "#111",
                width: "100%",
                maxWidth: "100%",
                aspectRatio: "16/9",
                margin: "0 auto 24px auto",
                display: "block",
                boxSizing: "border-box",
              }}
            />
          );
        }
        // YouTube
        if (/youtu\.be|youtube\.com/.test(src)) {
          // YouTube 주소를 임베드로 변환 (https://youtu.be/ID → https://www.youtube.com/embed/ID)
          let videoId;
          if (src.includes("youtu.be/")) {
            videoId = src.split("youtu.be/")[1];
          } else if (src.includes("youtube.com/watch?v=")) {
            videoId = src.split("v=")[1].split("&")[0];
          }
          const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : src;
          return (
            <iframe
              key={`yt-${vIdx}`}
              src={embedUrl}
              title={`YouTube video player ${vIdx + 1}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{
                borderRadius: 5,
                background: "#111",
                width: "100%",
                maxWidth: "100%",
                aspectRatio: "16/9",
                margin: "0 auto 24px auto",
                display: "block",
                boxSizing: "border-box",
              }}
            />
          );
        }
        // MP4 등 영상 파일
        if (src.endsWith(".mp4")) {
          return (
            <video
              key={`vid-${vIdx}`}
              src={src.startsWith("/") ? src : `/videos/${src}`}
              controls
              style={{
                width: "100%",
                maxWidth: "100%",
                borderRadius: 5,
                background: "#111",
                boxSizing: "border-box",
              }}
            />
          );
        }
        return null;
      })}




        {/* 이미지 */}
        {Array.isArray(work.images) && work.images.length > 0 ? (
          work.images.map((src, iIdx) => (
            <img
              key={iIdx}
              src={src.startsWith("/") ? src : `/images/${src}`}
              alt={`${work.title_en} - ${iIdx + 1}`}
              style={{
                width: "100%",
                maxWidth: "100%",
                height: "auto",
                borderRadius: 5,
                objectFit: "contain",
                cursor: "zoom-in",
                boxSizing: "border-box", 
              }}
              onClick={() => setZoomTarget({ workIdx: idx, imgIdx: iIdx })}
            />
          ))
        ) : (
              <img
                src={work.images?.[0]}
                alt={work.title_en}
                style={{
                  width: "100%",
                  maxWidth: 480,
                  height: "auto",
                  borderRadius: 5,
                  objectFit: "contain",
                  background: "#111",
                  boxSizing: "border-box",
                }}
              />
        )}
              <button
        onClick={() => router.back()}
        style={{
          position: "fixed",
          top: 32,
          right: 52,
          fontSize: 48,
          color: "#fff",
          background: "none",
          border: "none",
          cursor: "pointer",
          zIndex: 10000,
          fontWeight: 200,
          textShadow: "0 2px 8px #000",
        }}
        aria-label="닫기"
      >×</button>
      </div>
    </div>
  ))}


    {/* ---- 이미지 클릭 시 확대 모달 ---- */}
    {zoomTarget !== null &&
    works?.[zoomTarget.workIdx]?.images?.[zoomTarget.imgIdx] && (
      <div
        style={{
          position: "fixed",
          zIndex: 10000,
          left: 0,
          top: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.85)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={() => setZoomTarget(null)}
      >
        <img
          src={
            works?.[zoomTarget.workIdx]?.images?.[zoomTarget.imgIdx]?.startsWith("/")
              ? works?.[zoomTarget.workIdx]?.images?.[zoomTarget.imgIdx]
              : `/images/${works?.[zoomTarget.workIdx]?.images?.[zoomTarget.imgIdx]}`
          }
          alt=""
          style={{
            maxWidth: "90vw",
            maxHeight: "90vh",
            borderRadius: 14,
            boxShadow: "0 4px 48px #000b",
            background: "#111",
            objectFit: "contain",
          }}
          //onClick={e => e.stopPropagation()}
        />
      </div>
  )}


</div>
</div>
  );
}
