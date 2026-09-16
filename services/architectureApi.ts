/**
 * Client API for Target Architecture & GST Compliance Control Tower
 */

export interface ArchitectureNode {
  id: string;
  name: string;
  layer: string;
  status: 'ACTIVE' | 'PROCESSING' | 'DEGRADED' | 'ERROR';
  latencyMs: number;
  uptime: string;
}

export interface ArchitectureEventItem {
  eventId: string;
  eventType: string;
  timestamp: string;
  tenantId: string;
  traceId: string;
  source: string;
  payload: any;
  status: 'COMPLETED' | 'PROCESSING' | 'FAILED';
  durationMs?: number;
}

export const executeArchitecturePipeline = async (payload: any) => {
  const res = await fetch('/api/v1/architecture/pipeline/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to execute architecture pipeline');
  }
  return res.json();
};

export const fetchArchitectureNodesStatus = async (): Promise<ArchitectureNode[]> => {
  const res = await fetch('/api/v1/architecture/nodes/status');
  if (!res.ok) throw new Error('Failed to fetch architecture nodes status');
  const data = await res.json();
  return data.nodes;
};

export const fetchEventBusHistory = async (limit = 30): Promise<{ history: ArchitectureEventItem[]; metrics: any }> => {
  const res = await fetch(`/api/v1/architecture/eventbus/history?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch event bus history');
  return res.json();
};

export const fetchComplianceLedger = async (limit = 20) => {
  const res = await fetch(`/api/v1/architecture/ledger?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch compliance ledger');
  const data = await res.json();
  return data.ledger;
};

export interface PortalHealthItem {
  id: string;
  name: string;
  endpoint: string;
  status: 'ACTIVE' | 'DEGRADED' | 'OFFLINE';
  currentLatencyMs: number;
  avgLatencyMs: number;
  uptimeSla: number;
  totalRequests24h: number;
  successRate: number;
  lastChecked: string;
  historicalTrend: Array<{ time: string; latency: number }>;
}

export interface SyncLogEntry {
  timestamp: string;
  portalId: string;
  portalName: string;
  status: 'ACTIVE' | 'DEGRADED' | 'OFFLINE';
  latencyMs: number;
  message: string;
}

export interface PortalSyncPayload {
  portals: PortalHealthItem[];
  logs: SyncLogEntry[];
}

export const fetchPersistenceHealth = async () => {
  const res = await fetch('/api/v1/architecture/persistence/health');
  if (!res.ok) throw new Error('Failed to fetch persistence health');
  const data = await res.json();
  return data.health;
};

export const fetchPortalIntegrationHealth = async (): Promise<PortalSyncPayload> => {
  const res = await fetch('/api/v1/architecture/portals/health');
  if (!res.ok) throw new Error('Failed to fetch portal integration health');
  const data = await res.json();
  return {
    portals: data.portals || [],
    logs: data.logs || []
  };
};
