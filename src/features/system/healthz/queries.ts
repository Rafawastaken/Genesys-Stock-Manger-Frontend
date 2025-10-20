import { useQuery } from "@tanstack/react-query";
import { systemClient } from "@/api/system";

export const systemKeys = {
  root: ["system"] as const,
  healthz: () => [...systemKeys.root, "healthz"] as const,
};

export function useHealthz() {
  return useQuery({
    queryKey: systemKeys.healthz(),
    queryFn: async () => {
      const started = performance.now();
      const data = await systemClient.getHealthz();
      const elapsedMs = Math.max(0, performance.now() - started);
      const up = data.ok && data.status?.toLowerCase() === "ok";
      return { ...data, elapsedMs, up };
    },
    refetchInterval: 30_000,
    staleTime: 25_000,
  });
}
