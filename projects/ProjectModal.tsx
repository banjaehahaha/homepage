'use client';
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from 'next/navigation';

interface ProjectModalProps {
  id: string;
  onClose: () => void;
  directEntry?: boolean; // optional로 두면 편함
}

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
  sounds?: string[]; 
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
  // 축약본: HTML 태그를 유지한 채로 plain text 기준 maxLength만큼 자르기
  const truncateHTML = (html: string, max: number) => {
    let count = 0;
    let result = '';
    let inTag = false;
    for (let i = 0; i < html.length; i++) {
      if (html[i] === '<') { inTag = true; result += html[i]; continue; }
      if (html[i] === '>') { inTag = false; result += html[i]; continue; }
      if (inTag) { result += html[i]; continue; }
      if (count >= max) break;
      result += html[i];
      count++;
    }
    return result + '...';
  };
  const shortHTML = truncateHTML(desc ?? '', maxLength);
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
          <div style={{ whiteSpace: 'pre-line' }} dangerouslySetInnerHTML={{ __html: shortHTML }} />
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

function MobileCollapsible({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (!isMobile) return <>{children}</>;

  return (
    <div>
      {open && children}
      <button
        onClick={() => setOpen(!open)}
        style={{
          color: "#92F90E",
          fontWeight: 600,
          fontSize: 14,
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "8px 0",
        }}
      >
        {open ? "Close ▲" : "More info ▼"}
      </button>
    </div>
  );
}

export default function ProjectModal({
  id,
  onClose,
  directEntry = false
}: ProjectModalProps) {

      console.log('ProjectModal 렌더링', id);
      
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const workRefs = useRef<Array<HTMLDivElement | null>>([]);

  const setWorkRef = (idx: number) => (el: HTMLDivElement | null) => {
    workRefs.current[idx] = el;
  };

  const titleRefs = useRef<(HTMLHeadingElement | null)[]>([]);

  const innerRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<ProjectData | WorkType | null>(null);
  const [zoomIdx, setZoomIdx] = useState<number | null>(null);
  const [zoomTarget, setZoomTarget] = useState<{workIdx: number, imgIdx: number} | null>(null);
  const [slideDir, setSlideDir] = useState<'left'|'right'|null>(null);
  const [slideKey, setSlideKey] = useState(0);
  const works: WorkType[] =
  isProjectData(data) && data.works && data.works.length > 0
    ? data.works
    : isWorkType(data)
    ? [data]
    : [];


    useEffect(() => {
      const container = contentRef.current;
      if (!container) return;
    
      const handleScroll = () => {
        const container = contentRef.current;
        if (!container) return;
        const containerRect = container.getBoundingClientRect();
        let lastVisibleIdx = 0;

        if (container.scrollTop === 0) {
          setActiveTab(0);
          return;
        }

        titleRefs.current.forEach((el, idx) => {
          if (!el) return;
          const titleRect = el.getBoundingClientRect();
          // 타이틀이 컨테이너 상단 이하(=위에 있지 않은 것)일 때만
          if (titleRect.top < containerRect.bottom) {
            lastVisibleIdx = idx;
          }
        });
        setActiveTab(lastVisibleIdx);
      };
    
      container.addEventListener("scroll", handleScroll);
      window.addEventListener("resize", handleScroll);
      handleScroll();
    
      return () => {
        container.removeEventListener("scroll", handleScroll);
        window.removeEventListener("resize", handleScroll);
      };
    }, [works.length]);
    
    


  useEffect(() => {
    fetch("/data/projects.json")
      .then(res => res.json())
      .then((list: ProjectData[]) => {
        const project = list.find((p) => p.id === id);
        setData(project || null);
      });
  }, [id]);


  const handleClose = () => {
    onClose();
  };

  useEffect(() => {
    console.log('works:', works.length, 'workRefs:', workRefs.current);
  }, [works]);

  useEffect(() => {
    if (!handleClose) return; // handleClose 없으면 아무것도 안 함
  
    function onClick(e: MouseEvent) {
      if (
        overlayRef.current &&
        contentRef.current &&
        e.target instanceof Node &&
        overlayRef.current === e.target // "검정 배경"만 클릭한 경우
      ) {
        handleClose();
      }
    }
  
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
  
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [handleClose]);
  
  
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
        maxHeight: "85vh", // 전체 제한
        minHeight: "85vh", // 최소 높이
        minWidth: "90vw",
        background: "#222",
        borderRadius: 5,
        boxShadow: "0 4px 32px #000a",
        display: "block",
        flexDirection: "column",   // 반드시 column!
        boxSizing: "border-box",
        overflowY: "auto", 
        position: "relative"
      }}
    >

      {onClose && (
        <button
          onClick={onClose}
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
      )}

    {works.map((work, idx) => (
    <React.Fragment key={idx}>
    <div
      ref={setWorkRef(idx)}
      data-idx={idx}
      className="flex flex-col md:flex-row gap-8 items-start mb-8"
      style={{       
        padding: '12px',
        boxSizing: "border-box", }}
    >
      {/* ----------- 좌: 텍스트 (sticky on desktop only) ----------- */}
      <div
        className="p-2 sm:p-2 md:p-4 lg:p-4 md:sticky md:top-0 md:self-start md:max-h-[85vh] md:overflow-y-auto"
        style={{
          flex: 1,
          minWidth: 0,
          width: "auto",
          boxSizing: "border-box",
        }}
      >
        <h2
          ref={el => { titleRefs.current[idx] = el }}
          style={{ fontWeight: 700, fontSize: 28 }}>{work.title_en || ""}</h2>
        <h2 style={{ fontWeight: 700, fontSize: 28 }}>{work.title_ko || ""}</h2>
        <h4
        style={{ color: "#aaa", fontSize: 16, margin: "12px 0" }}
          dangerouslySetInnerHTML={{ __html: work.year || ""}}></h4>
        <p
          style={{ color: "#aaa", fontSize: 18, margin: "12px 0" }}
          dangerouslySetInnerHTML={{ __html: work.caption || "" }}
          ></p>
        {/* 모바일: 상세 텍스트 접힘 */}
        <MobileCollapsible>
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
              {work.reviewPdfUrl.map((review, rIdx) => (
                <a
                  key={rIdx}
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
        </MobileCollapsible>
      </div>

      {/* ----------- 우: 이미지/영상 ----------- */}
      <div
        className="p-2 sm:p-2 md:p-4 lg:p-4"
        style={{
          flex: 1.5,
          minWidth: 0,
          width: "auto",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,

        }}
      >
          {Array.isArray(work.sounds) && work.sounds.map((src, sIdx) => (
            <audio
              key={sIdx}
              src={src.startsWith("/") ? src : `/audio/${src}`}
              controls
              style={{ width: "100%", margin: "8px 0" }}
            />
          ))}
        {Array.isArray(work.videos) && work.videos.map((src, vIdx) => {
        // Vimeo
        if (/vimeo\.com/.test(src)) {
          // Vimeo 임베드 URL로 자동 변환
          const vimeoMatch = src.match(/vimeo\.com\/(\d+)(?:\/([a-zA-Z0-9]+))?/);
          const id = vimeoMatch?.[1];
          const hash = vimeoMatch?.[2];
          const embedUrl = id
            ? `https://player.vimeo.com/video/${id}${hash ? `?h=${hash}` : ''}`
            : src;
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
                maxWidth: "100%",
                aspectRatio: "16/9",
                display: "block",
                boxSizing: "border-box",
                height: "auto",
                width: "100%",
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
                maxWidth: "100%",
                aspectRatio: "16/9",
                display: "block",
                boxSizing: "border-box",
                height: "auto",
                width: "100%",
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
                maxWidth: "100%",
                borderRadius: 5,
                background: "#111",
                boxSizing: "border-box",
                height: "auto",
                width: "100%",
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
                maxWidth: "100%",
                height: "auto",
                borderRadius: 5,
                objectFit: "contain",
                cursor: "zoom-in",
                boxSizing: "border-box",
                width: "auto", 
              }}
              onClick={() => setZoomTarget({ workIdx: idx, imgIdx: iIdx })}
            />
          ))
        ) : (
              <img
                src={work.images?.[0]}
                alt={work.title_en}
                style={{
                  maxWidth: 480,
                  height: "auto",
                  borderRadius: 5,
                  objectFit: "contain",
                  background: "#111",
                  boxSizing: "border-box",
                  width: "auto",
                }}
              />
        )}
              <button
        onClick={onClose}
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
    {idx < works.length - 1 && (
      <hr
        style={{
          border: 0,
          borderTop: "0.5px solid #555",
          margin: "32px auto", 
          width: "95%",
        }}
      />
    )}
    </React.Fragment>
    
    
  ))}

{works.length > 1 && (
           <div style={{
            display: 'flex',
            gap: 4,
            position: 'sticky',
            bottom: 0,
            background: '#222',
            zIndex: 10,
            padding: '12px 36px 12px 36px',
            whiteSpace: 'nowrap',         // 이게 제일 중요!
            width: '100%',                // 부모가 꽉 차게!
            minHeight: 56,
            boxSizing: 'border-box',
            scrollbarWidth: 'thin',       // (선택) 파이어폭스 얇은 스크롤
      }}>
        {works.map((work, idx) => (
          <button
            key={idx}
            style={{
              padding: "5px 5px 0 10px",
              borderRadius: 5,
              fontSize: 16,
              border: "none",
              cursor: "pointer",
              minWidth: 50,
              maxWidth: 200,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              background: activeTab === idx ? "#92F90E" : "#333",
              color: activeTab === idx ? "#222" : "#92F90E",
              fontWeight: activeTab === idx ? 700 : 400,
              borderBottom: activeTab === idx ? "3px solid #92F90E" : "none",
            }}
            onClick={() => {
              workRefs.current[idx]?.scrollIntoView({ behavior: "smooth", block: "start" });
              setActiveTab(idx);
            }}
            title={work.title_en}
          >
            {work.title_en || `Work ${idx + 1}`}
          </button>
        ))}
      </div>
      )}

    {/* ---- 이미지 클릭 시 확대 모달 (좌우 내비게이션) ---- */}
    {zoomTarget !== null &&
    works?.[zoomTarget.workIdx]?.images?.[zoomTarget.imgIdx] && (() => {
      const imgs = works[zoomTarget.workIdx].images!;
      const total = imgs.length;
      const goNext = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setSlideDir('left');
        setSlideKey(k => k + 1);
        setZoomTarget({ workIdx: zoomTarget.workIdx, imgIdx: (zoomTarget.imgIdx + 1) % total });
      };
      const goPrev = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setSlideDir('right');
        setSlideKey(k => k + 1);
        setZoomTarget({ workIdx: zoomTarget.workIdx, imgIdx: (zoomTarget.imgIdx - 1 + total) % total });
      };
      const curSrc = imgs[zoomTarget.imgIdx];
      const imgUrl = curSrc.startsWith("/") ? curSrc : `/images/${curSrc}`;

      return (
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
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") goNext();
          else if (e.key === "ArrowLeft") goPrev();
          else if (e.key === "Escape") setZoomTarget(null);
        }}
        tabIndex={0}
        ref={(el) => el?.focus()}
      >
        {/* 왼쪽 화살표 */}
        <button
          onClick={goPrev}
          style={{
            position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
            background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%",
            width: 48, height: 48, cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center", zIndex: 10001,
          }}
          aria-label="Previous"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 19l-7-7 7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <img
          key={slideKey}
          src={imgUrl}
          alt=""
          style={{
            maxWidth: "80vw",
            maxHeight: "90vh",
            borderRadius: 14,
            boxShadow: "0 4px 48px #000b",
            background: "#111",
            objectFit: "contain",
            animation: slideDir ? `slide-in-${slideDir} 0.3s ease` : undefined,
          }}
          onClick={e => e.stopPropagation()}
        />
        <style>{`
          @keyframes slide-in-left {
            from { opacity: 0; transform: translateX(60px); }
            to   { opacity: 1; transform: translateX(0); }
          }
          @keyframes slide-in-right {
            from { opacity: 0; transform: translateX(-60px); }
            to   { opacity: 1; transform: translateX(0); }
          }
        `}</style>

        {/* 오른쪽 화살표 */}
        <button
          onClick={goNext}
          style={{
            position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
            background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%",
            width: 48, height: 48, cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center", zIndex: 10001,
          }}
          aria-label="Next"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 5l7 7-7 7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* 이미지 카운터 */}
        <div style={{
          position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)",
          color: "#aaa", fontSize: 14,
        }}>
          {zoomTarget.imgIdx + 1} / {total}
        </div>
      </div>
      );
    })()}


</div>
</div>
  );
}
