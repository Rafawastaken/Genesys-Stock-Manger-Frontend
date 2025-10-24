import { useMutation, useQuery } from "@tanstack/react-query";
import { suppliersClient } from "@/api/suppliers";
import type {
  Supplier,
  SupplierCreate,
  SupplierFeedCreate,
  SupplierFeedOut,
  FeedTestRequest,
  FeedTestResponse,
  FeedMapperUpsert,
  FeedMapperOut,
  MapperValidateIn,
  MapperValidateOut,
} from "@/api/suppliers";

export function useCreateSupplier() {
  return useMutation({
    mutationFn: (payload: SupplierCreate) =>
      suppliersClient.createSupplier(payload),
  });
}

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

export function useUpsertMapper(feedId: number) {
  return useMutation({
    mutationFn: (payload: FeedMapperUpsert) =>
      suppliersClient.upsertMapper(feedId, payload),
  });
}

export function useValidateMapper(feedId: number) {
  return useMutation({
    mutationFn: (payload: MapperValidateIn) =>
      suppliersClient.validateMapper(feedId, payload),
  });
}

export function useMapper(feedId?: number) {
  return useQuery({
    queryKey: ["mapper", feedId],
    queryFn: () => suppliersClient.getMapper(feedId!),
    enabled: !!feedId,
    staleTime: 30_000,
  });
}

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
  FeedMapperUpsert,
  FeedMapperOut,
  MapperValidateIn,
  MapperValidateOut,
};
