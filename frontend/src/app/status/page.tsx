"use client";

import { useEffect, useState } from "react";
import { StatusPageResponse } from "@/types";
import { getStatusPage } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";

export default function StatusPage() {
  const [data, setData] = useState<StatusPageResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadStatus() {
    try {
      const status = await getStatusPage();
      setData(status);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="text-gray-500 py-10 text-center">Loading status...</div>
    );
  }

  if (!data) return null;

  const overallColor =
    data.overall_status === "All Systems Operational"
      ? "bg-green-500"
      : data.overall_status === "Partial Outage"
        ? "bg-yellow-500"
        : "bg-red-500";

  return (
    <div className="max-w-3xl mx-auto">
      {/* Overall Status Banner */}
      <div
        className={`${overallColor} rounded-lg p-6 text-white text-center mb-8`}
      >
        <h1 className="text-2xl font-bold">{data.overall_status}</h1>
        <p className="text-sm opacity-90 mt-1">
          Last updated: {new Date().toLocaleString()}
        </p>
      </div>

      {/* Service List */}
      <div className="space-y-3">
        {data.monitors.map((monitor, i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between"
          >
            <div>
              <h3 className="font-medium text-gray-900">{monitor.name}</h3>
              <p className="text-sm text-gray-500">
                {monitor.uptime_percentage}% uptime (24h)
              </p>
            </div>
            <StatusBadge status={monitor.current_status} />
          </div>
        ))}
      </div>

      {data.monitors.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No services are being monitored yet.
        </div>
      )}

      <div className="text-center mt-8 text-sm text-gray-400">
        Powered by Watchtower
      </div>
    </div>
  );
}
