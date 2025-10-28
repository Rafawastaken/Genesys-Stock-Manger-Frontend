// src/api/products/types.ts

export type ProductListParams = {
  page?: number;
  pageSize?: number; // envia como page_size
  q?: string | null;
  gtin?: string | null;
  partnumber?: string | null;
  id_brand?: number | null;
  brand?: string | null;
  id_category?: number | null;
  category?: string | null;
  has_stock?: boolean | null;
  id_supplier?: number | null;
  sort?: "recent" | "name";
};

export type OfferOut = {
  id_supplier: number;
  supplier_name: string;
  supplier_image?: string | null;
  id_feed: number;
  sku: string;
  price: string; // vem como string no backend
  stock: number;
  id_last_seen_run?: number | null;
  updated_at?: string | null;
};

export type ProductOut = {
  id: number;
  gtin?: string | null;
  id_brand?: number | null;
  id_ecommerce?: number | null;
  brand_name?: string | null;
  id_category?: number | null;
  category_name?: string | null;
  partnumber?: string | null;
  name?: string | null;
  description?: string | null;
  image_url?: string | null;
  weight_str?: string | null;
  created_at?: string;
  updated_at?: string | null;

  offers?: OfferOut[]; // todas as ofertas
  best_offer?: OfferOut | null; // melhor oferta calculada pelo backend
};

export type ProductListResponse = {
  items: ProductOut[];
  total: number;
  page: number;
  page_size: number;
};
