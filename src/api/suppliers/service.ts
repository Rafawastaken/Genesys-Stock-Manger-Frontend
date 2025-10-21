// src/api/suppliers/service.ts
import { HttpClient } from "@/lib/http-client";
import { Endpoints } from "@/constants/endpoints";
import type { SupplierListResponse } from "./types";

export class SuppliersService {
  private http: HttpClient;

  constructor(http?: HttpClient) {
    this.http = http ?? new HttpClient({ baseUrl: Endpoints.BASE_URL });
  }

  list(page = 1, pageSize = 20, searchTerm?: string | null) {
    return this.http.get<SupplierListResponse>(Endpoints.SUPPLIERS, {
      params: { page, page_size: pageSize, search: searchTerm ?? null },
    });
  }
}
