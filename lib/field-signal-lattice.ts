export type LatticeNode = { x: number; y: number };
export type LatticeEdge = { from: number; to: number };

export type SignalLattice = {
  nodes: LatticeNode[];
  edges: LatticeEdge[];
};

function dist(a: LatticeNode, b: LatticeNode): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/** Deterministic-ish placement from index — stable across resize regen if count unchanged. */
function nodePoint(index: number, total: number, rand: () => number): LatticeNode {
  const band = index / Math.max(1, total - 1);
  const x = 0.08 + band * 0.84 + (rand() - 0.5) * 0.12;
  const y = 0.1 + rand() * 0.75;
  return {
    x: Math.min(0.94, Math.max(0.06, x)),
    y: Math.min(0.9, Math.max(0.08, y)),
  };
}

export function buildSignalLattice(nodeCount: number, seed = 0x5d1c): SignalLattice {
  let state = seed >>> 0;
  const rand = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };

  const nodes: LatticeNode[] = [];
  for (let i = 0; i < nodeCount; i += 1) {
    nodes.push(nodePoint(i, nodeCount, rand));
  }

  const edges: LatticeEdge[] = [];
  const edgeKeys = new Set<string>();

  for (let i = 0; i < nodes.length; i += 1) {
    const nearest = nodes
      .map((node, j) => ({ j, d: i === j ? Infinity : dist(nodes[i], node) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 3);

    for (const { j, d } of nearest) {
      if (d > 0.28) continue;
      const a = Math.min(i, j);
      const b = Math.max(i, j);
      const key = `${a}:${b}`;
      if (edgeKeys.has(key)) continue;
      edgeKeys.add(key);
      edges.push({ from: a, to: b });
    }
  }

  return { nodes, edges };
}

export function latticeNodeCountForWidth(width: number): number {
  if (width < 768) return 12;
  if (width < 1200) return 22;
  return 28;
}
