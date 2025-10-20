// src/api/auth/service.ts
// Serviço de API para autenticação de utilizadores

import { HttpClient } from "@/lib/http-client";
import { Endpoints } from "@/constants/endpoints";
import type { LoginRequest, LoginResponse } from "./types";

export class AuthService {
  private http: HttpClient;

  constructor(http?: HttpClient) {
    this.http = http ?? new HttpClient({ baseUrl: Endpoints.BASE_URL });
  }

  login(payload: LoginRequest) {
    return this.http.post<LoginResponse>(Endpoints.AUTH_LOGIN, payload);
  }

  me() {
    return this.http.get<Record<string, unknown>>(Endpoints.AUTH_ME);
  }
}

export type { LoginRequest, LoginResponse };
