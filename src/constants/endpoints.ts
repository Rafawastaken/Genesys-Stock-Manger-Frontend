// src/constants/endpoints.ts
// Definição dos endpoints da API

export const Endpoints = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL,
  HEALTHZ: "healthz",
  AUTH_LOGIN: "auth/login",
  AUTH_ME: "auth/me",
  SUPPLIERS: "suppliers",
  FEED_BY_SUPPLIER: (id: number) => `feeds/supplier/${id}`,
  FEEDS_TEST: "feeds/test",
  MAPPER_BY_FEED: (id: number) => `mappers/feed/${id}`,
  MAPPER_VALIDATE: (id: number) => `mappers/feed/${id}/validate`,
  MAPPERS_OPS: "mappers/ops",
  RUNS_INGEST_SUPPLIER: (id: number) => `runs/supplier/${id}/ingest`,
} as const;
