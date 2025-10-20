// src/components/feedback/StatusDot.tsx
export function StatusDot({
  status,
}: {
  status: "ok" | "warning" | "critical" | string;
}) {
  const color =
    status === "ok"
      ? "bg-emerald-500"
      : status === "warning"
      ? "bg-amber-500"
      : status === "critical" || status === "down"
      ? "bg-red-500"
      : "bg-gray-400";

  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${color}`} />;
}
