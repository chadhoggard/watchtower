"use client";

import { useEffect, useState } from "react";
import { DashboardResponse } from "@/types";
import { getDashboard } from "@/lib/api";
import MonitorCard from "@/components/MonitorCard";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadDashboard() {
    try {
      const dashboard = await getDashboard();
      setData(dashboard);
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <a
          href="/monitors/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Add Monitor
        </a>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Monitors</p>
          <p className="text-2xl font-bold text-gray-900">
            {data.total_monitors}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Healthy</p>
          <p className="text-2xl font-bold text-green-600">
            {data.healthy_count}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Degraded</p>
          <p className="text-2xl font-bold text-yellow-600">
            {data.degraded_count}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Down</p>
          <p className="text-2xl font-bold text-red-600">{data.down_count}</p>
        </div>
      </div>

      {/* Monitor Grid */}
      {data.monitors.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500 mb-4">No monitors configured yet.</p>
          <a
            href="/monitors/create"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Create your first monitor →
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.monitors.map((monitor) => (
            <MonitorCard key={monitor.id} monitor={monitor} />
          ))}
        </div>
      )}
    </div>
  );
}
