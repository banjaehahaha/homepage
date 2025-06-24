'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import ForceGraph2D, { ForceGraphMethods } from 'react-force-graph-2d';


type NodeType = {
  id: string;
  type: 'project' | 'media';
  label: string;
  px: number;
  py: number;
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
};

type LinkType = {
  source: string | NodeType;
  target: string | NodeType;
};

type ResolvedLinkType = {
  source: NodeType;
  target: NodeType;
};

export default function DiagramPageClient() {
  const fgRef = useRef<ForceGraphMethods>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null); // ← 배경용 canvas

  const [nodes, setNodes] = useState<NodeType[]>([]);
  const [nodesRaw, setNodesRaw] = useState<NodeType[]>([]); // 비율 좌표 원본
  const [linksRaw, setLinksRaw] = useState<{ source: string; target: string }[]>([]);
  const [links, setLinks] = useState<LinkType[]>([]);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const imageCache = useMemo(() => ({} as Record<string, HTMLImageElement>), []);
  const graphData = useMemo(() => ({nodes, links}), [nodes, links]);

  
  // ⬇︎ 초기 1회 고정 위치 계산 (fx/fy 포함)
const fixedNodes = useMemo(() => {
  if (!dimensions.width || !nodesRaw.length) return [];
  return nodesRaw.map((n) => {
    const x = n.px * dimensions.width;
    const y = n.py * dimensions.height;
    return { ...n, x, y, fx: x, fy: y };
  });
}, [nodesRaw, dimensions.width, dimensions.height]);

// ⬇︎ 링크도 고정
const fixedLinks = useMemo(() => {
  const map = new Map(fixedNodes.map((n) => [n.id, n]));
  return linksRaw
    .map((l) => {
      const source = map.get(l.source);
      const target = map.get(l.target);
      if (!source || !target) return null;
      return { source, target };
    })
    .filter((l) => l !== null) 
}, [fixedNodes, linksRaw]);

// ⬇︎ 드래그 후 위치 고정 (선택)
const onNodeDragEnd = useCallback((node) => {
  //node.fx = node.x;
  //node.fy = node.y;
}, []);


const graphMemo = useMemo(() => ({
  nodes: fixedNodes,
  links: fixedLinks,
}), [fixedNodes, fixedLinks]);

  // node 크기 계산을 위해
  const scaleNodePositions = (nodes: NodeType[], width: number, height: number) =>
    nodes.map((node) => {
      const x = node.px * width;
      const y = node.py * height;
      return {
        ...node,
        x,
        y,
        fx: x,
        fy: y,
      };
    });

  // 직접 연결된 노드 ID만 수집
  const linkedNodeIds = useMemo(() => {
    if (!hoveredId) return new Set<string>();
    const connected = new Set<string>();
  
    links.forEach(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
  
      const sourceNode = nodes.find(n => n.id === sourceId);
      const targetNode = nodes.find(n => n.id === targetId);
  
      if (!sourceNode || !targetNode) return;
  
      // ✅ 프로젝트 노드일 경우 매체만 강조
      if (sourceId === hoveredId && sourceNode.type === 'project' && targetNode.type === 'media') {
        connected.add(targetId);
      } else if (targetId === hoveredId && targetNode.type === 'project' && sourceNode.type === 'media') {
        connected.add(sourceId);
      }
  
      // ✅ 매체 노드일 경우 프로젝트만 강조
      if (sourceId === hoveredId && sourceNode.type === 'media' && targetNode.type === 'project') {
        connected.add(targetId);
      } else if (targetId === hoveredId && targetNode.type === 'media' && sourceNode.type === 'project') {
        connected.add(sourceId);
      }
    });
  
    return connected;
  }, [hoveredId, links, nodes]);

  const getFilteredOpacity = (nodeId: string): number => {
    if (!hoveredId) return 1;
    return nodeId === hoveredId || linkedNodeIds.has(nodeId) ? 1 : 0.1;
  };

  const scaleFactor = Math.min(dimensions.width / 1920, 1); // 최대 100%, 줄이기만 함

  // 🔁 바깥에 이거 하나만 남기세요
