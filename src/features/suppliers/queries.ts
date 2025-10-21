// src/features/suppliers/queries.ts

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { suppliersClient } from "@/api/suppliers";
import type { SupplierListResponse } from "@/api/suppliers";

export const supplierKeys = {
  root: ["suppliers"] as const,
  list: (q: { page: number; pageSize: number; search?: string | null }) =>
    [...supplierKeys.root, "list", q] as const,
};

export function useSuppliersList(
  params: { page?: number; pageSize?: number; search?: string | null } = {}
) {
  const q = { page: 1, pageSize: 20, search: null as string | null, ...params };
  return useQuery<SupplierListResponse & { elapsedMs: number }>({
    queryKey: supplierKeys.list(q),
    queryFn: async () => {
      const started = performance.now();
      const data = await suppliersClient.list(q.page, q.pageSize, q.search);
      const elapsedMs = Math.max(0, performance.now() - started);
      return { ...data, elapsedMs };
    },
    placeholderData: keepPreviousData,
    refetchInterval: 60_000,
    staleTime: 55_000,
  });
}
