// src/api/products/index.ts
import { ProductsService } from "./service";

export const productsClient = new ProductsService();

export * from "./types";
