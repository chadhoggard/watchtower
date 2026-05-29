import {
  Monitor,
  MonitorCreate,
  HealthCheck,
  Incident,
  DashboardResponse,
  StatusPageResponse,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("wt_token");
}

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }

  if (res.status === 204) return null as T;
  return res.json();
}

// Monitors
export async function getMonitors(): Promise<Monitor[]> {
  return fetchApi<Monitor[]>("/api/monitors/");
}

export async function getMonitor(id: string): Promise<Monitor> {
  return fetchApi<Monitor>(`/api/monitors/${id}`);
}

export async function createMonitor(data: MonitorCreate): Promise<Monitor> {
  return fetchApi<Monitor>("/api/monitors/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateMonitor(
  id: string,
  data: Partial<MonitorCreate>,
): Promise<Monitor> {
  return fetchApi<Monitor>(`/api/monitors/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteMonitor(id: string): Promise<void> {
  return fetchApi<void>(`/api/monitors/${id}`, { method: "DELETE" });
}

export async function reorderMonitors(
  items: { id: string; sort_order: number }[],
): Promise<void> {
  return fetchApi<void>("/api/monitors/reorder", {
    method: "PATCH",
    body: JSON.stringify(items),
  });
}

// Health Checks
export async function getHealthChecks(
  monitorId: string,
  limit = 50,
): Promise<HealthCheck[]> {
  return fetchApi<HealthCheck[]>(
    `/api/health-checks/${monitorId}?limit=${limit}`,
  );
}

export async function triggerHealthCheck(
  monitorId: string,
): Promise<HealthCheck> {
  return fetchApi<HealthCheck>(`/api/health-checks/${monitorId}/trigger`, {
    method: "POST",
  });
}

// Incidents
export async function getIncidents(limit = 50): Promise<Incident[]> {
  return fetchApi<Incident[]>(`/api/incidents/?limit=${limit}`);
}

export async function getMonitorIncidents(
  monitorId: string,
  limit = 50,
): Promise<Incident[]> {
  return fetchApi<Incident[]>(`/api/incidents/${monitorId}?limit=${limit}`);
}

// Dashboard
export async function getDashboard(): Promise<DashboardResponse> {
  return fetchApi<DashboardResponse>("/api/dashboard");
}

// Status Page
export async function getStatusPage(): Promise<StatusPageResponse> {
  return fetchApi<StatusPageResponse>("/api/status");
}
