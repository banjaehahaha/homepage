'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';

interface Node {
  id: string;
  type: string;
  label: string;
  px: number; // 0~1
  py: number;
}

interface Link {
  source: string;
  target: string;
}

export default function MediaDiagramMotion() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const THUMB_WIDTH = 112;
  const THUMB_HEIGHT = 112;

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    Promise.all([
      fetch('/data/Nodes.json').then((res) => res.json()),
      fetch('/data/links.json').then((res) => res.json()),
    ]).then(([rawNodes, links]) => {
      setNodes(rawNodes);
      setLinks(links);
    });
  }, []);

  const nodeMap = useMemo(() => {
    return new Map(nodes.map(n => [n.id, n]));
  }, [nodes]);

  const connectedNodeIds = useMemo(() => {
    const set = new Set<string>();
    if (hoveredNodeId) {
      set.add(hoveredNodeId);
      links.forEach(link => {
        if (link.source === hoveredNodeId) set.add(link.target);
        if (link.target === hoveredNodeId) set.add(link.source);
      });
    }
    return set;
  }, [hoveredNodeId, links]);

  const getStyle = (node: Node) => ({
    position: 'absolute',
    left: node.px * dimensions.width - THUMB_WIDTH / 2,
    top: node.py * dimensions.height - THUMB_HEIGHT / 2,
    opacity: !hoveredNodeId || connectedNodeIds.has(node.id) ? 1 : 0.1,
  });

  const handleDrag = (node: Node, info: any) => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    const newPx = (info.point.x - containerRect.left) / dimensions.width;
    const newPy = (info.point.y - containerRect.top) / dimensions.height;

    setNodes(prev =>
      prev.map(n => (n.id === node.id ? { ...n, px: newPx, py: newPy } : n))
    );
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-black"
    >
      {/* 🔗 링크 그리기 */}
      <svg
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
      >
        {links.map((link, idx) => {
          const source = nodeMap.get(link.source);
          const target = nodeMap.get(link.target);
          if (!source || !target) return null;

          const isConnected =
            hoveredNodeId && (link.source === hoveredNodeId || link.target === hoveredNodeId);

          return (
            <line
              key={idx}
              x1={source.px * dimensions.width}
              y1={source.py * dimensions.height}
              x2={target.px * dimensions.width}
              y2={target.py * dimensions.height}
              stroke={isConnected ? '#92F90E' : '#ffffff'}
              strokeWidth={1}
              strokeDasharray={isConnected ? '' : '4 2'}
              style={{ opacity: hoveredNodeId ? (isConnected ? 1 : 0.1) : 1 }}
            />
          );
        })}
      </svg>

      {/* 🟩 매체 노드 */}
      {nodes.filter(n => n.type === 'media').map((node) => (
        <motion.div
          key={node.id}
          drag
          dragMomentum={false}
          layout={false}
          className="absolute z-10 bg-green-600 text-white px-4 py-2 rounded shadow-lg text-sm"
          onMouseEnter={() => setHoveredNodeId(node.id)}
          onMouseLeave={() => setHoveredNodeId(null)}
          style={getStyle(node)}
          onDrag={(e, info) => handleDrag(node, info)}
        >
          [{node.label}]
        </motion.div>
      ))}

      {/* 🟦 프로젝트 노드 */}
      {nodes.filter(n => n.type === 'project').map((node) => (
        <motion.div
          key={node.id}
          drag
          dragMomentum={false}
          layout={false}
          className="absolute z-10 text-white text-xs"
          onMouseEnter={() => setHoveredNodeId(node.id)}
          onMouseLeave={() => setHoveredNodeId(null)}
          style={getStyle(node)}
          onDrag={(e, info) => handleDrag(node, info)}
        >
          <div className="flex items-center">
            <span className="text-6xl font-light">（</span>
            <img
              src={`/images/${node.id}_thumbnail.png`}
              alt={node.label}
              width={THUMB_WIDTH}
              height={THUMB_HEIGHT}
              className="pointer-events-none w-28 h-auto object-contain"
            />
            <span className="text-6xl font-light">）</span>
          </div>
          <div className="mt-2 text-sm font-light text-center max-w-[200px]">
            {node.label}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
