// src/lib/http-client.ts
export type TokenProvider = () => string | null;

export type HttpClientOptions = {
  baseUrl: string;
  token?: TokenProvider;
  headers?: Record<string, string>;
  timeoutMs?: number;
};

export class HttpClient {
  constructor(private opts: HttpClientOptions) {}

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const base = this.opts.baseUrl.endsWith("/")
      ? this.opts.baseUrl
      : this.opts.baseUrl + "/";
    const url = path.startsWith("http") ? path : new URL(path, base).toString();

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      this.opts.timeoutMs ?? 15000
    );

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(this.opts.headers ?? {}),
      ...(init?.headers ?? {}),
    };

    const token = this.opts.token?.();
    if (token) (headers as any).Authorization = `Bearer ${token}`;

    const res = await fetch(url, {
      ...init,
      headers,
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    const isJson = res.headers
      .get("content-type")
      ?.includes("application/json");
    const body = isJson ? await res.json().catch(() => ({})) : await res.text();
    if (!res.ok) throw new HttpError(res.status, body);
    return body as T;
  }

  get<T>(p: string, init?: RequestInit) {
    return this.request<T>(p, { method: "GET", ...(init || {}) });
  }
  post<T>(p: string, body?: unknown, init?: RequestInit) {
    return this.request<T>(p, {
      method: "POST",
      body: body != null ? JSON.stringify(body) : undefined,
      ...(init || {}),
    });
  }
  put<T>(p: string, body?: unknown, init?: RequestInit) {
    return this.request<T>(p, {
      method: "PUT",
      body: body != null ? JSON.stringify(body) : undefined,
      ...(init || {}),
    });
  }
  patch<T>(p: string, body?: unknown, init?: RequestInit) {
    return this.request<T>(p, {
      method: "PATCH",
      body: body != null ? JSON.stringify(body) : undefined,
      ...(init || {}),
    });
  }
  delete<T>(p: string, init?: RequestInit) {
    return this.request<T>(p, { method: "DELETE", ...(init || {}) });
  }
}

export class HttpError extends Error {
  constructor(public status: number, public data: unknown) {
    super(`HTTP ${status}`);
  }
}
