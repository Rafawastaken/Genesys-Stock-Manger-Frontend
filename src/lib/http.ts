import { HttpClient } from "@/lib/http-client";
import { Endpoints } from "@/constants/endpoints";
import { authStore } from "@/lib/auth-store";

export const http = new HttpClient({
  baseUrl: Endpoints.BASE_URL,
  token: () => authStore.get(),
});
