'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';

interface Node {
  id: string;
  type: 'media' | 'project';
  label: string;
  px: number; py: number;
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

  const containerRef = useRef<HTMLDivElement>(null);
  const dragState    = useRef<{ id:string; offsetX:number; offsetY:number }|null>(null);
  const wrapperRefs  = useRef<Record<string,HTMLDivElement|null>>({});
  const imageRefs    = useRef<Record<string,HTMLImageElement|null>>({});

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
    ]).then(([N,L])=>{ setNodes(N); setLinks(L); });
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



  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen select-none"
      style={{
        backgroundColor: '#424242',
        backgroundImage: "url('/images/diagram_grid.png')",
        backgroundSize:'cover', backgroundPosition:'center', backgroundRepeat:'no-repeat'
      }}
    >
      {/* SVG 링크 */}
      <svg className="absolute inset-0 pointer-events-none"
           viewBox={`0 0 ${dims.width} ${dims.height}`}>
        {links.map((l,i)=>{
          const aEl = imageRefs.current[l.source];
          const bEl = imageRefs.current[l.target];
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
            <line key={i}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={hilite? '#92F90E':'#ffffff'}
              strokeWidth={1}
              strokeDasharray={hilite?'':'4 2'}
              style={{opacity:hovered?(hilite?1:0.2):1}}
            />
          );
        })}
      </svg>

      {/* 노드 렌더 */}
      {nodes.map(node=>{
        const cx = node.px*dims.width;
        const cy = node.py*dims.height;
        const isOn = !hovered || connected.has(node.id);

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
              style={{
                left:cx, top:cy,
                transform:'translate(-50%,-50%)',
                cursor:'grab',
                opacity: isOn ? 1 : 0.2,
                filter:  isOn ? 'none' : 'blur(1px)',
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
