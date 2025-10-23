import { HttpClient } from "@/lib/http-client";
import { Endpoints } from "@/constants/endpoints";
import { authStore } from "@/lib/auth-store";
import type {
  Supplier,
  SupplierCreate,
  SupplierListResponse,
  SupplierFeedCreate,
  SupplierFeedOut,
  FeedTestRequest,
  FeedTestResponse,
  FeedMapperUpsert,
  FeedMapperOut,
  MapperValidateIn,
  MapperValidateOut,
} from "./types";

export class SuppliersService {
  private http: HttpClient;

  constructor(http?: HttpClient) {
    this.http =
      http ??
      new HttpClient({
        baseUrl: Endpoints.BASE_URL,
        token: () => authStore.get(),
      });
  }

  // suppliers
  createSupplier(payload: SupplierCreate) {
    return this.http.post<Supplier>(Endpoints.SUPPLIERS, payload);
  }
  getSupplier(id: number) {
    return this.http.get<Supplier>(`${Endpoints.SUPPLIERS}/${id}`);
  }
  updateSupplier(id: number, payload: SupplierCreate) {
    return this.http.put<Supplier>(`${Endpoints.SUPPLIERS}/${id}`, payload);
  }
  deleteSupplier(id: number) {
    return this.http.delete<{ ok: boolean }>(`${Endpoints.SUPPLIERS}/${id}`);
  }
  list(page = 1, pageSize = 20, searchTerm?: string | null) {
    return this.http.get<SupplierListResponse>(Endpoints.SUPPLIERS, {
      params: { page, page_size: pageSize, search: searchTerm ?? null },
    });
  }

  // feed
  getSupplierFeed(supplierId: number) {
    return this.http.get<SupplierFeedOut>(
      Endpoints.FEED_BY_SUPPLIER(supplierId)
    );
  }
  upsertSupplierFeed(supplierId: number, payload: SupplierFeedCreate) {
    return this.http.put<SupplierFeedOut>(
      Endpoints.FEED_BY_SUPPLIER(supplierId),
      payload
    );
  }
  testFeed(payload: FeedTestRequest) {
    return this.http.post<FeedTestResponse>(Endpoints.FEEDS_TEST, payload);
  }

  // mapper
  upsertMapper(feedId: number, payload: FeedMapperUpsert) {
    return this.http.put<FeedMapperOut>(
      Endpoints.MAPPER_BY_FEED(feedId),
      payload
    );
  }
  validateMapper(feedId: number, payload: MapperValidateIn) {
    return this.http.post<MapperValidateOut>(
      Endpoints.MAPPER_VALIDATE(feedId),
      payload
    );
  }
}
