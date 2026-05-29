export interface Monitor {
  id: string;
  name: string;
  url: string;
  http_method: string;
  expected_status_code: number;
  check_interval_minutes: number;
  environment: "dev" | "staging" | "prod";
  description: string | null;
  current_status: "healthy" | "degraded" | "down" | "unknown";
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface MonitorCreate {
  name: string;
  url: string;
  http_method: string;
  expected_status_code: number;
  check_interval_minutes: number;
  environment: "dev" | "staging" | "prod";
  description?: string;
}

export interface HealthCheck {
  id: string;
  monitor_id: string;
  status: "healthy" | "degraded" | "down" | "unknown";
  http_status_code: number | null;
  response_time_ms: number | null;
  error_message: string | null;
  checked_at: string;
}

export interface Incident {
  id: string;
  monitor_id: string;
  status: "ongoing" | "resolved";
  started_at: string;
  resolved_at: string | null;
  duration_seconds: number | null;
  reason: string | null;
}

export interface MonitorDashboardItem {
  id: string;
  name: string;
  url: string;
  environment: "dev" | "staging" | "prod";
  current_status: "healthy" | "degraded" | "down" | "unknown";
  latest_response_time_ms: number | null;
  uptime_percentage: number;
  last_checked_at: string | null;
}

export interface DashboardResponse {
  monitors: MonitorDashboardItem[];
  total_monitors: number;
  healthy_count: number;
  degraded_count: number;
  down_count: number;
}

export interface StatusPageMonitor {
  name: string;
  url: string;
  environment: "dev" | "staging" | "prod";
  current_status: "healthy" | "degraded" | "down" | "unknown";
  uptime_percentage: number;
}

export interface StatusPageResponse {
  overall_status: "All Systems Operational" | "Partial Outage" | "Major Outage";
  monitors: StatusPageMonitor[];
}

export interface User {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
}
