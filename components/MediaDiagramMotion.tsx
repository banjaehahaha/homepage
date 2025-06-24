'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';

interface Node {
  id: string;
  type: 'media' | 'project';
  label: string;
  px: number; py: number;
  years: number[]; 
  keywords: string[];
}
interface Link { source: string; target: string; }

const THUMB_W = 112;
const THUMB_H = 112;
const TITLE_GAP = 6;      // 이미지 아래 간격
const TITLE_EXTRA_W = 80; // 제목 박스 넓이 여유분


export default function MediaDiagram() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);

  const [dims, setDims] = useState({ width: 0, height: 0 });
  const [hovered, setHovered] = useState<string | null>(null);
  const [maxZ, setMaxZ] = useState(1);
  const [zIndexMap, setZIndexMap] = useState<Record<string, number>>({});

  const [isGridAnimating, setIsGridAnimating] = useState(false);
  const [isYearGrid, setIsYearGrid] = useState(false);

  const initialPos = useRef<Record<string,{px:number,py:number}>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const dragState    = useRef<{ id:string; offsetX:number; offsetY:number }|null>(null);
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
        .map(n => ({ ...n, year: Math.min(...n.years) }))
        .sort((a, b) => a.year - b.year);
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
            if (n.type === 'media') return n;
      
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
      ]).then(([N, L]) => {
        setLinks(L);
        // nodes 세팅 전에, 초기 위치 맵 저장
        const map: Record<string,{px:number,py:number}> = {};
        N.forEach((n:Node) => {
          map[n.id] = { px: n.px, py: n.py };
        });
        initialPos.current = map;
  
        setNodes(N);
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
  const onMove = (e:globalThis.PointerEvent) => {
    if (!dragState.current || !containerRef.current) return;
    const { id, offsetX, offsetY } = dragState.current;
    const r = containerRef.current.getBoundingClientRect();
    const newCx = e.clientX - r.left - offsetX;
    const newCy = e.clientY - r.top  - offsetY;
    setNodes(ns=>ns.map(n=>
      n.id===id
      ? { ...n, px:newCx/dims.width, py:newCy/dims.height }
      : n
    ));
  };
  const onUp = () => {
    dragState.current = null;
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup',   onUp);
  };
  const onDown = (e:globalThis.PointerEvent, node:Node) => {
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
    };
    window.addEventListener('pointermove',onMove);
    window.addEventListener('pointerup',onUp);
  };

  const toggleYearGrid = () => {
    if (!isYearGrid) {
      // 연도별 그리드 모드로
      setIsGridAnimating(true);
      setNodes(old =>
        old.map(n => {
          if (n.type === 'media') return n;
          const pos = gridPositions.find(p => p.id === n.id)!;
          return { ...n, px: pos.px, py: pos.py };
        })
      );
      setTimeout(() => setIsGridAnimating(false), 1000);
    } else {
      // 원래 위치로 복원
      setIsGridAnimating(true);
      setNodes(old =>
        old.map(n => {
          const orig = initialPos.current[n.id];
          return orig ? { ...n, px: orig.px, py: orig.py } : n;
        })
      );
      setTimeout(() => setIsGridAnimating(false), 1000);
    }
    setIsYearGrid(prev => !prev);
  };


  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen select-none"
      style={{
        backgroundColor: '#333333',
        backgroundImage: "url('/images/diagram_grid.png')",
        backgroundSize:'cover', backgroundPosition:'center', backgroundRepeat:'no-repeat'
      }}
    >
              {/* ─── 체크박스 UI ─────────────────────────── */}
      <div className="absolute top-4 left-4 bg-black/50 p-3 rounded text-white">
        <h4 className="mb-2 font-semibold">키워드 필터</h4>
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
            />
            <span>{k}</span>
          </label>
        ))}
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
      {nodes.map(node=>{
        const cx = node.px*dims.width;
        const cy = node.py*dims.height;
        const isOn = !hovered || connected.has(node.id);
        const visible = isVisible(node);
        if (node.type === 'project' && !visible) return null;

        // 이미지 높이 읽어 제목 위치 계산 (원래대로)
        let imgH = THUMB_H;
        const imgEl = imageRefs.current[node.id];
        if(imgEl) imgH = imgEl.getBoundingClientRect().height;
        const titleTop = cy + imgH/2 + TITLE_GAP;
        const z = zIndexMap[node.id] ?? 0;
        
        return (
          <React.Fragment key={node.id}>
            {/* 1) 클릭·드래그 wrapper */}
            <div
              ref={el=>wrapperRefs.current[node.id]=el}
              onPointerDown={e=>onDown(e,node)}
              onMouseEnter={()=>setHovered(node.id)}
              onMouseLeave={()=>setHovered(null)}
              className="absolute z-10"
              key={node.id}
              style={{
                left:cx, top:cy,
                transform:'translate(-50%,-50%)',
                cursor:'grab',
                opacity: isOn ? 1 : 0.2,
                filter:  isOn ? 'none' : 'blur(1px)',
                transition: isGridAnimating
                // 그리드 애니메이션 중: left/top + opacity/filter
                ? 'opacity 0.3s ease, filter 0.3s ease, left 1s ease, top 1s ease'
                // 드래그 중엔 opacity/filter 만 (left/top 즉시)
                : 'opacity 0.3s ease, filter 0.3s ease',
                width: node.type==='project'? THUMB_W : undefined,
                height:node.type==='project'? THUMB_H : undefined,
                userSelect:'none',
                zIndex: z,  
              }}
            >
              {node.type==='media' && (
                <div className="bg-[#92F90E]/50 text-white px-2 py-1 shadow-lg text-xl select-none">
                  [{node.label}]
                </div>
              )}
            </div>

            {/* 2) 괄호+이미지 */}
            {node.type==='project' && (
              <div
                className="absolute z-10 pointer-events-none"
                style={{
                  left:cx, top:cy,
                  transform:'translate(-50%,-50%)',
                  zIndex: z,  
                  opacity: isOn ? 1 : 0.2,
                  filter:  isOn ? 'none' : 'blur(1px)',
                  transition: isGridAnimating
                  // 그리드 애니메이션 중: left/top + opacity/filter
                  ? 'opacity 0.3s ease, filter 0.3s ease, left 1s ease, top 1s ease'
                  // 드래그 중엔 opacity/filter 만 (left/top 즉시)
                  : 'opacity 0.3s ease, filter 0.3s ease',
                }}
              >
                <div className="flex items-center">
                  <span className="text-6xl font-light">（</span>
                  <img
                    ref={el=>imageRefs.current[node.id]=el}
                    src={`/images/${node.id}_thumbnail.png`}
                    alt={node.label}
                    width={THUMB_W} height={THUMB_H}
                    draggable={false}
                    className="mx-[-8px] object-contain"
                  />
                  <span className="text-6xl font-light">）</span>
                </div>
              </div>
            )}


            <label className="absolute top-4 right-4 inline-flex items-center cursor-pointer">
            {/* sr-only: 스크린 리더 전용 */}
            <input
                type="checkbox"
                checked={isYearGrid}
                onChange={toggleYearGrid}
                className="sr-only peer"
            />
            <div
                className="
                w-12 h-6 bg-gray-300 rounded-full
                peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500
                peer-checked:bg-blue-600
                relative
                transition-colors
                "
            >
                <span
                className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full"
                style={{
                    transform: isYearGrid ? 'translateX(1.5rem)' : 'translateX(0)',
                    transition: 'transform 0.3s ease',
                }}
                />
            </div>
            <span className="ml-3 text-sm font-medium text-white">
                {isYearGrid ? '연도별 배치 켜짐' : '연도별 배치 꺼짐'}
            </span>
            </label>

            {/* 3) 제목 */}
            {node.type==='project' && (
              <div
                className="absolute text-sm font-light text-center pointer-events-none text-white"
                style={{
                  left:cx, top:titleTop,
                  transform:'translateX(-50%)',
                  width:THUMB_W + TITLE_EXTRA_W,
                  whiteSpace:'normal',
                  wordBreak:'break-word',
                  overflowWrap:'break-word',
                  zIndex: z,  
                  opacity: isOn ? 1 : 0.2,
                  filter:  isOn ? 'none' : 'blur(1px)',
                  transition: isGridAnimating
                  // 그리드 애니메이션 중: left/top + opacity/filter
                  ? 'opacity 0.3s ease, filter 0.3s ease, left 1s ease, top 1s ease'
                  // 드래그 중엔 opacity/filter 만 (left/top 즉시)
                  : 'opacity 0.3s ease, filter 0.3s ease',
                  userSelect:'none',
                }}
              >
                {node.label}
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
