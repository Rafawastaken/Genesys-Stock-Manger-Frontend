// src/api/products/service.ts
import { HttpClient } from "@/lib/http-client";
import { Endpoints } from "@/constants/endpoints";
import { authStore } from "@/lib/auth-store";
import type { ProductListParams, ProductListResponse } from "./types";

export class ProductsService {
  private http: HttpClient;

  constructor(http?: HttpClient) {
    this.http =
      http ??
      new HttpClient({
        baseUrl: Endpoints.BASE_URL,
        token: () => authStore.get(),
      });
  }

  list(params: ProductListParams = {}) {
    const {
      page = 1,
      pageSize = 20,
      q = null,
      gtin = null,
      partnumber = null,
      id_brand = null,
      brand = null,
      id_category = null,
      category = null,
      has_stock = null,
      id_supplier = null,
      sort = "recent",
    } = params;

    return this.http.get<ProductListResponse>(Endpoints.PRODUCTS, {
      params: {
        page,
        page_size: pageSize,
        q,
        gtin,
        partnumber,
        id_brand,
        brand,
        id_category,
        category,
        has_stock,
        id_supplier,
        sort,
      },
    });
  }
}
