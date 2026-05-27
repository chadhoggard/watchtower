"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Monitor, HealthCheck, Incident } from "@/types";
import {
  getMonitor,
  getHealthChecks,
  getMonitorIncidents,
  triggerHealthCheck,
  deleteMonitor,
} from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import HealthCheckTable from "@/components/HealthCheckTable";
import IncidentTable from "@/components/IncidentTable";
import ResponseTimeChart from "@/components/ResponseTimeChart";

export default function MonitorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const monitorId = params.id as string;

  const [monitor, setMonitor] = useState<Monitor | null>(null);
  const [checks, setChecks] = useState<HealthCheck[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);

  useEffect(() => {
    loadData();
  }, [monitorId]);

  async function loadData() {
    try {
      const [m, c, i] = await Promise.all([
        getMonitor(monitorId),
        getHealthChecks(monitorId),
        getMonitorIncidents(monitorId),
      ]);
      setMonitor(m);
      setChecks(c);
      setIncidents(i);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleTrigger() {
    setTriggering(true);
    try {
      await triggerHealthCheck(monitorId);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setTriggering(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this monitor?")) return;
    try {
      await deleteMonitor(monitorId);
      router.push("/");
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) {
    return <div className="text-gray-500 py-10">Loading monitor...</div>;
  }

  if (!monitor) {
    return <div className="text-red-600 py-10">Monitor not found.</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{monitor.name}</h1>
            <StatusBadge status={monitor.current_status} />
          </div>
          <p className="text-gray-500">{monitor.url}</p>
          {monitor.description && (
            <p className="text-sm text-gray-400 mt-1">{monitor.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleTrigger}
            disabled={triggering}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {triggering ? "Checking..." : "Run Check"}
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Monitor Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Method</p>
            <p className="font-medium">{monitor.http_method}</p>
          </div>
          <div>
            <p className="text-gray-500">Expected Status</p>
            <p className="font-medium">{monitor.expected_status_code}</p>
          </div>
          <div>
            <p className="text-gray-500">Check Interval</p>
            <p className="font-medium">{monitor.check_interval_minutes} min</p>
          </div>
          <div>
            <p className="text-gray-500">Environment</p>
            <p className="font-medium capitalize">{monitor.environment}</p>
          </div>
        </div>
      </div>

      {/* Response Time Chart */}
      <div className="mb-6">
        <ResponseTimeChart checks={checks} />
      </div>

      {/* Health Checks */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Health Checks
        </h2>
        <HealthCheckTable checks={checks} />
      </div>

      {/* Incidents */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Incident History
        </h2>
        <IncidentTable incidents={incidents} />
      </div>
    </div>
  );
}