const handleResize = () => {
  if (!containerRef.current || !nodesRaw.length || !linksRaw.length) return;

  const { width, height } = containerRef.current.getBoundingClientRect();
  setDimensions({ width, height });

  const fixedNodes = scaleNodePositions(nodesRaw, width, height);
  setNodes(fixedNodes);

  const nodeMap = new Map(fixedNodes.map((n) => [n.id, n]));
  const resolvedLinks = linksRaw
    .map((link) => {
      const sourceNode = nodeMap.get(link.source);
      const targetNode = nodeMap.get(link.target);
      if (!sourceNode || !targetNode) return null;
      return { source: sourceNode, target: targetNode };
    })
    .filter((l) => l !== null);

  setLinks(resolvedLinks);
};


useEffect(() => {
  const fetchData = async () => {
    const nodesRes = await fetch('/data/Nodes.json');
    const linksRes = await fetch('/data/links.json');

    const nodesData = await nodesRes.json();
    const linksData: { source: string; target: string }[] = await linksRes.json();

    setNodesRaw(nodesData);
    setLinksRaw(linksData);

    if (!containerRef.current) return;
    await new Promise(requestAnimationFrame);
    const { width, height } = containerRef.current.getBoundingClientRect();
    setDimensions({ width, height });

    const fixedNodes = scaleNodePositions(nodesData, width, height);
    setNodes(fixedNodes);

    const nodeMap = new Map(fixedNodes.map((n) => [n.id, n]));
    const resolvedLinks = linksData
      .map((link) => {
        const sourceNode = nodeMap.get(link.source);
        const targetNode = nodeMap.get(link.target);
        if (!sourceNode || !targetNode) return null;
        return { source: sourceNode, target: targetNode };
      })
      .filter((l): l is ResolvedLinkType => l !== null);

    setLinks(resolvedLinks);
  };

  setTimeout(() => {
    fgRef.current?.zoomToFit(400, 60); // 400ms 동안, 40px 여백 유지
  }, 0);

  fetchData();

  if (typeof window !== 'undefined') {
    window.addEventListener('resize', handleResize);
  }

  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', handleResize);
    }
  };
}, [nodesRaw, linksRaw]);

useEffect(() => {
  if (!bgCanvasRef.current) return;

  const bgCanvas = bgCanvasRef.current;
  const ctx = bgCanvas.getContext('2d');
  if (!ctx) return;

  bgCanvas.width = dimensions.width;
  bgCanvas.height = dimensions.height;

  const bgImage = new Image();
  bgImage.src = '/images/diagram_grid.png'; // 너가 배경으로 쓰려는 이미지 경로

  bgImage.onload = () => {
    ctx.drawImage(bgImage, 0, 0, dimensions.width, dimensions.height);
  };
}, [dimensions]); // dimensions가 바뀔 때마다 다시 그리기


