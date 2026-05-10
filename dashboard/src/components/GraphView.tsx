import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Share2, Zap, LayoutGrid, Search, X, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchGraph, fetchPage } from '../api';
import type { GraphNode, GraphEdge, PageData } from '../types';

const TYPE_COLORS: Record<string, string> = {
  paper: '#6c8aff',
  entity: '#5ec4a0',
  concept: '#e8a855',
  query: '#c084fc',
  plan: '#f472b6',
  experiment: '#fb923c',
  handoff: '#94a3b8',
};

const NODE_RADIUS = 12;
const SIMULATION_ITERATIONS = 120;
const ATTRACT_FORCE = 0.005;
const REPEL_FORCE = 800;
const CENTER_FORCE = 0.01;
const DAMPING = 0.85;
const MAX_LABEL_LEN = 25;

interface NodePosition {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

function runForceSimulation(
  nodes: GraphNode[],
  edges: GraphEdge[],
  width: number,
  height: number
): Map<string, NodePosition> {
  const positions = new Map<string, NodePosition>();
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.35;

  nodes.forEach((node, i) => {
    const angle = (2 * Math.PI * i) / nodes.length;
    positions.set(node.id, {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
      vx: 0,
      vy: 0,
    });
  });

  const edgeMap = new Map<string, Set<string>>();
  edges.forEach((e) => {
    if (!edgeMap.has(e.source)) edgeMap.set(e.source, new Set());
    if (!edgeMap.has(e.target)) edgeMap.set(e.target, new Set());
    edgeMap.get(e.source)!.add(e.target);
    edgeMap.get(e.target)!.add(e.source);
  });

  for (let iter = 0; iter < SIMULATION_ITERATIONS; iter++) {
    for (let i = 0; i < nodes.length; i++) {
      const ni = nodes[i];
      const pi = positions.get(ni.id)!;
      let fx = 0;
      let fy = 0;

      for (let j = 0; j < nodes.length; j++) {
        if (i === j) continue;
        const nj = nodes[j];
        const pj = positions.get(nj.id)!;
        let dx = pi.x - pj.x;
        let dy = pi.y - pj.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 1) dist = 1;
        const repel = REPEL_FORCE / (dist * dist);
        fx += (dx / dist) * repel;
        fy += (dy / dist) * repel;

        const connected = edgeMap.get(ni.id)?.has(nj.id);
        if (connected) {
          fx -= dx * ATTRACT_FORCE;
          fy -= dy * ATTRACT_FORCE;
        }
      }

      fx += (cx - pi.x) * CENTER_FORCE;
      fy += (cy - pi.y) * CENTER_FORCE;

      pi.vx = (pi.vx + fx) * DAMPING;
      pi.vy = (pi.vy + fy) * DAMPING;
    }

    nodes.forEach((node) => {
      const p = positions.get(node.id)!;
      p.x += p.vx;
      p.y += p.vy;
    });
  }

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  positions.forEach((p) => {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  });

  const gw = maxX - minX || 1;
  const gh = maxY - minY || 1;
  const scaleX = (width * 0.85) / gw;
  const scaleY = (height * 0.85) / gh;
  const scale = Math.min(scaleX, scaleY);
  const offX = cx - ((minX + maxX) / 2) * scale;
  const offY = cy - ((minY + maxY) / 2) * scale;

  positions.forEach((p) => {
    p.x = p.x * scale + offX;
    p.y = p.y * scale + offY;
    p.vx = 0;
    p.vy = 0;
  });

  return positions;
}

