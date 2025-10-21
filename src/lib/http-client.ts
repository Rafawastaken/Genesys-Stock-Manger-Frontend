// src/lib/http-client.ts
export type TokenProvider = () => string | null;

export type QueryParamValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Array<string | number | boolean | null | undefined>;

export type RequestOptions = Omit<RequestInit, "body" | "method"> & {
  params?: Record<string, QueryParamValue>;
};

export type HttpClientOptions = {
  baseUrl: string;
  token?: TokenProvider;
  headers?: Record<string, string>;
  timeoutMs?: number;
};

export class HttpClient {
  constructor(private opts: HttpClientOptions) {}

  private buildUrl(path: string, params?: RequestOptions["params"]): string {
    const base = this.opts.baseUrl.endsWith("/")
      ? this.opts.baseUrl
      : this.opts.baseUrl + "/";
    const url = path.startsWith("http") ? new URL(path) : new URL(path, base);

    if (params) {
      for (const [key, val] of Object.entries(params)) {
        if (val == null) continue;
        if (Array.isArray(val)) {
          for (const v of val) {
            if (v == null) continue;
            url.searchParams.append(key, String(v));
          }
        } else {
          url.searchParams.set(key, String(val));
        }
      }
    }
    return url.toString();
  }

  private async request<T>(
    path: string,
    init?: RequestOptions & { method?: string; body?: unknown }
  ): Promise<T> {
    const url = this.buildUrl(path, init?.params);

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      this.opts.timeoutMs ?? 15000
    );

    const token = this.opts.token?.();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(this.opts.headers ?? {}),
      ...(init?.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const fetchInit: RequestInit = {
      method: init?.method ?? "GET",
      headers,
      signal: controller.signal,
      body:
        init?.body !== undefined
          ? typeof init.body === "string"
            ? init.body
            : JSON.stringify(init.body)
          : undefined,
    };

    const res = await fetch(url, fetchInit).finally(() =>
      clearTimeout(timeout)
    );

    const isJson = res.headers
      .get("content-type")
      ?.includes("application/json");
    const body = isJson ? await res.json().catch(() => ({})) : await res.text();
    if (!res.ok) throw new HttpError(res.status, body);
    return body as T;
  }

  get<T>(p: string, init?: RequestOptions) {
    return this.request<T>(p, { method: "GET", ...(init || {}) });
  }
  post<T>(p: string, body?: unknown, init?: RequestOptions) {
    return this.request<T>(p, { method: "POST", body, ...(init || {}) });
  }
  put<T>(p: string, body?: unknown, init?: RequestOptions) {
    return this.request<T>(p, { method: "PUT", body, ...(init || {}) });
  }
  patch<T>(p: string, body?: unknown, init?: RequestOptions) {
    return this.request<T>(p, { method: "PATCH", body, ...(init || {}) });
  }
  delete<T>(p: string, init?: RequestOptions) {
    return this.request<T>(p, { method: "DELETE", ...(init || {}) });
  }
}

export class HttpError extends Error {
  constructor(public status: number, public data: unknown) {
    super(`HTTP ${status}`);
  }
}
