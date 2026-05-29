"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { StatusPageResponse } from "@/types";
import { getStatusPage } from "@/lib/api";

const STATUS_CONFIG = {
  "All Systems Operational": {
    bg: "bg-green-500",
    light: "bg-green-50 border-green-200",
    text: "text-green-700",
    icon: "✓",
  },
  "Partial Outage": {
    bg: "bg-yellow-500",
    light: "bg-yellow-50 border-yellow-200",
    text: "text-yellow-700",
    icon: "⚠",
  },
  "Major Outage": {
    bg: "bg-red-500",
    light: "bg-red-50 border-red-200",
    text: "text-red-700",
    icon: "✕",
  },
};

const MONITOR_STATUS = {
  healthy:  { dot: "bg-green-500", label: "Operational",  text: "text-green-700" },
  degraded: { dot: "bg-yellow-500", label: "Degraded",    text: "text-yellow-700" },
  down:     { dot: "bg-red-500",   label: "Down",         text: "text-red-600" },
  unknown:  { dot: "bg-gray-400",  label: "Unknown",      text: "text-gray-500" },
};

export default function StatusPage() {
  const [data, setData] = useState<StatusPageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadStatus() {
    try {
      const status = await getStatusPage();
      setData(status);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const overall = data ? STATUS_CONFIG[data.overall_status] : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Watchtower" width={28} height={28} className="rounded-lg" />
            <span className="font-bold text-gray-900">Watchtower</span>
          </div>
          <span className="text-xs text-gray-400">
            Auto-refreshes every 30s
          </span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : data ? (
          <>
            {/* Overall status banner */}
            <div className={`${overall?.bg} rounded-xl p-6 text-white text-center mb-8 shadow-sm`}>
              <div className="text-3xl mb-2">{overall?.icon}</div>
              <h1 className="text-xl font-bold">{data.overall_status}</h1>
              <p className="text-sm opacity-80 mt-1">
                Updated {lastUpdated.toLocaleTimeString()}
              </p>
            </div>

            {/* Service list */}
            <div className="space-y-2">
              {data.monitors.length === 0 ? (
                <p className="text-center text-gray-400 py-10">No services monitored yet.</p>
              ) : (
                data.monitors.map((monitor, i) => {
                  const s = MONITOR_STATUS[monitor.current_status] ?? MONITOR_STATUS.unknown;
                  return (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${s.dot} shrink-0`} />
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{monitor.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5 capitalize">{monitor.environment} · {monitor.uptime_percentage}% uptime (24h)</p>
                        </div>
                      </div>
                      <span className={`text-xs font-semibold ${s.text}`}>{s.label}</span>
                    </div>
                  );
                })
              )}
            </div>
          </>
        ) : (
          <p className="text-center text-gray-400 py-10">Failed to load status.</p>
        )}

        {/* Footer */}
        <div className="mt-12 text-center space-y-1">
          <p className="text-xs text-gray-400">Powered by Watchtower</p>
          <Link href="/login" className="text-xs text-gray-300 hover:text-gray-400 transition-colors">
            Admin
          </Link>
        </div>
      </main>
    </div>
  );
}