export default function GraphView() {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [positions, setPositions] = useState<Map<string, NodePosition>>(new Map());
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [pageLoading, setPageLoading] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 800, h: 600 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDims({ w: width || 800, h: height || 600 });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchGraph();
      setNodes(data.nodes);
      setEdges(data.edges);
    } catch {
      setNodes([]);
      setEdges([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const computeLayout = useCallback((ns: GraphNode[], es: GraphEdge[]) => {
    if (ns.length === 0) return new Map<string, NodePosition>();
    return runForceSimulation(ns, es, dims.w, dims.h);
  }, [dims.w, dims.h]);

  useEffect(() => {
    const filteredNodes = typeFilter
      ? nodes.filter((n) => n.type === typeFilter)
      : nodes;
    const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));
    const filteredEdges = edges.filter(
      (e) => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target)
    );
    setPositions(computeLayout(filteredNodes, filteredEdges));
  }, [nodes, edges, typeFilter, computeLayout]);

  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedNode(node);
    setPageLoading(true);
    fetchPage(node.filePath).then((data) => {
      setPageData(data.page);
      setPageLoading(false);
    }).catch(() => {
      setPageData(null);
      setPageLoading(false);
    });
  }, []);

  const handleAutoLayout = useCallback(() => {
    const filteredNodes = typeFilter
      ? nodes.filter((n) => n.type === typeFilter)
      : nodes;
    const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));
    const filteredEdges = edges.filter(
      (e) => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target)
    );
    setPositions(computeLayout(filteredNodes, filteredEdges));
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [nodes, edges, typeFilter, computeLayout]);

  const handleRecenter = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.min(3, Math.max(0.2, z - e.deltaY * 0.001)));
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(3, z + 0.2));
  }, []);

  const displayedNodes = useMemo(() => {
    if (!typeFilter) return nodes;
    return nodes.filter((n) => n.type === typeFilter);
  }, [nodes, typeFilter]);

  const displayedEdges = useMemo(() => {
    const ids = new Set(displayedNodes.map((n) => n.id));
    return edges.filter((e) => ids.has(e.source) && ids.has(e.target));
  }, [displayedNodes, edges]);

  const visibleItems = useMemo(() => {
    if (zoom > 0.5) return { nodes: displayedNodes, edges: displayedEdges };
    const vpLeft = -pan.x / zoom - 100;
    const vpTop = -pan.y / zoom - 100;
    const vpRight = vpLeft + dims.w / zoom + 200;
    const vpBottom = vpTop + dims.h / zoom + 200;
    const vn = displayedNodes.filter((n) => {
      const p = positions.get(n.id);
      if (!p) return false;
      return p.x >= vpLeft && p.x <= vpRight && p.y >= vpTop && p.y <= vpBottom;
    });
    const ids = new Set(vn.map((n) => n.id));
    const ve = displayedEdges.filter((e) => ids.has(e.source) && ids.has(e.target));
    return { nodes: vn, edges: ve };
  }, [displayedNodes, displayedEdges, positions, zoom, pan, dims]);

  const handleCloseEditor = useCallback(() => {
    setSelectedNode(null);
    setPageData(null);
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3 text-on-surface-variant">
          <div className="w-8 h-8 border-2 border-on-surface-variant border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-bold uppercase tracking-widest">Loading graph...</p>
        </div>
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-surface code-canvas">
        <div className="flex flex-col items-center gap-4 text-on-surface-variant max-w-md text-center px-8">
          <Share2 size={48} className="opacity-30" />
          <p className="text-lg font-semibold text-on-surface">No pages yet</p>
          <p className="text-sm">Start by adding papers, entities, or concepts to your research wiki.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      <div
        className={`flex-1 flex flex-col bg-surface overflow-hidden transition-all duration-300 ${selectedNode ? '' : ''}`}
        ref={containerRef}
      >
        <div className="flex-1 code-canvas relative">
          <div className="absolute top-6 left-8 z-10 space-y-1">
            <h2 className="text-xl font-black text-black tracking-widest uppercase">Knowledge Graph</h2>
            <p className="text-on-surface-variant font-bold text-[10px] uppercase tracking-widest">
              Visualizing {displayedNodes.length} node{displayedNodes.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="absolute top-6 right-8 z-10 flex gap-2">
            {Object.entries(TYPE_COLORS).map(([type, color]) => (
              <button
                key={type}
                onClick={() => setTypeFilter(typeFilter === type ? null : type)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border transition-all ${
                  typeFilter === type
                    ? 'bg-white shadow-sm border-outline-variant'
                    : 'bg-white/50 border-transparent hover:bg-white hover:border-outline-variant'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                {type}
              </button>
            ))}
          </div>

          <svg
            className="w-full h-full"
            viewBox={`${-pan.x} ${-pan.y} ${dims.w / zoom} ${dims.h / zoom}`}
            onWheel={handleWheel}
            style={{ cursor: 'grab' }}
          >
            <g>
              {visibleItems.edges.map((edge, i) => {
                const sp = positions.get(edge.source);
                const tp = positions.get(edge.target);
                if (!sp || !tp) return null;
                return (
                  <line
                    key={`e-${i}`}
                    x1={sp.x}
                    y1={sp.y}
                    x2={tp.x}
                    y2={tp.y}
                    stroke="#CBD5E1"
                    strokeWidth={1 / zoom}
                    opacity={0.5}
                  />
                );
              })}
            </g>
            <g>
              {visibleItems.nodes.map((node) => {
                const p = positions.get(node.id);
                if (!p) return null;
                const color = TYPE_COLORS[node.type] || '#94a3b8';
                const isSelected = selectedNode?.id === node.id;
                return (
                  <g
                    key={node.id}
                    className="cursor-pointer"
                    onClick={() => handleNodeClick(node)}
                  >
                    {isSelected && (
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={NODE_RADIUS + 4 / zoom}
                        fill="none"
                        stroke={color}
                        strokeWidth={2 / zoom}
                        opacity={0.5}
                      />
                    )}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={NODE_RADIUS / zoom > 4 ? NODE_RADIUS : NODE_RADIUS * (4 / NODE_RADIUS)}
                      fill={isSelected ? color : '#ffffff'}
                      stroke={color}
                      strokeWidth={2 / zoom}
                      style={{ transition: 'fill 0.15s' }}
                    />
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={NODE_RADIUS * 0.45}
                      fill={isSelected ? '#ffffff' : color}
                      style={{ transition: 'fill 0.15s' }}
                    />
                    <text
                      x={p.x + (NODE_RADIUS + 6 / zoom)}
                      y={p.y + 4 / zoom}
                      fontSize={11 / zoom}
                      fontFamily="inherit"
                      fontWeight={700}
                      fill="#1e293b"
                      className="pointer-events-none"
                    >
                      {node.title.length > MAX_LABEL_LEN
                        ? node.title.slice(0, MAX_LABEL_LEN) + '…'
                        : node.title}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>

          <AnimatePresence>
            {selectedNode && (
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ type: 'tween', duration: 0.25 }}
                className="absolute top-0 right-0 bottom-0 w-[380px] bg-white border-l border-outline shadow-2xl flex flex-col z-20"
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-outline shrink-0">
                  <div className="flex items-center gap-2">
                    <Share2 size={14} className="text-black" />
                    <span className="font-black text-[9px] text-black uppercase tracking-widest">Node Detail</span>
                  </div>
                  <button
                    onClick={handleCloseEditor}
                    className="p-1 hover:bg-surface rounded transition-colors"
                  >
                    <X size={16} className="text-on-surface-variant" />
                  </button>
                </div>

                <div className="flex-1 overflow-auto custom-scrollbar p-6">
                  {pageLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="w-6 h-6 border-2 border-on-surface-variant border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : pageData ? (
                    <div className="space-y-5">
                      <div>
                        <h3 className="text-xl font-black text-black uppercase tracking-tight leading-tight mb-3">
                          {pageData.title}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          <span
                            className="text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border"
                            style={{
                              backgroundColor: (TYPE_COLORS[pageData.type] || '#94a3b8') + '18',
                              color: TYPE_COLORS[pageData.type] || '#94a3b8',
                              borderColor: (TYPE_COLORS[pageData.type] || '#94a3b8') + '30',
                            }}
                          >
                            {pageData.type}
                          </span>
                          {pageData.tags?.map((tag) => (
                            <span
                              key={tag}
                              className="text-[9px] font-bold bg-surface text-on-surface-variant border border-outline px-2 py-0.5 rounded uppercase tracking-wider"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {pageData.date && (
                        <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                          {pageData.date}
                        </div>
                      )}

                      {pageData.body && (
                        <div className="prose prose-sm max-w-none">
                          <p className="font-serif text-sm text-on-surface-variant leading-relaxed whitespace-pre-line">
                            {pageData.body.slice(0, 600)}
                            {pageData.body.length > 600 ? '…' : ''}
                          </p>
                        </div>
                      )}

                      {pageData.wikilinks && pageData.wikilinks.length > 0 && (
                        <div className="pt-4 border-t border-outline">
                          <span className="font-black text-[9px] text-on-surface-variant uppercase tracking-widest block mb-3">
                            Related Links
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {pageData.wikilinks.map((link) => (
                              <span
                                key={link}
                                className="text-[10px] font-bold bg-surface text-primary-accent border border-primary-accent/20 px-2 py-0.5 rounded"
                              >
                                [[{link}]]
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {pageData.frontmatter?.status && (
                        <div className="pt-4 border-t border-outline">
                          <span className="font-black text-[9px] text-on-surface-variant uppercase tracking-widest block mb-2">
                            Status
                          </span>
                          <span className="text-[10px] font-bold bg-primary-accent/10 text-primary-accent border border-primary-accent/20 px-2 py-0.5 rounded uppercase tracking-wider">
                            {pageData.frontmatter.status}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-on-surface-variant">
                      <FileText size={32} className="mb-3 opacity-30" />
                      <p className="text-sm">Could not load page content</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-14 bg-white border-t border-outline flex items-center justify-center z-20 shrink-0">
          <div className="flex items-center gap-1 bg-surface p-1 rounded-md border border-outline">
            <button
              onClick={handleZoomIn}
              className="flex items-center gap-2 px-4 py-1.5 text-[10px] font-bold text-on-surface-variant hover:text-black uppercase tracking-widest transition-colors border-r border-outline"
            >
              <Search size={14} /> Zoom
            </button>
            <button
              onClick={handleRecenter}
              className="flex items-center gap-2 px-4 py-1.5 text-[10px] font-bold text-on-surface-variant hover:text-black uppercase tracking-widest transition-colors border-r border-outline"
            >
              <LayoutGrid size={14} /> Recenter
            </button>
            <button
              onClick={() => setTypeFilter(null)}
              className="flex items-center gap-2 px-4 py-1.5 text-[10px] font-bold text-on-surface-variant hover:text-black uppercase tracking-widest transition-colors border-r border-outline"
            >
              <Share2 size={14} /> Layers
            </button>
            <button
              onClick={handleAutoLayout}
              className="flex items-center gap-2 px-4 py-1.5 text-[10px] font-black text-black uppercase tracking-widest transition-colors"
            >
              <Zap size={14} /> Auto-Layout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}