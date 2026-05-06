'use client';

import Link from 'next/link' 
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import ArchivePanel from "@/components/ArchivePanel";
import CVPanel from "@/components/CVPanel";
import ResearchPanel from "@/components/ResearchPanel";
import ExhibitionPanel from "@/components/ExhibitionPanel";
import { AnimatePresence } from "framer-motion";

type DiagramView = 'media' | 'research' | 'exhibition';

type NodeType = {
  id: string;
  label: string;
};

function NodeImage({ node }: { node: NodeType }) {
  const [srcIdx, setSrcIdx] = useState(0);
  const candidates = [
    `/images/${node.id}_1.jpg`,
    `/images/${node.id}_1.png`,
    `/images/${node.id}.jpg`,
    `/images/${node.id}.png`,
  ];

  return (
    <img
      src={candidates[srcIdx]}
      alt={node.label}
      className="w-full aspect-square object-cover"
      onError={() => {
        if (srcIdx < candidates.length - 1) setSrcIdx(srcIdx + 1);
      }}
    />
  );
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    const handler = () => setMatches(media.matches);
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [query]);
  return matches;
}

function DiagramNode({
  node,
  dims,
  hovered,
  connected,
  isVisible,
  isYearGrid,
  isGridAnimating,
  zIndexMap,
  wrapperRefs,
  imageRefs,
  setHovered,
  onPointerDown,
  THUMB_H,
  TITLE_GAP,
  TITLE_EXTRA_W,
  leftMargin,
}: {
  node: any;
  dims: { width: number; height: number };
  hovered: string | null;
  connected: Set<string>;
  isVisible: (n: any) => boolean;
  isYearGrid: boolean;
  isGridAnimating: boolean;
  zIndexMap: Record<string, number>;
  wrapperRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  imageRefs: React.MutableRefObject<Record<string, HTMLImageElement | null>>;
  setHovered: (id: string | null) => void;
  onPointerDown: (e: React.PointerEvent, node: any) => void;
  THUMB_H: number;
  TITLE_GAP: number;
  TITLE_EXTRA_W: number;
  leftMargin: number;
}) {
  const cx = leftMargin + node.px * (dims.width - leftMargin);
  const cy = node.py * dims.height;
  const isOn = !hovered || connected.has(node.id);
  const visible = isVisible(node);

  // =============== UPCOMING 노드 ===============
  if (node.type === 'upcoming') {
    return (
      <motion.div
        key={node.id}
        ref={el => { wrapperRefs.current[node.id] = el; }}
        onPointerDown={e => onPointerDown(e, node)}
        onMouseEnter={() => setHovered(node.id)}
        onMouseLeave={() => setHovered(null)}
        className="absolute z-10 cursor-grab"
        animate={{ rotate: [0, 360] }}
        transition={{
          repeat: Infinity,
          duration: 4,
          ease: 'linear',
        }}
        style={{
          position: 'absolute',
          left: cx,
          top: cy,
          transform: 'translate(-50%, -50%)',
          zIndex: zIndexMap[node.id] || 0,
          cursor: 'grab',
        }}
      >
        <div className="bg-yellow-400 text-black px-3 py-1 rounded shadow">
          {node.label}
        </div>
      </motion.div>
    );
  }

  // =============== PROJECT 노드 ===============
  if (node.type === 'project' && visible) {
    let imgH = THUMB_H;
    const imgEl = imageRefs.current[node.id];
    if (imgEl) imgH = imgEl.getBoundingClientRect().height;
    const z = zIndexMap[node.id] ?? 0;

    return (
      <React.Fragment key={node.id}>
        <div
          ref={el => { wrapperRefs.current[node.id] = el; }}
          onPointerDown={e => onPointerDown(e, node)}
          onMouseEnter={() => setHovered(node.id)}
          onMouseLeave={() => setHovered(null)}
          className="absolute z-10 cursor-grab"
          style={{
            left: cx, top: cy,
            transform: 'translate(-50%,-50%)',
            cursor: 'grab',
            opacity: isOn ? 1 : 0.2,
            filter: isOn ? 'none' : 'blur(1px)',
            transition: isGridAnimating
              ? 'opacity 0.3s ease, filter 0.3s ease, left 1s ease, top 1s ease'
              : 'opacity 0.3s ease, filter 0.3s ease',
            width: THUMB_H,
            height: THUMB_H,
            userSelect: 'none',
            zIndex: z,
          }}
        >
          {/* 썸네일 이미지 */}
          <div className="flex items-center pointer-events-none">
            <img
              ref={el => { imageRefs.current[node.id] = el; }}
              src={`/images/${node.id}_thumbnail.png`}
              alt={node.label}
              width={THUMB_H} height={THUMB_H}
              draggable={false}
              className="mx-[-8px] object-contain"
            />
          </div>
          {/* 제목 */}
          <div
            className="absolute text-sm font-light text-center pointer-events-none text-white"
            style={{
              left: '50%', top: imgH + TITLE_GAP,
              transform: 'translateX(-50%)',
              width: THUMB_H + TITLE_EXTRA_W,
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              zIndex: z,
              opacity: isOn ? 1 : 0.2,
              filter: isOn ? 'none' : 'blur(1px)',
              userSelect: 'none',
            }}
          >
            {node.label}
          </div>
        </div>
        {/* 연도 툴팁 */}
        {isYearGrid && hovered === node.id && (
          <div
            className="absolute text-xs bg-black bg-opacity-75 text-white px-2 py-1 pointer-events-none"
            style={{
              left: cx,
              top: cy - imgH / 2 - 8,
              transform: 'translateX(-50%)',
              whiteSpace: 'nowrap',
            }}
          >
            {[...node.years].sort((a, b) => a - b).join(', ')}
          </div>
        )}
      </React.Fragment>
    );
  }

  // =============== MEDIA 노드 ===============
  if (node.type === 'media' && visible) {
    const z = zIndexMap[node.id] ?? 0;
    return (
      <motion.div
        key={node.id}
        ref={el => { wrapperRefs.current[node.id] = el; }}
        onPointerDown={e => onPointerDown(e, node)}
        onMouseEnter={() => setHovered(node.id)}
        onMouseLeave={() => setHovered(null)}
        className="absolute z-10"
        initial={{ opacity: 0 }}
        animate={{
          opacity: isOn ? 1 : 0.2,
          filter: isOn ? 'none' : 'blur(1px)',
        }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          left: cx, top: cy,
          transform: 'translate(-50%,-50%)',
          cursor: 'grab',
          userSelect: 'none',
          zIndex: z,
        }}
      >
        <div className="bg-[#92F90E]/50 text-white px-2 py-1 shadow-lg text-xl select-none">
          [{node.label}]
        </div>
      </motion.div>
    );
  }

  // =============== RESEARCH 노드 ===============
  if (node.type === 'research' && visible) {
    const z = zIndexMap[node.id] ?? 0;
    return (
      <motion.div
        key={node.id}
        ref={el => { wrapperRefs.current[node.id] = el; }}
        onPointerDown={e => onPointerDown(e, node)}
        onMouseEnter={() => setHovered(node.id)}
        onMouseLeave={() => setHovered(null)}
        className="absolute z-10"
        initial={{ opacity: 0 }}
        animate={{
          opacity: isOn ? 1 : 0.2,
          filter: isOn ? 'none' : 'blur(1px)',
        }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          left: cx, top: cy,
          transform: 'translate(-50%,-50%)',
          cursor: 'pointer',
          userSelect: 'none',
          zIndex: z,
        }}
      >
        <div className="bg-[#67C8FF]/50 text-white px-2 py-1 shadow-lg text-xl select-none">
          [{node.label}]
        </div>
      </motion.div>
    );
  }

  // =============== EXHIBITION 노드 ===============
  if (node.type === 'exhibition' && visible) {
    const z = zIndexMap[node.id] ?? 0;
    return (
      <motion.div
        key={node.id}
        ref={el => { wrapperRefs.current[node.id] = el; }}
        onPointerDown={e => onPointerDown(e, node)}
        onMouseEnter={() => setHovered(node.id)}
        onMouseLeave={() => setHovered(null)}
        className="absolute z-10"
        initial={{ opacity: 0 }}
        animate={{
          opacity: isOn ? 1 : 0.2,
          filter: isOn ? 'none' : 'blur(1px)',
        }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          left: cx, top: cy,
          transform: 'translate(-50%,-50%)',
          cursor: 'pointer',
          userSelect: 'none',
          zIndex: z,
        }}
      >
        <div className="bg-[#C084FC]/50 text-white px-2 py-1 shadow-lg text-xl select-none">
          [{node.label}]
        </div>
      </motion.div>
    );
  }

  // 기본 fallback
  return null;
}



