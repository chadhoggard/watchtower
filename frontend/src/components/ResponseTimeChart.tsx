import { HealthCheck } from '@/types';

interface ResponseTimeChartProps {
  checks: HealthCheck[];
}

export default function ResponseTimeChart({ checks }: ResponseTimeChartProps) {
  if (checks.length === 0) {
    return <p className="text-gray-500 text-sm">No response time data available.</p>;
  }

  const sortedChecks = [...checks].reverse();
  const maxTime = Math.max(...sortedChecks.map((c) => c.response_time_ms || 0));
  const chartHeight = 120;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Response Time (ms)</h3>
      <div className="flex items-end gap-1 h-[120px]">
        {sortedChecks.slice(-30).map((check, i) => {
          const time = check.response_time_ms || 0;
          const height = maxTime > 0 ? (time / maxTime) * chartHeight : 0;
          const color =
            check.status === 'healthy'
              ? 'bg-green-400'
              : check.status === 'degraded'
              ? 'bg-yellow-400'
              : 'bg-red-400';

          return (
            <div
              key={check.id}
              className="flex-1 flex flex-col items-center justify-end group relative"
            >
              <div
                className={`w-full rounded-t ${color} min-h-[2px] transition-all hover:opacity-80`}
                style={{ height: `${Math.max(height, 2)}px` }}
              ></div>
              <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                {Math.round(time)}ms
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-400">
        <span>Older</span>
        <span>Recent</span>
      </div>
    </div>
  );
}
