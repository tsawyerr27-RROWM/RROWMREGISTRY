"use client";

import { useEffect, useRef } from "react";

import { useFieldMotion } from "@/hooks/useFieldMotion";
import {
  buildSignalLattice,
  latticeNodeCountForWidth,
  type LatticeEdge,
  type LatticeNode,
  type SignalLattice,
} from "@/lib/field-signal-lattice";
import { fieldSignature } from "@/styles/field-signature";

type PulsePath = {
  edgeIndices: number[];
  progress: number;
  durationMs: number;
  elapsedMs: number;
};

function edgeLength(
  edges: LatticeEdge[],
  nodes: LatticeNode[],
  edgeIndex: number
): number {
  const edge = edges[edgeIndex];
  if (!edge) return 0;
  return dist(nodes[edge.from], nodes[edge.to]);
}

function dist(a: LatticeNode, b: LatticeNode): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function pathLength(
  edges: LatticeEdge[],
  nodes: LatticeNode[],
  edgeIndices: number[]
): number {
  return edgeIndices.reduce(
    (sum, index) => sum + edgeLength(edges, nodes, index),
    0
  );
}

function pickPulsePath(
  lattice: SignalLattice,
  rand: () => number
): PulsePath | null {
  if (lattice.edges.length < 2) return null;

  const startEdge = Math.floor(rand() * lattice.edges.length);
  const hops = 2 + Math.floor(rand() * 2);
  const edgeIndices = [startEdge];
  let current = lattice.edges[startEdge]?.to ?? 0;

  for (let hop = 1; hop < hops; hop += 1) {
    const candidates = lattice.edges
      .map((edge, index) => ({ edge, index }))
      .filter(({ edge }) => edge.from === current || edge.to === current);

    if (candidates.length === 0) break;

    const next = candidates[Math.floor(rand() * candidates.length)];
    edgeIndices.push(next.index);
    current = next.edge.from === current ? next.edge.to : next.edge.from;
  }

  return {
    edgeIndices,
    progress: 0,
    durationMs: 4000 + rand() * 4000,
    elapsedMs: rand() * 2000,
  };
}

function drawLatticeFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  lattice: SignalLattice,
  pulses: PulsePath[],
  staticOnly: boolean
) {
  ctx.clearRect(0, 0, width, height);

  const toX = (x: number) => x * width;
  const toY = (y: number) => y * height;

  ctx.lineWidth = 1;
  for (const edge of lattice.edges) {
    const a = lattice.nodes[edge.from];
    const b = lattice.nodes[edge.to];
    if (!a || !b) continue;
    ctx.strokeStyle = "rgba(210, 218, 230, 0.07)";
    ctx.beginPath();
    ctx.moveTo(toX(a.x), toY(a.y));
    ctx.lineTo(toX(b.x), toY(b.y));
    ctx.stroke();
  }

  for (const node of lattice.nodes) {
    ctx.fillStyle = "rgba(228, 232, 240, 0.22)";
    ctx.beginPath();
    ctx.arc(toX(node.x), toY(node.y), 1.1, 0, Math.PI * 2);
    ctx.fill();
  }

  if (staticOnly) return;

  for (const pulse of pulses) {
    const total = pathLength(lattice.edges, lattice.nodes, pulse.edgeIndices);
    if (total <= 0) continue;

    let remaining = pulse.progress * total;
    const glow = 0.22 + Math.sin(pulse.progress * Math.PI) * 0.18;

    for (const edgeIndex of pulse.edgeIndices) {
      const edge = lattice.edges[edgeIndex];
      if (!edge) continue;
      const a = lattice.nodes[edge.from];
      const b = lattice.nodes[edge.to];
      if (!a || !b) continue;

      const len = dist(a, b);
      if (remaining >= len) {
        remaining -= len;
        continue;
      }

      const t = len > 0 ? remaining / len : 0;
      const px = a.x + (b.x - a.x) * t;
      const py = a.y + (b.y - a.y) * t;
      const tail = Math.max(0, t - 0.08 / Math.max(len, 0.001));

      ctx.strokeStyle = `rgba(180, 200, 255, ${glow})`;
      ctx.beginPath();
      ctx.moveTo(toX(a.x + (b.x - a.x) * tail), toY(a.y + (b.y - a.y) * tail));
      ctx.lineTo(toX(px), toY(py));
      ctx.stroke();

      ctx.fillStyle = `rgba(220, 230, 255, ${glow + 0.12})`;
      ctx.beginPath();
      ctx.arc(toX(px), toY(py), 1.6, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }
}

export function FieldSignalCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const latticeRef = useRef<SignalLattice | null>(null);
  const pulsesRef = useRef<PulsePath[]>([]);
  const sizeRef = useRef({ width: 0, height: 0 });
  const { motionEnabled } = useFieldMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    let raf = 0;
    let lastTs = 0;
    let randState = 0x5d1c >>> 0;
    const rand = () => {
      randState = (randState * 1664525 + 1013904223) >>> 0;
      return randState / 0xffffffff;
    };

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      sizeRef.current = { width, height };
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const count = latticeNodeCountForWidth(width);
      latticeRef.current = buildSignalLattice(count);
      pulsesRef.current = motionEnabled
        ? Array.from({ length: 4 }, () => pickPulsePath(latticeRef.current!, rand)).filter(
            (p): p is PulsePath => p !== null
          )
        : [];
    };

    const draw = (ts: number) => {
      const ctx = canvas.getContext("2d");
      const lattice = latticeRef.current;
      if (!ctx || !lattice) return;

      const { width, height } = sizeRef.current;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (motionEnabled) {
        const delta = lastTs ? ts - lastTs : 0;
        lastTs = ts;

        for (const pulse of pulsesRef.current) {
          pulse.elapsedMs += delta;
          pulse.progress = (pulse.elapsedMs % pulse.durationMs) / pulse.durationMs;
        }

        if (pulsesRef.current.length < 4 && rand() > 0.992) {
          const next = pickPulsePath(lattice, rand);
          if (next) pulsesRef.current.push(next);
        }
        if (pulsesRef.current.length > 5) {
          pulsesRef.current.shift();
        }
      }

      drawLatticeFrame(ctx, width, height, lattice, pulsesRef.current, !motionEnabled);
    };

    const loop = (ts: number) => {
      draw(ts);
      if (motionEnabled) {
        raf = requestAnimationFrame(loop);
      }
    };

    resize();
    draw(0);

    const observer = new ResizeObserver(() => {
      resize();
      if (!motionEnabled) draw(0);
    });
    observer.observe(parent);

    if (motionEnabled) {
      raf = requestAnimationFrame(loop);
    }

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [motionEnabled]);

  return (
    <canvas
      ref={canvasRef}
      className={fieldSignature.surfaces.signalCanvas}
      aria-hidden
    />
  );
}
