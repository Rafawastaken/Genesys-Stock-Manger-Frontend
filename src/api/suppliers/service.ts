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
  FeedMapperOut,
  MapperValidateIn,
  MapperValidateOut,
  SupplierDetailOut,
  SupplierUpdateRequest,
  MapperUpsertIn,
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

  // update composto (supplier/feed/mapper)
  updateSupplierDeep(id: number, payload: SupplierUpdateRequest) {
    return this.http.put<SupplierDetailOut>(
      Endpoints.SUPPLIER_BY_ID(id),
      payload
    );
  }
  updateSupplierOnly(id: number, supplier: SupplierCreate) {
    return this.updateSupplierDeep(id, { supplier });
  }
  updateSupplierFeed(id: number, feed: SupplierFeedCreate) {
    return this.updateSupplierDeep(id, { feed });
  }
  updateSupplierMapper(id: number, mapper: MapperUpsertIn) {
    return this.updateSupplierDeep(id, { mapper });
  }

  // detalhe e delete
  getSupplierDetail(id: number) {
    return this.http.get<SupplierDetailOut>(Endpoints.SUPPLIER_BY_ID(id));
  }
  deleteSupplier(id: number) {
    return this.http.delete<void>(Endpoints.SUPPLIER_BY_ID(id));
  }

  // listagem
  list(page = 1, pageSize = 20, searchTerm?: string | null) {
    return this.http.get<SupplierListResponse>(Endpoints.SUPPLIERS, {
      params: { page, page_size: pageSize, search: searchTerm ?? null },
    });
  }

  // feed (ainda úteis no create)
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
  getMapperByFeed(feedId: number) {
    return this.http.get<FeedMapperOut>(Endpoints.MAPPER_BY_FEED(feedId));
  }
  getMapperBySupplier(supplierId: number) {
    return this.http.get<FeedMapperOut | null>(
      Endpoints.MAPPER_BY_SUPPLIER(supplierId)
    );
  }
  validateMapper(feedId: number, payload: MapperValidateIn) {
    return this.http.post<MapperValidateOut>(
      Endpoints.MAPPER_VALIDATE(feedId),
      payload
    );
  }
  listMapperOps() {
    return this.http.get<
      Array<{ op: string; label?: string; arity?: number; input?: string }>
    >(Endpoints.MAPPER_OPS);
  }
}

export type {
  Supplier,
  SupplierCreate,
  SupplierListResponse,
  SupplierFeedCreate,
  SupplierFeedOut,
  FeedTestRequest,
  FeedTestResponse,
  FeedMapperOut,
  MapperValidateIn,
  MapperValidateOut,
  SupplierDetailOut,
  SupplierUpdateRequest,
  MapperUpsertIn,
};
