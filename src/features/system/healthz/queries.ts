import { useQuery } from "@tanstack/react-query";
import { systemClient } from "@/api/system";

export const systemKeys = {
  root: ["system"] as const,
  healthz: () => [...systemKeys.root, "healthz"] as const,
};

export function useHealthz() {
  return useQuery({
    queryKey: ["healthz"],
    queryFn: async () => {
      const t0 = performance.now();
      const data = await systemClient.getHealthz();
      const elapsedMs = Math.max(0, performance.now() - t0);
      return { ...data, elapsedMs };
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    refetchInterval: false, // 👈 sem timers
  });
}
