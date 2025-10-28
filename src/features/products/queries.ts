import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { productsClient } from "@/api/products";
import type { ProductListParams, ProductListResponse } from "@/api/products";

export const productKeys = {
  root: ["products"] as const,
  list: (q: ProductListParams) => [...productKeys.root, "list", q] as const,
};

export function useProductsList(params: ProductListParams = {}) {
  const q: Required<Pick<ProductListParams, "page" | "pageSize" | "sort">> &
    Omit<ProductListParams, "page" | "pageSize" | "sort"> = {
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 20,
    sort: params.sort ?? "recent",
    q: params.q ?? null,
    gtin: params.gtin ?? null,
    partnumber: params.partnumber ?? null,
    id_brand: params.id_brand ?? null,
    brand: params.brand ?? null,
    id_category: params.id_category ?? null,
    category: params.category ?? null,
    has_stock: params.has_stock ?? null,
    id_supplier: params.id_supplier ?? null,
  };

  return useQuery<ProductListResponse & { elapsedMs: number }>({
    queryKey: productKeys.list(q),
    queryFn: async () => {
      const started = performance.now();
      const data = await productsClient.list(q);
      const elapsedMs = Math.max(0, performance.now() - started);
      return { ...data, elapsedMs };
    },
    placeholderData: keepPreviousData,
    refetchInterval: 60_000,
    staleTime: 55_000,
  });
}
