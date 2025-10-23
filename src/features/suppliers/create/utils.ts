export type KV = { key: string; value: string };

export function safeParseObjJSON(input: unknown): Record<string, any> | null {
  if (!input) return null;
  if (typeof input === "string") {
    try {
      const o = JSON.parse(input);
      return o && typeof o === "object" ? (o as Record<string, any>) : null;
    } catch {
      return null;
    }
  }
  if (typeof input === "object") return input as Record<string, any>;
  return null;
}

export function recordToKV(obj: Record<string, any> | null | undefined): KV[] {
  if (!obj) return [];
  return Object.keys(obj).map((k) => ({ key: k, value: String(obj[k] ?? "") }));
}

export function kvToRecord(arr: KV[]): Record<string, string> | null {
  const out: Record<string, string> = {};
  for (const { key, value } of arr) if (key) out[key] = value ?? "";
  return Object.keys(out).length ? out : null;
}

const kvIndex = (list: KV[], key: string) =>
  list.findIndex((x) => x.key === key);
const upsertKV = (list: KV[], key: string, value: string) => {
  const idx = kvIndex(list, key);
  if (idx === -1) return [...list, { key, value }];
  if (list[idx].value === "" || list[idx].value == null) {
    const next = [...list];
    next[idx] = { key, value };
    return next;
  }
  return list;
};

export function ensureAuthShape(
  current: KV[] | undefined,
  authKind?: string,
  kind?: "http" | "ftp"
): KV[] {
  let out = [...(current || [])];
  if (!authKind || authKind === "none") return out;

  if (kind === "ftp" && authKind === "ftp_password") {
    out = upsertKV(out, "host", "");
    out = upsertKV(out, "port", "21");
    out = upsertKV(out, "username", "");
    out = upsertKV(out, "password", "");
    return out;
  }
  switch (authKind) {
    case "basic":
      out = upsertKV(out, "username", "");
      out = upsertKV(out, "password", "");
      break;
    case "bearer":
      out = upsertKV(out, "token", "");
      break;
    case "api_key":
      out = upsertKV(out, "key", "");
      out = upsertKV(out, "in", "header");
      out = upsertKV(out, "name", "Authorization");
      break;
    case "oauth_password":
      out = upsertKV(out, "token_url", "");
      out = upsertKV(out, "client_id", "");
      out = upsertKV(out, "client_secret", "");
      out = upsertKV(out, "username", "");
      out = upsertKV(out, "password", "");
      out = upsertKV(out, "grant_type", "password");
      out = upsertKV(out, "scope", "");
      break;
  }
  return out;
}

// assinatura estável para remount controlado
export const sigKV = (list?: KV[] | null) =>
  JSON.stringify((list || []).map(({ key, value }) => [key, value]));
