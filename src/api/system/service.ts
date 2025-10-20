import { HttpClient } from "@/lib/http-client";
import { Endpoints } from "@/constants/endpoints";
import type { HealthResponse } from "./types";

export class SystemService {
  private http: HttpClient;

  constructor(http?: HttpClient) {
    this.http = http ?? new HttpClient({ baseUrl: Endpoints.BASE_URL });
  }

  getHealthz() {
    return this.http.get<HealthResponse>(Endpoints.HEALTHZ);
  }
}
