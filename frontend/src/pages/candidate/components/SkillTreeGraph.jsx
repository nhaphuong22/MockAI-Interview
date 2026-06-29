import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { getSkillTreeApi } from "../../../api/skillTreeApi";
import SkillTreeSidePanel from "./SkillTreeSidePanel";

export default function SkillTreeGraph() {
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  // Fetch skill tree data via TanStack Query
  const { data, isLoading, error } = useQuery({
    queryKey: ["skillTree"],
    queryFn: async () => {
      const res = await getSkillTreeApi();
      return res.data; // Response helper wraps it inside res.data
    }
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0ea5e9]"></div>
        <p className="mt-4 dark:text-slate-400 text-gray-500 font-medium">Đang tải cây kỹ năng...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-5xl mb-4">🗺️</div>
        <h3 className="text-lg font-bold dark:text-white text-gray-800">Chưa kích hoạt Cây Kỹ Năng RPG</h3>
        <p className="mt-2 text-sm dark:text-slate-400 text-gray-500 max-w-md">
          Hệ thống sẽ tự động khởi tạo cây kỹ năng cá nhân hóa của bạn dựa trên kỹ năng ATS bóc tách ngay sau khi bạn tải CV lên lần đầu tiên.
        </p>
        <a
          href="/cv-review"
          className="mt-6 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white font-semibold shadow-lg shadow-sky-500/20 hover:opacity-90 transition-all duration-300 text-sm"
        >
          Tải CV lên ngay
        </a>
      </div>
    );
  }

  const { graph_data: graphData } = data;
  const rawNodes = graphData?.nodes || [];
  const links = graphData?.links || [];

  // Calculate coordinates dynamically for nodes that lack x or y
  const nodes = (() => {
    const needsLayout = rawNodes.some(n => n.x === undefined || n.y === undefined);
    if (!needsLayout) {
      return rawNodes;
    }

    const nodesWithLevel = rawNodes.map(n => ({
      ...n,
      level: n.level || (n.x ? (n.x < 250 ? 1 : n.x < 500 ? 2 : 3) : 2)
    }));

    const levelGroups = { 1: [], 2: [], 3: [] };
    nodesWithLevel.forEach(n => {
      const lvl = n.level === 1 || n.level === 2 || n.level === 3 ? n.level : 2;
      levelGroups[lvl].push(n);
    });

    const xCoordinates = {
      1: 160,
      2: 400,
      3: 640
    };

    return nodesWithLevel.map(n => {
      const lvl = n.level === 1 || n.level === 2 || n.level === 3 ? n.level : 2;
      const group = levelGroups[lvl];
      const index = group.findIndex(item => item.id === n.id);
      
      const x = n.x !== undefined ? n.x : xCoordinates[lvl];
      
      // Distribute nodes evenly along the Y axis
      const totalNodesInLvl = group.length;
      const height = 450;
      const stepY = height / (totalNodesInLvl + 1);
      const y = n.y !== undefined ? n.y : (index + 1) * stepY;

      return { ...n, x, y };
    });
  })();

  // Helper to find node by id
  const findNode = (id) => nodes.find((n) => n.id === id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b dark:border-white/5 border-gray-100 pb-4">
        <div>
          <h3 className="text-xl font-bold dark:text-white text-gray-800 flex items-center gap-2">
            <span>⚔️</span> Cây Kỹ Năng RPG: <span className="text-[#0ea5e9]">{graphData.track}</span>
          </h3>
          <p className="text-xs dark:text-slate-400 text-gray-500 mt-1">
            Luyện tập phỏng vấn các kỹ năng để tích luỹ điểm số và mở khoá các nút kỹ năng tiếp theo!
          </p>
        </div>
        
        {/* Legends */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] shadow-md shadow-sky-500/20"></span>
            <span className="dark:text-slate-300 text-gray-600">Đã mở khoá (Unlocked)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full dark:bg-slate-700 bg-gray-300"></span>
            <span className="dark:text-slate-400 text-gray-500">Chưa mở khoá (Locked)</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="relative w-full aspect-[800/450] dark:bg-[#0b1329] bg-slate-50 rounded-2xl border dark:border-white/5 border-gray-200 overflow-hidden shadow-inner">
        <svg 
          viewBox="0 0 800 450" 
          width="100%" 
          height="100%" 
          className="w-full h-full select-none"
        >
          {/* Definitions for Gradients, Shadows, Glows */}
          <defs>
            {/* Ocean Blue Unlocked Gradient */}
            <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>

            {/* Locked Node Grayscale Gradient */}
            <linearGradient id="lockedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#475569" stopOpacity="0.8" />
            </linearGradient>

            {/* Glowing filter for unlocked nodes */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Grid Background Pattern */}
          <g opacity="0.03" stroke="#94a3b8" strokeWidth="1">
            {Array.from({ length: 9 }).map((_, i) => (
              <line key={`v-${i}`} x1={(i + 1) * 80} y1="0" x2={(i + 1) * 80} y2="450" />
            ))}
            {Array.from({ length: 5 }).map((_, i) => (
              <line key={`h-${i}`} x1="0" y1={(i + 1) * 75} x2="800" y2={(i + 1) * 75} />
            ))}
          </g>

          {/* 1. DRAW LINKS (EDGES) */}
          <g>
            {links.map((link, idx) => {
              const source = findNode(link.source);
              const target = findNode(link.target);

              if (!source || !target) return null;

              const isTargetUnlocked = target.status === "unlocked";
              const midX = (source.x + target.x) / 2;
              const pathData = `M ${source.x} ${source.y} C ${midX} ${source.y}, ${midX} ${target.y}, ${target.x} ${target.y}`;

              return (
                <path
                  key={`link-${idx}`}
                  d={pathData}
                  fill="none"
                  stroke={isTargetUnlocked ? "#0ea5e9" : "#94a3b8"}
                  strokeOpacity={isTargetUnlocked ? 0.7 : 0.3}
                  strokeWidth={isTargetUnlocked ? 3 : 2}
                  strokeDasharray={isTargetUnlocked ? "none" : "5,5"}
                  className="transition-all duration-500"
                />
              );
            })}
          </g>

          {/* 2. DRAW NODES */}
          <g>
            {nodes.map((node) => {
              const isUnlocked = node.status === "unlocked";
              const isSelected = selectedNodeId === node.id;

              return (
                <g
                  key={`node-${node.id}`}
                  transform={`translate(${node.x}, ${node.y})`}
                  className="cursor-pointer group"
                  onClick={() => setSelectedNodeId(node.id)}
                >
                  {/* Selection Indicator Ring */}
                  {isSelected && (
                    <circle
                      r="33"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      strokeDasharray="4,4"
                      className="animate-[spin_12s_linear_infinite]"
                    />
                  )}

                  {/* Outer shadow/glow circle for Unlocked Nodes (Only glow when score > 0) */}
                  {isUnlocked && node.score > 0 && (
                    <circle
                      r="25"
                      fill="#0ea5e9"
                      opacity="0.25"
                      filter="url(#glow)"
                      className="transition-all duration-300 group-hover:opacity-40"
                    />
                  )}

                  {/* Core Node Circle */}
                  <circle
                    r="22"
                    fill={isUnlocked ? (node.score > 0 ? "url(#oceanGradient)" : "rgba(14, 165, 233, 0.1)") : "#e2e8f0"}
                    stroke={isUnlocked ? "#0ea5e9" : "#cbd5e1"}
                    strokeWidth={isUnlocked ? 2 : 1}
                    className="transition-all duration-300 group-hover:stroke-white dark:fill-slate-800 dark:stroke-slate-700"
                    style={{
                      fill: isUnlocked ? (node.score > 0 ? "url(#oceanGradient)" : "rgba(14, 165, 233, 0.1)") : undefined,
                    }}
                  />

                  {/* Icon/Badge indicator */}
                  {isUnlocked ? (
                    node.score > 0 ? (
                      // Unlocked Score Text
                      <text
                        textAnchor="middle"
                        dy=".3em"
                        className="text-[10px] font-bold fill-white"
                      >
                        {node.score}
                      </text>
                    ) : (
                      // Unlocked but not practiced: Show Sword to challenge
                      <text
                        textAnchor="middle"
                        dy=".3em"
                        className="text-[11px] font-bold fill-[#0ea5e9] group-hover:fill-white"
                      >
                        ⚔️
                      </text>
                    )
                  ) : (
                    // Locked Padlock Icon
                    <path
                      d="M-4 -2 h8 v6 h-8 z M-2.5 -2 v-2.5 a2.5 2.5 0 0 1 5 0 v2.5"
                      fill="none"
                      stroke="#94a3b8"
                      strokeWidth="1.2"
                      transform="scale(0.8) translate(-0.5, -1)"
                    />
                  )}

                  {/* Node Label Text */}
                  <text
                    y="36"
                    textAnchor="middle"
                    className="text-xs font-bold dark:fill-slate-300 fill-slate-700 transition-colors group-hover:fill-[#0ea5e9]"
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Side Panel trượt mở bằng Framer Motion */}
      <AnimatePresence>
        {selectedNodeId && (
          <SkillTreeSidePanel
            nodeId={selectedNodeId}
            nodeLabel={findNode(selectedNodeId)?.label || ""}
            status={findNode(selectedNodeId)?.status || "locked"}
            score={findNode(selectedNodeId)?.score || 0}
            onClose={() => setSelectedNodeId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
