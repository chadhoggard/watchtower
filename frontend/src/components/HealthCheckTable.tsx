import { HealthCheck } from "@/types";
import StatusBadge from "./StatusBadge";

interface HealthCheckTableProps {
  checks: HealthCheck[];
}

export default function HealthCheckTable({ checks }: HealthCheckTableProps) {
  if (checks.length === 0) {
    return (
      <p className="text-gray-500 text-sm">No health checks recorded yet.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-2 font-medium text-gray-600">
              Status
            </th>
            <th className="text-left py-3 px-2 font-medium text-gray-600">
              HTTP Code
            </th>
            <th className="text-left py-3 px-2 font-medium text-gray-600">
              Response Time
            </th>
            <th className="text-left py-3 px-2 font-medium text-gray-600">
              Error
            </th>
            <th className="text-left py-3 px-2 font-medium text-gray-600">
              Checked At
            </th>
          </tr>
        </thead>
        <tbody>
          {checks.map((check) => (
            <tr key={check.id} className="border-b border-gray-100">
              <td className="py-2 px-2">
                <StatusBadge status={check.status} />
              </td>
              <td className="py-2 px-2 text-gray-700">
                {check.http_status_code ?? "—"}
              </td>
              <td className="py-2 px-2 text-gray-700">
                {check.response_time_ms != null
                  ? `${Math.round(check.response_time_ms)}ms`
                  : "—"}
              </td>
              <td className="py-2 px-2 text-gray-500 truncate max-w-[200px]">
                {check.error_message || "—"}
              </td>
              <td className="py-2 px-2 text-gray-500">
                {new Date(check.checked_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
