'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import ForceGraph2D, { ForceGraphMethods } from 'react-force-graph-2d';

type NodeType = {
  id: string;
  type: 'media' | 'project';
  label: string;
  px: number;
  py: number;
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
};

type LinkType = {
  source: string;
  target: string;
};

export default function Diagram() {
  const fgRef = useRef<ForceGraphMethods>(null);
  const [nodes, setNodes] = useState<NodeType[]>([]);
  const [links, setLinks] = useState<LinkType[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const imageCache = useMemo(() => ({} as Record<string, HTMLImageElement>), []);

  const linkedNodeIds = useMemo(() => {
    if (!hoveredId) return new Set();
    const connected = new Set<string>();
    links.forEach((link) => {
      if (link.source === hoveredId) connected.add(link.target);
      if (link.target === hoveredId) connected.add(link.source);
    });
    return connected;
  }, [hoveredId, links]);

  const getLinkNodeId = (node: string | NodeType) =>
  typeof node === 'object' ? (node as NodeType).id : node;

  const getFilteredOpacity = (nodeId: string): number => {
    if (!hoveredId) return 1;
  
    const connected = new Set<string>();
    links.forEach((link) => {
      const source = getLinkNodeId(link.source);
      const target = getLinkNodeId(link.target);
      if (source === hoveredId) connected.add(target);
      if (target === hoveredId) connected.add(source);
    });
  
    return nodeId === hoveredId || connected.has(nodeId) ? 1 : 0.1;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const nodesRes = await fetch('/data/Nodes.json');
        const linksRes = await fetch('/data/links.json');
        const nodesData: NodeType[] = await nodesRes.json();
        const linksData: LinkType[] = await linksRes.json();

        const fixedNodes = nodesData.map((node) => ({
          ...node,
          x: node.px,
          y: node.py,
          fx: node.px,
          fy: node.py,
        }));

        setNodes(fixedNodes);
        setLinks(linksData);
      } catch (err) {
        console.error('Error loading graph data:', err);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ForceGraph2D
        ref={fgRef}
        graphData={{ nodes, links }}
        backgroundColor="#424242"
        nodeDraggable={() => false}
        onNodeDragEnd={() => {}}
        onNodeHover={(node) => setHoveredId(node ? node.id : null)}

        nodePointerAreaPaint={(node: NodeType, color, ctx) => {
          if (node.type === 'project') {
            const imgSize = { width: 80, height: 60 };
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.rect(
              node.x! - imgSize.width / 2,
              node.y! - imgSize.height / 2,
              imgSize.width,
              imgSize.height + 20
            );
            ctx.fill();
          } else if (node.type === 'media') {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(node.x!, node.y!, 20, 0, 2 * Math.PI);
            ctx.fill();
          }
        }}

        onEngineStop={() => {
          fgRef.current?.zoomToFit(400);
        }}

        onNodeClick={(node: NodeType) => {
          if (node.type === 'project') {
            window.location.href = `/projects/${node.id}`;
          }
        }}

        nodeCanvasObject={(node: NodeType, ctx, globalScale) => {
          const opacity = getFilteredOpacity(node.id);
          ctx.globalAlpha = opacity;

          ctx.font = `${20 / globalScale}px Sans-Serif`;


          if (node.type === 'project') {
            const imgId = node.id;
            const imgSize = { width: 80, height: 60 };

            if (!imageCache[imgId]) {
              const img = new Image();
              img.src = `/images/${imgId}_thumbnail.png`;
              imageCache[imgId] = img;
            }

            const img = imageCache[imgId];

            if (img.complete) {
              ctx.drawImage(
                img,
                node.x! - imgSize.width / 2,
                node.y! - imgSize.height / 2,
                imgSize.width,
                imgSize.height
              );

              // 제목 폰트
              ctx.font = `${10 / globalScale}px Sans-Serif`;
              ctx.fillStyle = '#fff';
              ctx.textAlign = 'center';
              ctx.fillText(node.label, node.x!, node.y! + imgSize.height / 2 + 12);

              // 괄호용 폰트 — 더 크게!
              ctx.font = `200 ${50 / globalScale}px Sans-Serif`;
              ctx.fillText('(', node.x! - imgSize.width / 2 - 12, node.y! + 5);
              ctx.fillText(')', node.x! + imgSize.width / 2 + 12, node.y! + 5);
            }
          }

          if (node.type === 'media') {
            const fontSize = 20 / globalScale;
            const paddingX = 8;
            const paddingY = 4;
          
            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
          
            const text = `[${node.label}]`;
            const textWidth = ctx.measureText(text).width;
          
            // 🔲 배경 그리기
            ctx.fillStyle = 'rgba(146, 249, 19, 0.5)'; // 배경색 (반투명 흰색)
            ctx.fillRect(
              node.x! - textWidth / 2 - paddingX,
              node.y! - fontSize / 2 - paddingY,
              textWidth + paddingX * 2,
              fontSize + paddingY * 2
            );
          
            // 🔡 텍스트 그리기
            ctx.fillStyle = '#FFF'; // 텍스트 색상
            ctx.fillText(text, node.x!, node.y!);
          }
          

          ctx.globalAlpha = 1;
        }}

        linkCanvasObject={(link, ctx) => {
          const source = typeof link.source === 'object' ? link.source.id : link.source;
          const target = typeof link.target === 'object' ? link.target.id : link.target;
        
          const isLinked =
            hoveredId &&
            (source === hoveredId ||
             target === hoveredId ||
             linkedNodeIds.has(source) ||
             linkedNodeIds.has(target));
        
          const start = typeof link.source === 'object' ? link.source : null;
          const end = typeof link.target === 'object' ? link.target : null;
        
          if (!start || !end) return;
        
          // 스타일 지정
          ctx.strokeStyle = isLinked ? '#92F90E' : '#ccc';
          ctx.lineWidth = isLinked ? 1 : 0.5;
          ctx.setLineDash(isLinked ? [] : [7, 7]); // 실선 vs 점선
        
          ctx.beginPath();
          ctx.moveTo(start.x!, start.y!);
          ctx.lineTo(end.x!, end.y!);
          ctx.stroke();
        
          ctx.setLineDash([]); // reset
        }}

        

        onRenderFramePre={(ctx, globalScale) => {
          const { width, height } = ctx.canvas;
          const gridSize = 20;
          const gridColor = 'rgba(146, 249, 14, 0.1)';

          const transform = ctx.getTransform();
          const offsetX = transform.e % gridSize;
          const offsetY = transform.f % gridSize;

          ctx.save();
          ctx.fillStyle = '#424242';
          ctx.fillRect(0, 0, width, height);

          ctx.strokeStyle = gridColor;
          ctx.lineWidth = 1;
          ctx.beginPath();

          for (let x = -offsetX; x < width; x += gridSize) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
          }

          for (let y = -offsetY; y < height; y += gridSize) {
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
          }

          ctx.stroke();
          ctx.restore();
        }}
      />
    </div>
  );
}