interface Node {
  id: string;
  type: 'media' | 'project'| 'upcoming' | 'research' | 'exhibition';
  label: string;
  px: number; py: number;
  years: number[];
  keywords: string[];
  media?: string[];
  order?: number;
}
interface Link { source: string; target: string; }

const BASE_THUMB_H = 134;
const BASE_TITLE_GAP = 7;
const BASE_TITLE_EXTRA_W = 96;


export default function MediaDiagram() {
  const router = useRouter();
  const pathname = usePathname();

  const [showArchive, setShowArchive] = useState(false);
  const [showCV, setShowCV] = useState(false);
  const [showResearch, setShowResearch] = useState<string | null>(null);
  const [showExhibition, setShowExhibition] = useState<string | null>(null);

  const [activeView, setActiveView] = useState<DiagramView>('media');

  const [nodes, setNodes] = useState<Node[]>([]);
  const [mediaLinks, setMediaLinks] = useState<Link[]>([]);
  const [researchLinks, setResearchLinks] = useState<Link[]>([]);
  const [exhibitionLinks, setExhibitionLinks] = useState<Link[]>([]);

  const activeLinks = useMemo(() => {
    switch (activeView) {
      case 'media': return mediaLinks;
      case 'research': return researchLinks;
      case 'exhibition': return exhibitionLinks;
    }
  }, [activeView, mediaLinks, researchLinks, exhibitionLinks]);

  const [modalNode, setModalNode] = useState<string|null>(null)

  const [dims, setDims] = useState({ width: 0, height: 0 });

  const scale = useMemo(() => Math.max(0.6, Math.min(1, dims.width / 1440)), [dims.width]);
  const THUMB_H = useMemo(() => Math.round(BASE_THUMB_H * scale), [scale]);
  const TITLE_GAP = useMemo(() => Math.round(BASE_TITLE_GAP * scale), [scale]);
  const TITLE_EXTRA_W = useMemo(() => Math.round(BASE_TITLE_EXTRA_W * scale), [scale]);

  const [hovered, setHovered] = useState<string | null>(null);
  const [maxZ, setMaxZ] = useState(1);
  const [zIndexMap, setZIndexMap] = useState<Record<string, number>>({});

  const initialPositions = useRef<Record<string,{px:number,py:number}>>({});

  const resetToDefault = () => {
    setNodes(old =>
      old.map(n => {
        if (n.type === 'project') {
          const orig = initialPositions.current[n.id];
          return orig ? { ...n, px: orig.px, py: orig.py } : n;
        }
        // media와 upcoming은 현재 위치 그대로 유지
        return n;
      })
    );
  };

  const [isGridAnimating, setIsGridAnimating] = useState(false);
  const [isYearGrid, setIsYearGrid] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef     = useRef<HTMLDivElement>(null);
  const [leftMargin, setLeftMargin] = useState(0);
  const dragState    = useRef<{ id:string; offsetX:number; offsetY:number; moved: boolean; }|null>(null);
  const wrapperRefs  = useRef<Record<string,HTMLDivElement|null>>({});
  const imageRefs    = useRef<Record<string,HTMLImageElement|null>>({});
  const allKeywords = useMemo(() => {
    const s = new Set<string>();
    nodes.forEach(n => n.keywords?.forEach(k => s.add(k)));
    return Array.from(s).sort();
  }, [nodes]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const isVisible = (n: Node) => {
    // project + upcoming 노드: 키워드 필터 적용 (모든 뷰에서 동일)
    if (n.type === 'project' || n.type === 'upcoming') {
      if (selected.size === 0) return true;
      return Array.from(selected).every(k => n.keywords?.includes(k));
    }
    // 주변 노드: 해당 뷰에서만 표시
    const peripheralMap: Record<DiagramView, string> = {
      media: 'media', research: 'research', exhibition: 'exhibition',
    };
    return n.type === peripheralMap[activeView];
  };
  

        // 1) year(가장 이른 연도) 뽑고 sort
    const sortedByYear = useMemo(() => {
        return nodes
        .filter(n => n.type === 'project')
        .map(n => ({ ...n, year: Math.max(...n.years) }))
        .sort((a, b) => b.year - a.year || (b.order ?? 0) - (a.order ?? 0));
    }, [nodes]);
    
    // 2) 그리드 크기 (행/열) 결정
    const N = sortedByYear.length;
    const cols = Math.ceil(Math.sqrt(N));
    const rows = Math.ceil(N / cols);
    
    // 3) 마진 설정 
    const M = 0.15;           
    const usableW = 1 - 2*M; 
    const usableH = 1 - 2*M; 
    
    // 4) 각 노드에 (px,py) 계산
    const gridPositions = useMemo(() => {
        return sortedByYear.map((n, i) => {
          const row = Math.floor(i / cols);
          const col = i % cols;
      
          const cellW = usableW / cols;
      
          // 1) 기본 높이
          const baseCellH = usableH / rows;
          // 2) 늘리고 싶은 배율
          const FACTOR = 1.2;
          const cellH = baseCellH * FACTOR;
      
          // 3) 늘어난 전체 높이를 usableH 안에 가운데 정렬하기 위한 offsetY
          //    (usableH - (cellH*rows)) / 2 만큼 위로 올려줍니다.
          const extraTotal = cellH * rows - usableH;
          const offsetY = M - extraTotal / 2;
      
          // 4) 실제 px, py 계산 (정규화된 0~1 좌표)
          const px = M + (col + 0.5) * cellW;
          const py = offsetY + (row + 0.5) * cellH;
      
          return { id: n.id, px, py };
        });
      }, [sortedByYear, cols, rows]);

      const applyYearGrid = () => {
        setIsGridAnimating(true);
        setNodes(old =>
          old.map(n => {
            // media 타입은 그대로 리턴
            if (n.type !== 'project') {return n;}
      
            // project 타입만 gridPositions에서 찾아서 px/py 덮어쓰기
            const pos = gridPositions.find(p => p.id === n.id);
            if (!pos) return n;
            return { ...n, px: pos.px, py: pos.py };
          })
        );
        setTimeout(() => setIsGridAnimating(false), 1000);
      };
      
      useEffect(() => {
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";
        const nextEl = document.getElementById("__next");
        if (nextEl) nextEl.style.overflow = "hidden";
        return () => {
          document.body.style.overflow = "";
          document.documentElement.style.overflow = "";
          if (nextEl) nextEl.style.overflow = "";
        };
      }, []);

  
  // 컨테이너 & 패널 측정
  useEffect(() => {
    const upd = () => {
      if (!containerRef.current) return;
      setDims({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      });
      if (panelRef.current) {
        setLeftMargin(panelRef.current.offsetWidth + 24);
      }
    };
    upd(); window.addEventListener('resize',upd);
    return ()=>window.removeEventListener('resize',upd);
  }, []);

  // 데이터 로드
  useEffect(() => {
    Promise.all([
        fetch('/data/Nodes.json').then(r=>r.json()),
        fetch('/data/links.json').then(r=>r.json()),
        fetch('/data/researchLinks.json').then(r=>r.json()),
        fetch('/data/exhibitionLinks.json').then(r=>r.json()),
        fetch('/data/projects.json').then(r => r.json()),
      ]).then(([N, ML, RL, EL, P]) => {
        setMediaLinks(ML);
        setResearchLinks(RL);
        setExhibitionLinks(EL);

            // id로 매핑
          const projectMediaMap: Record<string, string[]> = {};
          P.forEach((proj: any) => { projectMediaMap[proj.id] = proj.media; });

          // 각 project 노드에 media 필드 추가
          const mergedNodes = N.map((n: any) =>
            n.type === 'project'
              ? { ...n, media: projectMediaMap[n.id] || [] }
              : n
          );
          setNodes(mergedNodes);

        const map: Record<string,{px:number,py:number}> = {};
        (N as any[]).forEach(n => {
          map[n.id] = { px: n.px, py: n.py };
        });
        initialPositions.current = map;
      });
    },[]);

  // hover 강조용 셋
  const connected = useMemo(() => {
    const s = new Set<string>();
    if (hovered) {
      s.add(hovered);
      activeLinks.forEach(l=>{
        if(l.source===hovered) s.add(l.target);
        if(l.target===hovered) s.add(l.source);
      });
    }
    return s;
  },[hovered,activeLinks]);

  // 드래그 핸들러
  
  const onMove = (e: PointerEvent) => {
    if (!dragState.current || !containerRef.current) return;
    if (!dragState.current.moved) {
      const { id } = dragState.current;
      const node = nodes.find(n => n.id === id);
      const rect = containerRef.current.getBoundingClientRect();
      const startX = leftMargin + node!.px * (dims.width - leftMargin) + rect.left;
      const startY = node!.py * dims.height + rect.top;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        dragState.current.moved = true;
      }
    }
    const { id, offsetX, offsetY } = dragState.current;
    const r = containerRef.current.getBoundingClientRect();
    const newCx = e.clientX - r.left - offsetX;
    const newCy = e.clientY - r.top - offsetY;
    const usableW = dims.width - leftMargin;
    setNodes(ns =>
      ns.map(n =>
        n.id === id
          ? { ...n, px: (newCx - leftMargin) / usableW, py: newCy / dims.height }
          : n
      )
    );
  };

  const onPointerUpWrapper = (e: PointerEvent) => {
    if (dragState.current && dragState.current.moved === false) {
      const node = nodes.find(n => n.id === dragState.current!.id);
      if (!node) return;
      if (node.type === 'project') {
        router.push(`/projects/${node.id}`);
      } else if (node.type === 'upcoming') {
        setModalNode(node.id);
      } else if (node.type === 'research') {
        setShowResearch(node.id);
      } else if (node.type === 'exhibition') {
        setShowExhibition(node.id);
      }
      // (media 타입은 클릭 동작 없음)
    }
    onUp();
  };

  const onUp = () => {
    dragState.current = null;
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onPointerUpWrapper);
  };

  const onPointerDown = (e: React.PointerEvent, node: Node) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    setZIndexMap(prev => {
        const nextZ = maxZ + 1;
        setMaxZ(nextZ);
        return { ...prev, [node.id]: nextZ };
      });
      
      const rect = containerRef.current!.getBoundingClientRect();
      const cx = leftMargin + node.px * (dims.width - leftMargin);
      const cy = node.py * dims.height;
      dragState.current = {
        id: node.id,
        offsetX: e.clientX - rect.left - cx,
        offsetY: e.clientY - rect.top  - cy,
        moved: false,

    };
    window.addEventListener('pointermove',onMove);
    window.addEventListener('pointerup', onPointerUpWrapper);
  };

  const toggleYearGrid = () => {
    // 애니메이션 플래그 켜고
    setIsGridAnimating(true);
  
    if (isYearGrid) {
      // 꺼질 때: 원래 위치로 복원
      resetToDefault();
    } else {
      // 켜질 때: 연도별 그리드 배치
      applyYearGrid();
    }
  
    // 1초 뒤 애니메이션 플래그 끄기
    setTimeout(() => setIsGridAnimating(false), 1000);
  
    // 상태 토글
    setIsYearGrid(prev => !prev);
  };

  const switchView = (view: DiagramView) => {
    if (view === activeView) return;
    // year grid 리셋
    if (isYearGrid) {
      setIsGridAnimating(true);
      resetToDefault();
      setTimeout(() => setIsGridAnimating(false), 1000);
      setIsYearGrid(false);
    }
    setActiveView(view);
  };

