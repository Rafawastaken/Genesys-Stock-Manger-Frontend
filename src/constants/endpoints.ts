// src/constants/endpoints.ts
export const Endpoints = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL,

  // System
  HEALTHZ: "healthz",

  // Auth
  AUTH_LOGIN: "auth/login",
  AUTH_ME: "auth/me",

  // Suppliers
  SUPPLIERS: "suppliers",
  SUPPLIER_BY_ID: (id: number) => `suppliers/${id}`,

  // Feeds
  FEED_BY_SUPPLIER: (id: number) => `feeds/supplier/${id}`,
  FEEDS_TEST: "feeds/test",

  // Mappers
  MAPPER_BY_FEED: (id: number) => `mappers/feed/${id}`,
  MAPPER_BY_SUPPLIER: (id: number) => `mappers/supplier/${id}`,
  MAPPER_VALIDATE: (id: number) => `mappers/feed/${id}/validate`,
  MAPPER_OPS: "mappers/ops",

  // Runs
  RUNS_INGEST_SUPPLIER: (id: number) => `runs/supplier/${id}/ingest`,

  // Products
  PRODUCTS: "products",
} as const;