const stableGraphData = useMemo(() => ({
  nodes: nodes.map(n => ({ ...n })), // 새 객체로 만들어서 side effect 방지
  links: links.map(l => ({ 
    source: typeof l.source === 'object' ? l.source.id : l.source,
    target: typeof l.target === 'object' ? l.target.id : l.target
  })),
}), [nodes, links]);


  

  
  return (
    <div style={{ width: '100vw', height: '100vh', background: 'black' }}>
      <div
        ref={containerRef}
        style={{
          width: '100vw',
          height: '100vh',
          position: 'relative',
          zIndex: 0, // ⬅️ 추가!
          background: 'black',
        }}
      >
        <canvas
          ref={bgCanvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: -1,
            pointerEvents: 'none',
          }}
        />
      <ForceGraph2D
        ref={fgRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={stableGraphData}
        nodeDraggable={false}
        cooldownTicks={0}
        autoPauseRedraw={true}
        enableZoomInteraction={false}
        enablePanInteraction={false}


        onNodeHover={(node) => setHoveredId(node ? node.id : null)}
        onNodeClick={(node: NodeType) => {
          if (typeof window !== 'undefined' && node.type === 'project') {
            window.location.href = `/projects/${node.id}`;
          }
        }}
        nodeCanvasObject={(node: NodeType, ctx, globalScale) => {
          const opacity = getFilteredOpacity(node.id);
          const fontSize = 14 / globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.globalAlpha = opacity;

          if (node.type === 'project') {
            const imgId = node.id;
            const imgSize = { width: 80 * scaleFactor, height: 60 * scaleFactor };


            if (!imageCache[imgId]) {
              const img = new Image();
              img.src = `/images/${imgId}_thumbnail.png`;
              imageCache[imgId] = img;
            }

            const maxWidth = 80;
            const img = imageCache[imgId];
            if (img.complete && img.naturalWidth && img.naturalHeight) {
              const aspectRatio = img.naturalWidth / img.naturalHeight;
              const imgWidth = Math.min(maxWidth, img.naturalWidth);
              const imgHeight = imgWidth / aspectRatio;

            
              // 이미지의 중심을 node.y 기준으로 맞추되,
              // 세로가 길면 위쪽으로도 확장
              const imgX = node.x! - imgWidth / 2;
              const imgY = node.y! - imgHeight / 2;
            
              ctx.drawImage(img, imgX, imgY, imgWidth, imgHeight);
            
              // 제목은 이미지 아래쪽에 배치
              ctx.font = `${10 * scaleFactor / globalScale}px Sans-Serif`;
              ctx.fillStyle = '#fff';
              ctx.textAlign = 'center';
              ctx.fillText(node.label, node.x!, imgY + imgHeight + 12);
            
              const imgCenterY = imgY + imgHeight / 2;

              ctx.font = `200 ${50 / globalScale}px Sans-Serif`;
              ctx.textBaseline = 'middle';
              const margin = 12 * scaleFactor + 10;  // ← 여유 5px 추가

              ctx.fillText('(', node.x! - imgSize.width / 2 - margin, node.y!);
              ctx.fillText(')', node.x! + imgSize.width / 2 + margin, node.y!);
            }

          } else if (node.type === 'media') {
            const fontSize = 25 * scaleFactor / globalScale;
            const paddingX = 10 * scaleFactor;
            const paddingY = 6 * scaleFactor;
            const text = `[${node.label}]`;
            ctx.font = `${fontSize}px Sans-Serif`;
            const textWidth = ctx.measureText(text).width;

            const width = textWidth + paddingX * 2;
            const height = fontSize + paddingY * 2; 

            ctx.fillStyle = 'rgba(146, 249, 19, 0.5)';
            ctx.fillRect(
              node.x! - width / 2,
              node.y! - height / 2,
              width,
              height
            );

            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, node.x!, node.y!);
          }

          ctx.globalAlpha = 1;
        }}

        nodePointerAreaPaint={(node: NodeType, color, ctx) => {
          ctx.fillStyle = color;
        
          if (node.type === 'project') {
            const width = 80 * scaleFactor;
            const height = (60 + 12 + 12) * scaleFactor; // 이미지 + 텍스트 여백 포함
            ctx.fillRect(node.x! - width / 2, node.y! - height / 2, width, height);
          } else if (node.type === 'media') {
            const fontSize = 20;
            const paddingX = 8;
            const paddingY = 4;
            const text = `[${node.label}]`;
            ctx.font = `${fontSize}px Sans-Serif`;
            const textWidth = ctx.measureText(text).width;
        
            const width = textWidth + paddingX * 2;
            const height = fontSize + paddingY * 2;
        
            ctx.fillRect(
              node.x! - width / 2,
              node.y! - height / 2,
              width,
              height
            );
          }
        }}
        

        linkCanvasObject={(link, ctx) => {
          const source = typeof link.source === 'object' ? link.source : nodes.find((n) => n.id === link.source)!;
          const target = typeof link.target === 'object' ? link.target : nodes.find((n) => n.id === link.target)!;

          const show = hoveredId
            ? (source.id === hoveredId || target.id === hoveredId)
              || (linkedNodeIds.has(source.id) && target.id === hoveredId)
              || (linkedNodeIds.has(target.id) && source.id === hoveredId)
            : false; 

          ctx.strokeStyle = show ? '#92F90E' : '#ccc';
          ctx.lineWidth = show ? 1 : 0.5;
          ctx.setLineDash(show ? [] : [5, 5]);

          ctx.beginPath();
          ctx.moveTo(source.x!, source.y!);
          ctx.lineTo(target.x!, target.y!);
          ctx.stroke();

          ctx.setLineDash([]);
        }}
      />
      </div>
    </div>
  );
}
