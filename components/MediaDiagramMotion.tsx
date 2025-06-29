'use client';

import Link from 'next/link' 
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';



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
}) {
  const cx = node.px * dims.width;
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
              ref={el => { wrapperRefs.current[node.id] = el; }}
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
  if (node.type === 'media') {
    const z = zIndexMap[node.id] ?? 0;
    return (
      <div
        key={node.id}
        ref={el => { wrapperRefs.current[node.id] = el; }}
        onPointerDown={e => onPointerDown(e, node)}
        onMouseEnter={() => setHovered(node.id)}
        onMouseLeave={() => setHovered(null)}
        className="absolute z-10"
        style={{
          left: cx, top: cy,
          transform: 'translate(-50%,-50%)',
          cursor: 'grab',
          opacity: isOn ? 1 : 0.2,
          filter: isOn ? 'none' : 'blur(1px)',
          transition: isGridAnimating
            ? 'opacity 0.3s ease, filter 0.3s ease, left 1s ease, top 1s ease'
            : 'opacity 0.3s ease, filter 0.3s ease',
          userSelect: 'none',
          zIndex: z,
        }}
      >
        <div className="bg-[#92F90E]/50 text-white px-2 py-1 shadow-lg text-xl select-none">
          [{node.label}]
        </div>
      </div>
    );
  }

  // 기본 fallback
  return null;
}



interface Node {
  id: string;
  type: 'media' | 'project'| 'upcoming';
  label: string;
  px: number; py: number;
  years: number[]; 
  keywords: string[];
  media?: string[]; 
}
interface Link { source: string; target: string; }

const THUMB_H = 112;
const TITLE_GAP = 6;      // 이미지 아래 간격
const TITLE_EXTRA_W = 80; // 제목 박스 넓이 여유분


