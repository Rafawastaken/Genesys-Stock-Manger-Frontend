// src/api/suppliers/index.ts
import { SuppliersService } from "./service";

export const suppliersClient = new SuppliersService();

export * from "./types";
