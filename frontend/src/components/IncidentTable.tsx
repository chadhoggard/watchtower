import { Incident } from "@/types";

interface IncidentTableProps {
  incidents: Incident[];
}

export default function IncidentTable({ incidents }: IncidentTableProps) {
  if (incidents.length === 0) {
    return <p className="text-gray-500 text-sm">No incidents recorded.</p>;
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
              Started
            </th>
            <th className="text-left py-3 px-2 font-medium text-gray-600">
              Resolved
            </th>
            <th className="text-left py-3 px-2 font-medium text-gray-600">
              Duration
            </th>
            <th className="text-left py-3 px-2 font-medium text-gray-600">
              Reason
            </th>
          </tr>
        </thead>
        <tbody>
          {incidents.map((incident) => (
            <tr key={incident.id} className="border-b border-gray-100">
              <td className="py-2 px-2">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    incident.status === "ongoing"
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {incident.status === "ongoing" ? "Ongoing" : "Resolved"}
                </span>
              </td>
              <td className="py-2 px-2 text-gray-700">
                {new Date(incident.started_at).toLocaleString()}
              </td>
              <td className="py-2 px-2 text-gray-700">
                {incident.resolved_at
                  ? new Date(incident.resolved_at).toLocaleString()
                  : "—"}
              </td>
              <td className="py-2 px-2 text-gray-700">
                {incident.duration_seconds != null
                  ? formatDuration(incident.duration_seconds)
                  : "—"}
              </td>
              <td className="py-2 px-2 text-gray-500 truncate max-w-[200px]">
                {incident.reason || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
}
