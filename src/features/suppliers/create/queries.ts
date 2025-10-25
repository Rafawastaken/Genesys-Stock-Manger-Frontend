import { useMutation, useQuery } from "@tanstack/react-query";
import { suppliersClient } from "@/api/suppliers";
import type {
  Supplier,
  SupplierCreate,
  SupplierFeedCreate,
  SupplierFeedOut,
  FeedTestRequest,
  FeedTestResponse,
  FeedMapperOut,
  MapperValidateIn,
  MapperValidateOut,
} from "@/api/suppliers";

// Criar supplier
export function useCreateSupplier() {
  return useMutation({
    mutationFn: (payload: SupplierCreate) =>
      suppliersClient.createSupplier(payload),
  });
}

// Feed
export function useSupplierFeed(supplierId?: number) {
  return useQuery({
    queryKey: ["supplier-feed", supplierId],
    queryFn: () => suppliersClient.getSupplierFeed(supplierId!),
    enabled: !!supplierId,
    staleTime: 30_000,
  });
}

export function useUpsertFeed(supplierId: number) {
  return useMutation({
    mutationFn: (payload: SupplierFeedCreate) =>
      suppliersClient.upsertSupplierFeed(supplierId, payload),
  });
}

export function useTestFeed() {
  return useMutation({
    mutationFn: (payload: FeedTestRequest) => suppliersClient.testFeed(payload),
  });
}

// Mapper (guardar via /suppliers/{id})
type MapperUpsert = {
  profile: Record<string, any>;
  bump_version?: boolean;
};

export function useUpsertMapper(supplierId: number) {
  return useMutation({
    mutationFn: (payload: MapperUpsert) =>
      suppliersClient.updateSupplierMapper(supplierId, payload),
  });
}

// Validar mapper (precisa de feedId)
export function useValidateMapper(feedId: number) {
  return useMutation({
    mutationFn: (payload: MapperValidateIn) =>
      suppliersClient.validateMapper(feedId, payload),
  });
}

// Ler mapper por supplier
export function useMapperBySupplier(supplierId?: number) {
  return useQuery({
    queryKey: ["mapper-by-supplier", supplierId],
    queryFn: () => suppliersClient.getMapperBySupplier(supplierId!),
    enabled: !!supplierId,
    staleTime: 30_000,
  });
}

// Ler mapper por feed (opcional, se precisares)
export function useMapperByFeed(feedId?: number) {
  return useQuery({
    queryKey: ["mapper-by-feed", feedId],
    queryFn: () => suppliersClient.getMapperByFeed(feedId!),
    enabled: !!feedId,
    staleTime: 30_000,
  });
}

// Operações suportadas pelo mapper
export function useMapperOps() {
  return useQuery({
    queryKey: ["mapper-ops"],
    queryFn: () => suppliersClient.listMapperOps(),
    staleTime: Infinity,
  });
}

export type {
  Supplier,
  SupplierCreate,
  SupplierFeedCreate,
  SupplierFeedOut,
  FeedTestRequest,
  FeedTestResponse,
  FeedMapperOut,
  MapperValidateIn,
  MapperValidateOut,
};
