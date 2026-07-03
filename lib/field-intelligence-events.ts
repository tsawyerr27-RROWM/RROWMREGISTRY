export type ClusterId = "records" | "creatives" | "organisations" | "opportunities";

export type FieldIntelEvent =
  | { type: "pulse_complete"; edgeId: string }
  | { type: "idle_packet"; edgeId: string }
  | { type: "node_activation"; clusterId: ClusterId | null }
  | { type: "search_focus"; focused: boolean }
  | { type: "signal_alert"; severity: "normal" | "attention" | "high" };

const EDGE_CLUSTERS: Record<string, readonly [ClusterId, ClusterId]> = {
  "records-creatives": ["records", "creatives"],
  "records-organisations": ["records", "organisations"],
  "creatives-opportunities": ["creatives", "opportunities"],
  "organisations-opportunities": ["organisations", "opportunities"],
};

export type FieldIntelSnapshot = {
  activeCluster: ClusterId | null;
  searchFocus: boolean;
  flashingRails: Partial<Record<ClusterId, number>>;
  litAnchors: Partial<Record<ClusterId, number>>;
  litEdges: Partial<Record<string, number>>;
  syncPulseUntil: number;
  signalAlertUntil: number;
  signalSeverity: "normal" | "attention" | "high" | null;
};

const FLASH_MS = 420;
const ANCHOR_LIT_MS = 480;
const EDGE_LABEL_LIT_MS = 520;
const SIGNAL_ALERT_MS = 480;

let snapshot: FieldIntelSnapshot = {
  activeCluster: null,
  searchFocus: false,
  flashingRails: {},
  litAnchors: {},
  litEdges: {},
  syncPulseUntil: 0,
  signalAlertUntil: 0,
  signalSeverity: null,
};

const listeners = new Set<() => void>();
const expiryTimers = new Set<ReturnType<typeof setTimeout>>();

function notify() {
  listeners.forEach((listener) => listener());
}

function scheduleExpiry(delayMs: number) {
  const timer = setTimeout(() => {
    expiryTimers.delete(timer);
    pruneExpired();
    notify();
  }, delayMs);
  expiryTimers.add(timer);
}

function pruneExpired() {
  const now = Date.now();
  snapshot.flashingRails = Object.fromEntries(
    Object.entries(snapshot.flashingRails).filter(([, until]) => (until ?? 0) > now)
  ) as Partial<Record<ClusterId, number>>;
  snapshot.litAnchors = Object.fromEntries(
    Object.entries(snapshot.litAnchors).filter(([, until]) => (until ?? 0) > now)
  ) as Partial<Record<ClusterId, number>>;
  snapshot.litEdges = Object.fromEntries(
    Object.entries(snapshot.litEdges).filter(([, until]) => (until ?? 0) > now)
  ) as Partial<Record<string, number>>;
  if (snapshot.syncPulseUntil <= now) {
    snapshot.syncPulseUntil = 0;
  }
  if (snapshot.signalAlertUntil <= now) {
    snapshot.signalAlertUntil = 0;
    snapshot.signalSeverity = null;
  }
}

function edgeClusters(edgeId: string): ClusterId[] {
  const clusters = EDGE_CLUSTERS[edgeId];
  return clusters ? [...clusters] : [];
}

function acknowledgeEdge(edgeId: string) {
  const now = Date.now();
  const clusters = edgeClusters(edgeId);

  for (const cluster of clusters) {
    snapshot.flashingRails[cluster] = now + FLASH_MS;
    snapshot.litAnchors[cluster] = now + ANCHOR_LIT_MS;
  }

  snapshot.litEdges[edgeId] = now + EDGE_LABEL_LIT_MS;
  snapshot.syncPulseUntil = now + FLASH_MS;
  scheduleExpiry(EDGE_LABEL_LIT_MS + 20);
}

export function emitFieldIntelEvent(event: FieldIntelEvent) {
  switch (event.type) {
    case "pulse_complete":
    case "idle_packet":
      acknowledgeEdge(event.edgeId);
      break;
    case "node_activation":
      snapshot.activeCluster = event.clusterId;
      if (event.clusterId) {
        const now = Date.now();
        snapshot.litAnchors[event.clusterId] = now + ANCHOR_LIT_MS;
        scheduleExpiry(ANCHOR_LIT_MS + 20);
      }
      break;
    case "search_focus":
      snapshot.searchFocus = event.focused;
      break;
    case "signal_alert":
      if (event.severity !== "normal") {
        const now = Date.now();
        snapshot.signalAlertUntil = now + SIGNAL_ALERT_MS;
        snapshot.signalSeverity = event.severity;
        snapshot.syncPulseUntil = now + FLASH_MS;
        scheduleExpiry(SIGNAL_ALERT_MS + 20);
      }
      break;
  }

  notify();
}

export function subscribeFieldIntel(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getFieldIntelSnapshot(): FieldIntelSnapshot {
  pruneExpired();
  return snapshot;
}

export function isRailFlashing(
  snapshotState: FieldIntelSnapshot,
  cluster: ClusterId
): boolean {
  return (snapshotState.flashingRails[cluster] ?? 0) > Date.now();
}

export function isAnchorLit(
  snapshotState: FieldIntelSnapshot,
  cluster: ClusterId
): boolean {
  if (snapshotState.activeCluster === cluster) return true;
  return (snapshotState.litAnchors[cluster] ?? 0) > Date.now();
}

export function isEdgeLit(
  snapshotState: FieldIntelSnapshot,
  edgeId: string,
  activeCluster: ClusterId | null
): boolean {
  if ((snapshotState.litEdges[edgeId] ?? 0) > Date.now()) return true;
  if (!activeCluster) return false;
  const clusters = EDGE_CLUSTERS[edgeId];
  return clusters
    ? clusters[0] === activeCluster || clusters[1] === activeCluster
    : false;
}
