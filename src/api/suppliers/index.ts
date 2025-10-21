import { SuppliersService } from "./service";
import { http } from "@/lib/http";

export const suppliersClient = new SuppliersService(http);

export * from "./types";