const isMobile = useMediaQuery("(max-width: 768px)");

useEffect(() => {
  if (isMobile) return;
  document.body.style.overflow = "hidden";
  document.documentElement.style.overflow = "hidden";
  const nextEl = document.getElementById("__next");
  if (nextEl) nextEl.style.overflow = "hidden";
  return () => {
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
    if (nextEl) nextEl.style.overflow = "";
  };
}, [isMobile]);

if (isMobile) {
  return <MobilePortfolio nodes={nodes} links={activeLinks} activeView={activeView} switchView={switchView} />;
}

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{
        backgroundColor: '#333333',
        backgroundImage: "url('/images/diagram_grid.png')",
        backgroundSize:'cover', backgroundPosition:'center', backgroundRepeat:'no-repeat',
        overflow: 'hidden',
        height: '100vh',
      }}
    >
          {/* ─── 필터+CV outer wrapper ─────────────────────────── */}
    <div ref={panelRef} className="absolute top-4 left-4">
      {/* ─── 실제 필터 박스 ─────────────────────────── */}
      <div className="bg-black/50 p-3 rounded text-white space-y-3 w-max">
        {/* ─── 뷰 전환 버튼 ─────────────────────────── */}
        <div className="flex gap-1 mb-3">
          {(['media'] as DiagramView[]).map(v => (
            <button
              key={v}
              onClick={() => switchView(v)}
              className={`px-2 py-1 text-sm rounded transition-colors ${
                activeView === v
                  ? v === 'research' ? 'bg-[#67C8FF] text-black font-bold'
                  : v === 'exhibition' ? 'bg-[#C084FC] text-black font-bold'
                  : 'bg-[#92F90E] text-black font-bold'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
              style={{ cursor: 'pointer' }}
            >
              {v === 'media' ? 'Media' : v === 'research' ? 'Research' : 'Exhibition'}
            </button>
          ))}
        </div>

        {/* ─── 키워드 필터 ─────────── */}
        <h4 className="mb-2 font-semibold">Keywords</h4>
        {allKeywords.map(k => (
          <label key={k} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selected.has(k)}
              onChange={() => {
                const nxt = new Set(selected);
                selected.has(k) ? nxt.delete(k) : nxt.add(k);
                setSelected(nxt);
              }}
              className="h-5 w-5 accent-[#92F90E] focus:ring-0"
            />
            <span>{k}</span>
          </label>
        ))}
            <div className="pt-2 border-t border-white/20 w-max">
              <span className="text-sm font-medium whitespace-nowrap">
              Sort by Newest
              </span>
            </div>
            <div className="flex items-center pt-1">
            {/* ─── 슬라이드 토글 ─────────────────────────── */}
            <label className="inline-flex items-center cursor-pointer space-x-2">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={isYearGrid}
                  onChange={toggleYearGrid}
                />
                <div
                  className="
                  w-12 h-6 rounded-full
                  bg-gray-500 peer-checked:bg-[#92F90E]
                  relative transition-colors
                  "
                >
                  <span
                    className={`
                    absolute top-0.5 left-0.5
                    w-5 h-5 rounded-full bg-white
                    transform transition-transform
                    ${isYearGrid ? 'translate-x-6' : ''}
                  `}
                  />
                </div>
              </label>
            </div>
            </div>

            <div className="mt-6 ml-4 flex flex-col items-left space-y-4">

            <span
              className="text-white text-2xl font-bold hover:underline cursor-pointer"
              onClick={() => setShowCV(true)}
            >
              CV →
            </span>
            <AnimatePresence>
            {showCV && <CVPanel onClose={() => setShowCV(false)} />}
            </AnimatePresence>

            <span
              className="text-white text-2xl font-bold hover:underline cursor-pointer"
              onClick={() => setShowArchive(true)}
            >
              Archive →
            </span>
            <AnimatePresence>
            {showArchive && (
              <ArchivePanel onClose={() => setShowArchive(false)} />
            )}
            </AnimatePresence>

            <a
            href="http://instagram.com/ban_jaeha/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white text-2xl font-bold hover:underline"
          >
            Instagram →
          </a>
            </div>



        </div>

      {/* SVG 링크 */}
      <svg className="absolute inset-0 pointer-events-none"
           viewBox={`0 0 ${dims.width} ${dims.height}`}>
        {activeLinks.map((l,i)=>{
          const aEl = imageRefs.current[l.source];
          const bEl = imageRefs.current[l.target];
          const srcNode = nodes.find(n => n.id === l.source)!;
          const tgtNode = nodes.find(n => n.id === l.target)!;
          if (!isVisible(srcNode) || !isVisible(tgtNode)) {
            return null;
          }
          let x1,y1,x2,y2;
          if(aEl&&bEl&&containerRef.current){
            const crect = containerRef.current.getBoundingClientRect();
            const ar = aEl.getBoundingClientRect();
            const br = bEl.getBoundingClientRect();
            x1 = ar.left - crect.left + ar.width/2;
            y1 = ar.top  - crect.top  + ar.height/2;
            x2 = br.left - crect.left + br.width/2;
            y2 = br.top  - crect.top  + br.height/2;
          } else {
            const A = nodes.find(n=>n.id===l.source)!;
            const B = nodes.find(n=>n.id===l.target)!;
            x1=leftMargin+A.px*(dims.width-leftMargin); y1=A.py*dims.height;
            x2=leftMargin+B.px*(dims.width-leftMargin); y2=B.py*dims.height;
          }
          const hilite = hovered===l.source||hovered===l.target;
          return (
                <motion.line
                key={i}
                // animate props 에 새 좌표를 넘겨주면 Framer가 부드럽게 트윈합니다
                animate={{
                    x1, y1, x2, y2,
                    opacity: hovered ? (hilite ? 1 : 0.2) : 1,
                }}
                transition={{
                    duration: isGridAnimating ? 1 : 0,
                    ease: isGridAnimating ? 'easeOut' : 'linear',
                  }}
                stroke={hilite
                  ? (activeView === 'research' ? '#67C8FF' : activeView === 'exhibition' ? '#C084FC' : '#92F90E')
                  : '#888888'}
                strokeWidth={1}
                strokeDasharray={hilite ? '' : '4 2'}
                />

          );
        })}
      </svg>

      {/* 노드 렌더 */}
      {nodes.map(node => (
        <DiagramNode
          key={node.id}
          node={node}
          dims={dims}
          hovered={hovered}
          connected={connected}
          isVisible={isVisible}
          isYearGrid={isYearGrid}
          isGridAnimating={isGridAnimating}
          zIndexMap={zIndexMap}
          wrapperRefs={wrapperRefs}
          imageRefs={imageRefs}
          setHovered={setHovered}
          onPointerDown={onPointerDown}
          THUMB_H={THUMB_H}
          TITLE_GAP={TITLE_GAP}
          TITLE_EXTRA_W={TITLE_EXTRA_W}
          leftMargin={leftMargin}
        />
      ))}


      {/* 모달 렌더링 */}
      {modalNode === 'upcoming-event' && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setModalNode(null)}
        >
        <div
          className="bg-neutral-800 text-white p-8 rounded-lg shadow-xl relative"
          style={{
            minWidth: "540px",
            minHeight: "50vh",
            maxWidth: "540px",
            maxHeight: "70vh",
            margin: "0 24px",
            overflowY: "auto",
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* x버튼 */}
          <button
            onClick={() => setModalNode(null)}
            aria-label="Close"
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              width: 32,
              height: 32,
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24">
              <line x1="6" y1="6" x2="18" y2="18" stroke="#fff" strokeWidth="2"/>
              <line x1="18" y1="6" x2="6" y2="18" stroke="#fff" strokeWidth="2"/>
            </svg>
          </button>

          {/* --- 모달 내용 --- */}
          <h2 className="text-2xl font-bold mb-6">Upcoming</h2>
          <div className="mb-4">
            <h2 style={{ background: "#92F90E", color: "#222", display: "inline-block", padding: "2px 6px" }}><b><i>Calculated Malfunction (working title)</i></b></h2><br />
            <h2 style={{ background: "#92F90E", color: "#222", display: "inline-block", padding: "2px 6px", marginTop: "4px" }}><b>계산된 오작동 (가제)</b></h2>
            <p className="text-gray-400 text-sm mt-4">Solo Exhibition</p>
            <p className="mt-2">2026.6.19. — 7.12.</p>
            <p className="text-gray-300 mt-1">Studio White, NC Cultural Foundation 2F</p>
            <p className="text-gray-500 text-sm mt-1">100 Ihwajang-gil, Jongno-gu, Seoul</p>
            <p className="text-gray-300 text-sm mt-4 leading-relaxed">An exhibition exploring how images, goods, and information surrounding North Korea are produced and transformed within the structures of division and distribution.</p>
            <p className="text-gray-400 text-sm mt-3">Supported by Seoul Museum of Art (SeMA)</p>
            <hr className="border-gray-600 my-4" />
            <p className="text-gray-300 mt-1">스튜디오 화이트, NC문화재단 2층</p>
            <p className="text-gray-500 text-sm mt-1">서울시 종로구 이화장길 100</p>
            <p className="text-gray-300 text-sm mt-4 leading-relaxed">분단과 유통의 구조 속에서 북한을 둘러싼 이미지, 물건, 정보가 어떻게 생성되고 변형되는지를 다루는 전시.</p>
            <p className="text-gray-400 text-sm mt-3">서울시립미술관 신진미술인 전시지원 프로그램</p>
          </div>
        </div>

        </div>
      )}

      {/* Research 패널 */}
      <AnimatePresence>
        {showResearch && (
          <ResearchPanel
            id={showResearch}
            onClose={() => setShowResearch(null)}
          />
        )}
      </AnimatePresence>

      {/* Exhibition 패널 */}
      <AnimatePresence>
        {showExhibition && (
          <ExhibitionPanel
            id={showExhibition}
            onClose={() => setShowExhibition(null)}
          />
        )}
      </AnimatePresence>

    </div>
  );
}


function MobilePortfolio({ nodes, links, activeView, switchView }: { nodes: Node[]; links: Link[]; activeView: DiagramView; switchView: (v: DiagramView) => void }) {
  const [activeKeyword, setActiveKeyword] = useState<string | null>(null);
  const [jumpIndex, setJumpIndex] = useState(0);
  const [pulsedId, setPulsedId] = useState<string | null>(null);
  const [activeYear, setActiveYear] = useState<number | null>(null);
  const [showYearBar, setShowYearBar] = useState(true);

  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const yearRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const yearPillRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const lastScrollY = useRef(0);

  // project 노드만 최신연도 기준 내림차순
  const projectNodes = useMemo(
    () =>
      nodes
        .filter(n => n.type === 'project')
        .sort((a, b) => Math.max(...b.years) - Math.max(...a.years)),
    [nodes],
  );

  // 전체 키워드
  const allKeywords = useMemo(() => {
    const s = new Set<string>();
    projectNodes.forEach(n => n.keywords?.forEach(k => s.add(k)));
    return Array.from(s).sort();
  }, [projectNodes]);

  // 연도별 그룹
  const yearGroups = useMemo(() => {
    const groups: Record<number, Node[]> = {};
    projectNodes.forEach(n => {
      const year = Math.max(...n.years);
      if (!groups[year]) groups[year] = [];
      groups[year].push(n);
    });
    return Object.entries(groups)
      .sort(([a], [b]) => Number(b) - Number(a))
      .map(([year, items]) => ({ year: Number(year), items }));
  }, [projectNodes]);

  // links → 라벨 매핑 (뷰별)
  const nodeMediaLabels = useMemo(() => {
    const peripheralTypes = ['media', 'research', 'exhibition'];
    const labelMap: Record<string, string> = {};
    nodes.filter(n => peripheralTypes.includes(n.type)).forEach(n => { labelMap[n.id] = n.label; });
    const result: Record<string, string[]> = {};
    links.forEach(l => {
      if (!result[l.source]) result[l.source] = [];
      if (labelMap[l.target]) result[l.source].push(labelMap[l.target]);
    });
    return result;
  }, [nodes, links]);

  // 활성 키워드에 매칭되는 노드 id 셋
  const matchedIds = useMemo(() => {
    if (!activeKeyword) return new Set(projectNodes.map(n => n.id));
    return new Set(
      projectNodes.filter(n => n.keywords?.includes(activeKeyword)).map(n => n.id),
    );
  }, [projectNodes, activeKeyword]);

  // 점프 내비게이션용 매칭 노드 배열
  const matchedNodes = useMemo(() => {
    if (!activeKeyword) return [];
    return projectNodes.filter(n => n.keywords?.includes(activeKeyword));
  }, [projectNodes, activeKeyword]);

  // 1. 스크롤 연동 연도 표시 (IntersectionObserver)
  useEffect(() => {
    if (yearGroups.length === 0) return;
    const observers: IntersectionObserver[] = [];
    yearGroups.forEach(({ year }) => {
      const el = yearRefs.current[year];
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveYear(year); },
        { threshold: 0, rootMargin: '-10% 0px -80% 0px' },
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, [yearGroups]);

  // 활성 연도 pill 자동 스크롤
  useEffect(() => {
    if (activeYear === null) return;
    yearPillRefs.current[activeYear]?.scrollIntoView({
      behavior: 'smooth', inline: 'center', block: 'nearest',
    });
  }, [activeYear]);

  // 2. 스크롤 방향에 따라 연도 바 숨기기/보이기
  useEffect(() => {
    const handleScroll = () => {
      const currentY = document.body.scrollTop || document.documentElement.scrollTop;
      setShowYearBar(currentY < 80 || currentY < lastScrollY.current);
      lastScrollY.current = currentY;
    };
    document.body.addEventListener('scroll', handleScroll, { passive: true });
    return () => document.body.removeEventListener('scroll', handleScroll);
  }, []);

  // 3. 점프 시 pulse 효과
  const pulseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerPulse = (nodeId: string) => {
    // 이전 pulse 타이머 취소 후 리셋 → 새 pulse 보장
    if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
    setPulsedId(null);
    requestAnimationFrame(() => {
      setPulsedId(nodeId);
      pulseTimerRef.current = setTimeout(() => setPulsedId(null), 900);
    });
  };

  // --- 커스텀 smooth scroll (브라우저 smooth scroll 대신 직접 제어) ---
  const scrollAnimRef = useRef<number | null>(null);

  const getAbsoluteTop = (el: HTMLElement): number => {
    let top = 0;
    let current: HTMLElement | null = el;
    while (current && current !== document.body) {
      top += current.offsetTop;
      current = current.offsetParent as HTMLElement | null;
    }
    return top;
  };

  const animateScrollTo = (targetY: number, duration = 350) => {
    // 진행 중인 애니메이션 취소
    if (scrollAnimRef.current) cancelAnimationFrame(scrollAnimRef.current);
    const start = document.body.scrollTop;
    const diff = targetY - start;
    if (Math.abs(diff) < 2) return; // 이미 도착
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress < 0.5
        ? 2 * progress * progress
        : -1 + (4 - 2 * progress) * progress; // easeInOutQuad
      document.body.scrollTop = start + diff * ease;
      if (progress < 1) {
        scrollAnimRef.current = requestAnimationFrame(step);
      } else {
        scrollAnimRef.current = null;
      }
    };
    scrollAnimRef.current = requestAnimationFrame(step);
  };

  const scrollToNode = (nodeId: string) => {
    const el = cardRefs.current[nodeId];
    if (!el) return;
    const stickyOffset = 110;
    const absoluteTop = getAbsoluteTop(el);
    animateScrollTo(Math.max(0, absoluteTop - stickyOffset));
    triggerPulse(nodeId);
  };

  // jumpIndex를 ref로도 유지 (state는 카운터 표시용, ref는 즉시 읽기용)
  const jumpIndexRef = useRef(0);

  // 키워드 토글
  const handleKeywordTap = (keyword: string) => {
    if (activeKeyword === keyword) {
      setActiveKeyword(null);
      setJumpIndex(0);
      jumpIndexRef.current = 0;
    } else {
      setActiveKeyword(keyword);
      setJumpIndex(0);
      jumpIndexRef.current = 0;
      const matched = projectNodes.filter(n => n.keywords?.includes(keyword));
      if (matched.length > 0) {
        // DOM 업데이트 후 스크롤
        requestAnimationFrame(() => scrollToNode(matched[0].id));
      }
    }
  };

  // 이전/다음 매칭 작품으로 점프
  const jumpTo = (direction: 'next' | 'prev') => {
    if (matchedNodes.length === 0) return;
    const current = jumpIndexRef.current;
    const next = direction === 'next'
      ? Math.min(current + 1, matchedNodes.length - 1)
      : Math.max(current - 1, 0);
    jumpIndexRef.current = next;
    setJumpIndex(next);
    scrollToNode(matchedNodes[next].id);
  };

  // 연도로 점프
  const jumpToYear = (year: number) => {
    yearRefs.current[year]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // 4. 스켈레톤 로딩
  if (projectNodes.length === 0) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] p-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="mb-6">
            <div className="h-5 w-12 bg-white/10 rounded mb-3 animate-pulse" />
            {[...Array(i === 0 ? 2 : 1)].map((_, j) => (
              <div key={j} className="flex gap-3 p-3 rounded-xl bg-zinc-900/60 mb-3 animate-pulse">
                <div className="w-[72px] h-[72px] shrink-0 rounded-lg bg-white/10" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-white/10 rounded w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                  <div className="flex gap-1 mt-2">
                    <div className="h-5 w-16 bg-white/10 rounded-full" />
                    <div className="h-5 w-12 bg-white/10 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      {/* ── Sticky 바 ────────────────────────── */}
      <div className="sticky top-0 z-30 bg-[#1a1a1a]/95 backdrop-blur-sm border-b border-white/10">
        {/* 뷰 전환 버튼 */}
        <div className="flex gap-1 px-4 pt-3 pb-1">
          {(['media'] as DiagramView[]).map(v => (
            <button
              key={v}
              onClick={() => switchView(v)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                activeView === v
                  ? v === 'research' ? 'bg-[#67C8FF] text-black font-bold'
                  : v === 'exhibition' ? 'bg-[#C084FC] text-black font-bold'
                  : 'bg-[#92F90E] text-black font-bold'
                  : 'bg-white/10 text-white/60'
              }`}
            >
              {v === 'media' ? 'Media' : v === 'research' ? 'Research' : 'Exhibition'}
            </button>
          ))}
        </div>
        {/* 키워드 row — 5. 우측 페이드 힌트 */}
        <div className="px-4 pt-1 pb-2 relative">
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {activeKeyword && (
              <button
                onClick={() => { setActiveKeyword(null); setJumpIndex(0); }}
                className="shrink-0 px-3 py-1.5 rounded-full text-xs border border-white/20 text-white/50"
              >
                ✕ Clear
              </button>
            )}
            {allKeywords.map(k => {
              const count = projectNodes.filter(n => n.keywords?.includes(k)).length;
              return (
                <button
                  key={k}
                  onClick={() => handleKeywordTap(k)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all ${
                    activeKeyword === k
                      ? 'bg-[#92F90E] text-black font-bold shadow-lg shadow-[#92F90E]/20'
                      : 'bg-white/10 text-white/60 border border-white/10'
                  }`}
                >
                  {k} <span className="opacity-50">({count})</span>
                </button>
              );
            })}
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-8 pointer-events-none bg-gradient-to-l from-[#1a1a1a]/95 to-transparent" />
        </div>

        {/* 2. 연도 바 — 스크롤 내릴 때 숨김 */}
        <div
          style={{
            maxHeight: showYearBar ? '32px' : '0px',
            opacity: showYearBar ? 1 : 0,
            overflow: 'hidden',
            transition: 'max-height 0.25s ease, opacity 0.25s ease',
          }}
        >
          <div className="flex gap-1.5 px-4 pb-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {yearGroups.map(({ year }) => (
              <button
                key={year}
                ref={el => { yearPillRefs.current[year] = el; }}
                onClick={() => jumpToYear(year)}
                className={`shrink-0 text-[10px] px-2.5 py-0.5 rounded transition-all duration-300 ${
                  activeYear === year
                    ? 'bg-[#92F90E]/20 text-[#92F90E] font-bold'
                    : 'bg-white/5 text-white/40'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 타임라인 ────────────────────────────── */}
      <div className="relative pl-6 pr-4 pb-20 pt-2">
        <div className="absolute left-[22px] top-0 bottom-0 w-px bg-gradient-to-b from-white/20 via-white/10 to-transparent" />

        {yearGroups.map(({ year, items }) => (
          <div key={year} ref={el => { yearRefs.current[year] = el; }}>
            {/* 연도 라벨 — 1. activeYear 강조 */}
            <div className="relative flex items-center gap-3 pt-6 pb-3">
              <div className={`absolute left-[-7.5px] w-3 h-3 rounded-full transition-all duration-500 bg-[#92F90E] ${
                activeYear === year
                  ? 'shadow-[0_0_14px_rgba(146,249,14,0.7)] scale-125'
                  : 'shadow-[0_0_8px_rgba(146,249,14,0.4)]'
              }`} />
              <div className={`ml-4 text-lg font-bold tracking-wide transition-colors duration-300 ${
                activeYear === year ? 'text-white' : 'text-white/70'
              }`}>
                {year}
              </div>
              <div className="flex-1 h-px bg-white/5" />
            </div>

            {/* 프로젝트 카드 */}
            <div className="ml-4 space-y-3 pb-2">
              {items.map(node => {
                const highlighted = matchedIds.has(node.id);
                const mediaLabels = nodeMediaLabels[node.id] || [];
                const isPulsed = pulsedId === node.id;

                return (
                  <div
                    key={node.id}
                    ref={el => { cardRefs.current[node.id] = el; }}
                    className="relative"
                    style={{ scrollMarginTop: 100 }}
                  >
                    <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-3 h-px bg-white/15" />
                    <div className="absolute -left-[20.5px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/25" />

                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{
                        opacity: highlighted ? 1 : 0.15,
                        y: 0,
                        scale: highlighted ? 1 : 0.97,
                      }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      onClick={() => {
                        if (highlighted)
                          window.location.href = `/projects/${node.id}`;
                      }}
                      className={`rounded-xl transition-all duration-300 ${
                        isPulsed
                          ? 'shadow-[0_0_20px_rgba(146,249,14,0.15)] cursor-pointer'
                          : highlighted
                            ? 'cursor-pointer active:scale-[0.98]'
                            : ''
                      }`}
                    >
                      <div className="flex gap-3 py-2 items-center">
                        {/* 누끼 썸네일 */}
                        <div className="w-[72px] h-[72px] shrink-0 flex items-center justify-center">
                          <img
                            src={`/images/${node.id}_thumbnail.png`}
                            alt={node.label}
                            className="max-w-full max-h-full object-contain"
                            draggable={false}
                          />
                        </div>

                        {/* 정보 */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                          <div>
                            <h3 className="text-white text-sm font-medium leading-snug">
                              {node.label}
                            </h3>
                            {mediaLabels.length > 0 && (
                              <p className="text-[11px] text-white/30 mt-0.5 truncate">
                                {mediaLabels.join(' · ')}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {node.keywords?.map(k => (
                              <button
                                key={k}
                                onClick={e => { e.stopPropagation(); handleKeywordTap(k); }}
                                className={`text-[11px] px-2.5 py-1 rounded-full transition-all ${
                                  activeKeyword === k
                                    ? 'bg-[#92F90E] text-black font-bold'
                                    : 'bg-white/10 text-white/50'
                                }`}
                              >
                                {k}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 5. 탭 힌트 화살표 */}
                        {highlighted && (
                          <span className="text-white/40 text-lg pl-1 shrink-0 leading-none">›</span>
                        )}
                      </div>

                      {node.years.length > 1 && (
                        <div className="px-3 pb-2 -mt-1">
                          <span className="text-[10px] text-white/25">
                            {[...node.years].sort().join(' → ')}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ── 플로팅 점프 내비게이터 ─────────────── */}
      <AnimatePresence>
        {activeKeyword && matchedNodes.length > 0 && (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            className="fixed bottom-16 left-1/2 -translate-x-1/2 z-40"
          >
            <div className="flex items-center gap-3 bg-black/85 backdrop-blur-md px-4 py-2.5 rounded-full border border-[#92F90E]/20 shadow-xl">
              <button
                onClick={() => jumpTo('prev')}
                disabled={jumpIndex <= 0}
                className="text-white/70 disabled:text-white/20 text-sm px-1"
              >
                ▲
              </button>
              <div className="text-center min-w-[60px]">
                <span className="text-[#92F90E] text-sm font-bold">{jumpIndex + 1}</span>
                <span className="text-white/40 text-sm"> / {matchedNodes.length}</span>
                <div className="text-[10px] text-white/30 -mt-0.5">{activeKeyword}</div>
              </div>
              <button
                onClick={() => jumpTo('next')}
                disabled={jumpIndex >= matchedNodes.length - 1}
                className="text-white/70 disabled:text-white/20 text-sm px-1"
              >
                ▼
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}