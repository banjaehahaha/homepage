'use client';
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from 'next/navigation';

type ReviewPdf = {
  title: string;
  pdfUrl: string;
  author: string;
};


type ProjectData = {
  id: string;
  title_en: string;
  title_ko: string;
  year: string;
  caption: string;
  description: string;
  description_ko: string;
  description_en: string;
  images: string;
  videos?: string[];
  youtube?: string | string[];
  reviewPdfUrl?: ReviewPdf[];
  
};

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
  const router = useRouter();
  const innerRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<ProjectData | null>(null);
  const [zoomIdx, setZoomIdx] = useState<number | null>(null);
  

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
        borderRadius: 10,
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
      <div style={{ 
        flex: 1, 
        minWidth: 0,
        maxHeight: "100%",
        overflowY: "auto",
        padding: "40px 36px 40px 40px",
        whiteSpace: 'pre-line'
        }}>
        <h2 style={{ fontWeight: 700, fontSize: 28 }}>{data.title_en}</h2>
        <h2 style={{ fontWeight: 700, fontSize: 28 }}>{data.title_ko}</h2>
        <h4>{data.year}</h4>
        <p style={{ color: "#aaa", fontSize: 18, margin: "12px 0" }}>{data.caption}</p>
        <div style={{ fontSize: 16, margin: "20px 0" }}
              dangerouslySetInnerHTML={{ __html: data.description }}></div>
        <DescriptionWithReadMore
          en={data.description_en}
          ko={data.description_ko}
          maxLength={400}
        />
        {data.reviewPdfUrl && data.reviewPdfUrl.length > 0 && (
          <div style={{ marginTop: 24 }}>
            {data.reviewPdfUrl && Array.isArray(data.reviewPdfUrl) && data.reviewPdfUrl.length > 0 && (
              <div style={{ marginTop: 24 }}>
                {data.reviewPdfUrl.map((review, idx) => (
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
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(146, 249, 14, 0.13)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                >
                  {review.title}
                  {review.author && (
                    <span style={{ fontWeight: 400, fontSize: 16, marginLeft: 7 }}> / {review.author}</span>
                  )}
                  <span style={{ fontWeight: 400, fontSize: 16, marginLeft: 7 }}>→</span>
                </a>
                ))}
              </div>
            )}

          </div>
        )}
       </div>

       <div style={{
          flex: 1.5,
          minWidth: 0,
          display: "flex",
          maxHeight: "80vh", // 모달 전체와 맞춤
          overflowY: "auto", // 세로 스크롤 가능하게
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          background: "#222",
          padding: "10px",
          gap: "24px"
        }}>
          {Array.isArray(data.videos) &&
            data.videos
              .filter(v => typeof v === 'string') // 문자열만 사용!
              .map((src, idx) =>
                typeof src === 'string' && src.endsWith(".mp4") ? (
                  <video
                    key={`vid-${idx}`}
                    src={src.startsWith("/") ? src : `/videos/${src}`}
                    controls
                    style={{
                      width: "100%",
                      maxWidth: "100%",
                      borderRadius: 5,
                      background: "#111"
                    }}
                    poster={data.images?.[0] ? `/images/${data.images[0]}` : undefined}
                  >
                    <source
                      src={src.startsWith("/") ? src : `/videos/${src}`}
                      type="video/mp4"
                    />
                    Your browser does not support the video tag.
                  </video>
                ) : null
              )}

              {/* 유튜브 영상 렌더링 */}
              {data.youtube && (
                Array.isArray(data.youtube)
                  ? data.youtube.map((url, idx) => (
                      <iframe
                        key={idx}
                        src={url}
                        title={`YouTube video player ${idx + 1}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                        style={{
                          borderRadius: 10,
                          background: "#111",
                          width: "100%",
                          maxWidth: "100%",
                          aspectRatio: "16/9",   // 최신 브라우저면 이거 추천
                          margin: "0 auto 24px auto",
                          display: "block"
                        }}
                      />
                    ))
                  : (
                      <iframe
                        src={data.youtube}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                        style={{
                          borderRadius: 10,
                          background: "#111",
                          width: "100%",
                          maxWidth: "100%",
                          aspectRatio: "16/9",   // 최신 브라우저면 이거 추천
                          margin: "0 auto 24px auto",
                          display: "block"
                        }}
                      />
                    )
              )}


          {Array.isArray(data.images) && data.images.length > 0 ? (
            data.images.map((src, idx) => (
              <img
                key={idx}
                src={src.startsWith("/") ? src : `/images/${src}`}
                alt={`${data.title_en} - ${idx + 1}`}
                style={{
                  width: "100%",
                  maxWidth: "100%",
                  height: "auto",
                  borderRadius: 5,
                  objectFit: "contain",
                  background: "#111",
                  cursor: "zoom-in"
                }}
                onClick={() => setZoomIdx(idx)}
              />
            ))
          ) : (
            <img
              src={data.images ?? `/images/${data.id}_thumbnail.png`}
              alt={data.title_en}
              style={{
                width: "100%",
                maxWidth: 480,
                height: "auto",
                borderRadius: 20,
                boxShadow: "0 2px 16px #0003",
                objectFit: "contain",
                background: "#111"
              }}
            />
          )}
        </div>
        {/* 확대 모달 */}
        {zoomIdx !== null && (
              <div
                onClick={() => setZoomIdx(null)}
                style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 9999,
                  background: "rgba(0,0,0,0.88)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "zoom-out"
                }}
              >
                <img
                  src={
                    data.images && Array.isArray(data.images)
                      ? (data.images[zoomIdx].startsWith("/") ? data.images[zoomIdx] : `/images/${data.images[zoomIdx]}`)
                      : (data.images ?? `/images/${data.id}_thumbnail.png`)
                  }
                  alt={data.title_en}
                  style={{
                    maxWidth: "92vw",
                    maxHeight: "90vh",
                    borderRadius: 18,
                    objectFit: "contain",
                    background: "#111"
                  }}
                />
              </div>
            )}

    </div>
  </div>

  );
}