export default function MediaDiagram() {
  const router = useRouter();
  const pathname = usePathname();

  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);

  const [modalNode, setModalNode] = useState<string|null>(null)

  const [dims, setDims] = useState({ width: 0, height: 0 });
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
    if (n.type === 'media') return true;
    if (selected.size === 0) return true;
    return Array.from(selected).every(k =>
        n.keywords?.includes(k)
      );
    };
  

        // 1) year(가장 이른 연도) 뽑고 sort
    const sortedByYear = useMemo(() => {
        return [...nodes]
        .map(n => ({ ...n, year: Math.max(...n.years) }))
        .sort((a, b) => b.year - a.year);
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
      
  

  
  // 컨테이너 측정
  useEffect(() => {
    const upd = () => {
      if (!containerRef.current) return;
      setDims({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      });
    };
    upd(); window.addEventListener('resize',upd);
    return ()=>window.removeEventListener('resize',upd);
  }, []);

  // 데이터 로드
  useEffect(() => {
    Promise.all([
        fetch('/data/Nodes.json').then(r=>r.json()),
        fetch('/data/links.json').then(r=>r.json()),
        fetch('/data/projects.json').then(r => r.json()),
      ]).then(([N, L, P]) => {
        setLinks(L);

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
      links.forEach(l=>{
        if(l.source===hovered) s.add(l.target);
        if(l.target===hovered) s.add(l.source);
      });
    }
    return s;
  },[hovered,links]);

  // 드래그 핸들러
  
  const onMove = (e: PointerEvent) => {
    if (!dragState.current || !containerRef.current) return;
    if (!dragState.current.moved) {
      const { id } = dragState.current;
      const node = nodes.find(n => n.id === id);
      const rect = containerRef.current.getBoundingClientRect();
      const startX = node!.px * dims.width + rect.left;
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
    setNodes(ns =>
      ns.map(n =>
        n.id === id
          ? { ...n, px: newCx / dims.width, py: newCy / dims.height }
          : n
      )
    );
  };

  const onPointerUpWrapper = (e: PointerEvent) => {
    if (dragState.current && dragState.current.moved === false) {
      const node = nodes.find(n => n.id === dragState.current!.id);
      if (!node) return;
      if (node.type === 'project') {
        router.push(`/diagram/modal/projects/${node.id}`);
      } else if (node.type === 'upcoming') {
        setModalNode(node.id);
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
      const cx = node.px * dims.width;
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

  const isMobile = useMediaQuery("(max-width: 768px)");

  if (isMobile) {
    return <MobilePortfolio nodes={nodes} links={links} />;
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-screen"
      style={{
        backgroundColor: '#333333',
        backgroundImage: "url('/images/diagram_grid.png')",
        backgroundSize:'cover', backgroundPosition:'center', backgroundRepeat:'no-repeat'
      }}
    >
          {/* ─── 필터+CV outer wrapper ─────────────────────────── */}
    <div className="absolute top-4 left-4">
      {/* ─── 실제 필터 박스 ─────────────────────────── */}
      <div className="bg-black/50 p-3 rounded text-white space-y-3 w-max">
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
                Time-Ordered View
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

            <Link href="/cv">
              <span className="text-white text-2xl font-bold hover:underline">
                Texts →
              </span>
            </Link>

            <Link href="/cv">
              <span className="text-white text-2xl font-bold hover:underline">
                CV →
              </span>
            </Link>

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
        {links.map((l,i)=>{
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
            x1=A.px*dims.width; y1=A.py*dims.height;
            x2=B.px*dims.width; y2=B.py*dims.height;
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
                stroke={hilite ? '#92F90E' : '#888888'}
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
        />
      ))}


      {/* 모달 렌더링 */}
      {modalNode === 'upcoming-event' && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center"
          onClick={() => setModalNode(null)}
        >
          <div
            className="bg-white p-6 rounded max-w-sm"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-2">Upcoming Events</h2>
            <p>• Event A on July 1<br/>• Event B on August 12</p>
            <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded z-30"
              onClick={() => setModalNode(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}




function MobilePortfolio({ nodes, links }: { nodes: Node[]; links: Link[] }) {
 // 미디어 아이디-라벨 매핑
 const mediaIdLabelMap = useMemo(() => {
  const map: { [key: string]: string } = {};
  nodes.filter(n => n.type === "media").forEach(n => { map[n.id] = n.label; });
  return map;
}, [nodes]);

// 매체 리스트 (중복제거, All 포함)
const mediaList = useMemo(() => {
  const medias = nodes.filter(n => n.type === "project").flatMap(n => n.media || []);
  return ["All", ...Array.from(new Set(medias))];
}, [nodes]);

// 필터 관련 상태
const [selectedMedia, setSelectedMedia] = useState<string>('All');
const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());
const tabRef = useRef<HTMLDivElement>(null);
const [canScrollLeft, setCanScrollLeft] = useState(false);
const [canScrollRight, setCanScrollRight] = useState(false);

// 스크롤 체크
const updateScroll = () => {
  if (!tabRef.current) return;
  setCanScrollLeft(tabRef.current.scrollLeft > 2);
  setCanScrollRight(
    tabRef.current.scrollLeft + tabRef.current.offsetWidth <
      tabRef.current.scrollWidth - 2
  );
};

useEffect(() => {
  updateScroll();
  const el = tabRef.current;
  if (!el) return;
  el.addEventListener("scroll", updateScroll);
  window.addEventListener("resize", updateScroll);
  return () => {
    el.removeEventListener("scroll", updateScroll);
    window.removeEventListener("resize", updateScroll);
  };
}, []);

useEffect(() => {
  if (mediaList.length > 0 && !selectedMedia) {
    setSelectedMedia(mediaList[0]);
  }
}, [mediaList, selectedMedia]);

// 키워드 리스트 (선택된 매체로 필터)
const keywordList = useMemo(() => {
  return Array.from(new Set(
    nodes
      .filter(n =>
        n.type === 'project' &&
        (
          selectedMedia === 'All' ||
          (n.media && Array.isArray(n.media) && n.media.includes(selectedMedia))
        )
      )
      .flatMap(n => n.keywords || [])
  )).sort();
}, [nodes, selectedMedia]);

// 필터된 노드
const filteredNodes = useMemo(() => {
  return nodes.filter(n =>
    n.type === 'project' &&
    (
      selectedMedia === 'All' ||
      (
        n.media && Array.isArray(n.media) &&
        n.media.includes(selectedMedia)
      )
    ) &&
    (
      selectedKeywords.size === 0 ||
      Array.from(selectedKeywords).every(k => n.keywords?.includes(k))
    )
  ).sort((a, b) => Math.min(...b.years) - Math.min(...a.years));
}, [nodes, selectedMedia, selectedKeywords]);


  return (
      <div className="p-4 w-full min-h-screen overflow-y-auto">
      <div className="relative w-full">
        {canScrollLeft && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 z-10 text-2xl font-black text-white-400 select-none pointer-events-none">〈</span>
        )}
        {canScrollRight && (
          <span className="absolute right-0 top-1/2 -translate-y-1/2 z-10 text-2xl font-black text-white-400 select-none pointer-events-none">〉</span>
        )}
        <div
          ref={tabRef}
          className="flex gap-2 overflow-x-auto pt-2 pb-6 scrollbar-hide"
          style={{ scrollbarWidth: "none" }}
        >
          {mediaList.map(mediaId => (
            <button
              key={mediaId}
              onClick={() => {
                setSelectedMedia(mediaId);
                setSelectedKeywords(new Set());
              }}
              className={`px-4 py-2 rounded border
                ${selectedMedia === mediaId
                  ? 'bg-[#92F90E] text-black font-bold border-[#92F90E]'
                  : 'bg-zinc-800 text-white border-zinc-700'}
              `}
            >
            {mediaId === 'All' ? 'All' : (mediaIdLabelMap[mediaId] || mediaId)}
            </button>
          ))}
        </div>
      </div>

      {/* 카드 리스트 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filteredNodes.map(node => (
          <div
            key={node.id}
            onClick={() => window.location.href = `/projects/${node.id}`}
            className="bg-zinc-900 rounded-xl overflow-hidden shadow-lg cursor-pointer"
          >
            <img
              src={`/images/${node.id}_thumbnail.png`}
              alt={node.label}
              className="w-full aspect-square object-cover"
            />
            <div className="p-2 text-white text-base">{node.label}</div>
            <div className="flex flex-wrap gap-1 px-2 pb-2">
            {node.keywords && node.keywords.map(k => (
              <span
                key={k}
                className="inline-block bg-[#92F90E] text-black text-xs px-2 py-0.5 rounded-full font-medium"
              >
                {k}
              </span>
            ))}
          </div>
            <div className="px-2 pb-2 text-xs text-gray-400">{[...node.years].sort().join(', ')}</div>
          </div>
        ))}
      </div>
      {/* 안내문구 */}
      <div className="mt-6 text-center text-gray-400 text-xs">
        전체 다이어그램은 PC에서 더 편하게 보실 수 있습니다
      </div>

          {/* 하단 네비게이션 바 */}
          <div className="fixed bottom-0 left-0 w-full bg-black flex justify-around py-2 z-50 border-t border-zinc-800">
            <a href="/diagram" className="text-white text-lg flex flex-col items-center">
              Works
              </a>
            <a href="/cv" className="text-white text-lg flex flex-col items-center">
              CV
            </a>
            <a href="/texts" className="text-white text-lg flex flex-col items-center">
              Texts
            </a>
            <a
              href="https://instagram.com/ban_jaeha"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white text-lg flex flex-col items-center"
            >Instagram
            </a>
          </div>
    </div>
  );
}