import { MonitorDashboardItem } from "@/types";
import StatusBadge from "./StatusBadge";

interface MonitorCardProps {
  monitor: MonitorDashboardItem;
}

export default function MonitorCard({ monitor }: MonitorCardProps) {
  const envColors = {
    dev: "bg-blue-100 text-blue-700",
    staging: "bg-purple-100 text-purple-700",
    prod: "bg-orange-100 text-orange-700",
  };

  return (
    <a
      href={`/monitors/${monitor.id}`}
      className="block bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{monitor.name}</h3>
          <p className="text-sm text-gray-500 truncate max-w-[250px]">
            {monitor.url}
          </p>
        </div>
        <StatusBadge status={monitor.current_status} />
      </div>

      <div className="flex items-center gap-3 mt-4">
        <span
          className={`text-xs px-2 py-0.5 rounded font-medium ${envColors[monitor.environment]}`}
        >
          {monitor.environment}
        </span>
        <span className="text-xs text-gray-500">
          {monitor.latest_response_time_ms != null
            ? `${Math.round(monitor.latest_response_time_ms)}ms`
            : "—"}
        </span>
        <span className="text-xs text-gray-500">
          {monitor.uptime_percentage}% uptime
        </span>
      </div>

      {monitor.last_checked_at && (
        <p className="text-xs text-gray-400 mt-3">
          Last checked: {new Date(monitor.last_checked_at).toLocaleString()}
        </p>
      )}
    </a>
  );
}
