interface StatusBadgeProps {
  status: "healthy" | "degraded" | "down" | "unknown";
}

const statusConfig = {
  healthy: {
    label: "Healthy",
    bg: "bg-green-100",
    text: "text-green-800",
    dot: "bg-green-500",
  },
  degraded: {
    label: "Degraded",
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    dot: "bg-yellow-500",
  },
  down: {
    label: "Down",
    bg: "bg-red-100",
    text: "text-red-800",
    dot: "bg-red-500",
  },
  unknown: {
    label: "Unknown",
    bg: "bg-gray-100",
    text: "text-gray-800",
    dot: "bg-gray-500",
  },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dot}`}></span>
      {config.label}
    </span>
  );
}
