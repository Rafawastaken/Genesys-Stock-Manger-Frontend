import { AuthService } from "./service";
import { http } from "@/lib/http";

export const authClient = new AuthService(http);

export * from "./types";
