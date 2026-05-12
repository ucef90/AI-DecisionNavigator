"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import type { PositionedGraph, PositionedNode } from "@/lib/engines/cartography";

// Renders one positioned graph as inline SVG.
//
// The renderer is intentionally low-level (no D3, no Cytoscape) — it is
// enough to display cartographies in a B2B SaaS report and lets us
// server-render the SVG when needed (PDF export). Future iteration can
// swap in a richer interactive layer (zoom/pan/edit) without changing the
// data model produced by the cartography engine.

const NODE_FILL: Record<string, string> = {
  NEED: "fill-amber-100 stroke-amber-600",
  USER: "fill-sky-100 stroke-sky-600",
  PROCESS: "fill-zinc-100 stroke-zinc-600",
  DATA_SOURCE: "fill-violet-100 stroke-violet-600",
  DATA_FLOW: "fill-violet-50 stroke-violet-500",
  APP: "fill-slate-100 stroke-slate-600",
  API: "fill-slate-50 stroke-slate-500",
  TECH: "fill-blue-100 stroke-blue-600",
  RISK: "fill-rose-100 stroke-rose-600",
  CONTROL: "fill-emerald-100 stroke-emerald-600",
  ROLE: "fill-indigo-100 stroke-indigo-600",
  DECISION: "fill-foreground stroke-foreground",
};

const SEVERITY_RING: Record<string, string> = {
  CRITICAL: "stroke-destructive",
  WARNING: "stroke-amber-500",
  INFO: "",
};

export function GraphCanvas({ graph }: { graph: PositionedGraph }) {
  const [hoverId, setHoverId] = useState<string | null>(null);

  if (graph.nodes.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        {graph.emptyReason ?? "Cartographie non disponible — données insuffisantes."}
      </div>
    );
  }

  const nodeById = new Map(graph.nodes.map((n) => [n.id, n]));

  return (
    <div className="overflow-x-auto rounded-md border border-border bg-background">
      <svg
        viewBox={`0 0 ${graph.width} ${graph.height}`}
        className="block h-auto w-full"
        role="img"
        aria-label={graph.title}
      >
        <defs>
          <marker
            id="arrow"
            viewBox="0 -5 10 10"
            refX="8"
            refY="0"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M0,-5L10,0L0,5" className="fill-muted-foreground" />
          </marker>
        </defs>

        {graph.edges.map((e) => {
          const src = nodeById.get(e.source);
          const tgt = nodeById.get(e.target);
          if (!src || !tgt) return null;
          const trimmed = trimToCircle(src, tgt);
          const isHi = hoverId === e.source || hoverId === e.target;
          return (
            <g key={e.id} className={cn(isHi ? "opacity-100" : "opacity-60")}>
              <line
                x1={src.x}
                y1={src.y}
                x2={trimmed.x}
                y2={trimmed.y}
                className="stroke-muted-foreground"
                strokeWidth={1.2}
                markerEnd="url(#arrow)"
              />
              {e.label ? (
                <text
                  x={(src.x + tgt.x) / 2}
                  y={(src.y + tgt.y) / 2 - 4}
                  className="fill-muted-foreground"
                  style={{ fontSize: 9 }}
                  textAnchor="middle"
                >
                  {e.label}
                </text>
              ) : null}
            </g>
          );
        })}

        {graph.nodes.map((n) => (
          <NodeShape
            key={n.id}
            n={n}
            highlighted={hoverId === n.id}
            onEnter={() => setHoverId(n.id)}
            onLeave={() => setHoverId(null)}
          />
        ))}
      </svg>

      {hoverId
        ? (() => {
            const n = nodeById.get(hoverId);
            if (!n || !n.description) return null;
            return (
              <div className="border-t border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                <strong className="text-foreground">{n.label}</strong> — {n.description}
              </div>
            );
          })()
        : null}
    </div>
  );
}

function NodeShape({
  n,
  highlighted,
  onEnter,
  onLeave,
}: {
  n: PositionedNode;
  highlighted: boolean;
  onEnter: () => void;
  onLeave: () => void;
}) {
  const fill = NODE_FILL[n.category] ?? "fill-zinc-100 stroke-zinc-600";
  const ring = SEVERITY_RING[n.severity ?? "INFO"] ?? "";
  return (
    <g
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="cursor-pointer"
    >
      {ring ? (
        <circle
          cx={n.x}
          cy={n.y}
          r={n.r + 3}
          className={cn("fill-transparent", ring)}
          strokeWidth={1.5}
        />
      ) : null}
      <circle
        cx={n.x}
        cy={n.y}
        r={n.r}
        className={cn(fill, highlighted ? "opacity-100" : "opacity-95")}
        strokeWidth={highlighted ? 2 : 1.5}
      />
      <text
        x={n.x}
        y={n.y + n.r + 12}
        textAnchor="middle"
        className="fill-foreground"
        style={{ fontSize: 10 }}
      >
        {truncate(n.label, 28)}
      </text>
    </g>
  );
}

// Stop the line just before the target circle so the arrow head doesn't
// overlap the node.
function trimToCircle(
  src: { x: number; y: number },
  tgt: { x: number; y: number; r: number },
): { x: number; y: number } {
  const dx = tgt.x - src.x;
  const dy = tgt.y - src.y;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const ratio = (dist - tgt.r - 4) / dist;
  return {
    x: src.x + dx * ratio,
    y: src.y + dy * ratio,
  };
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
}
