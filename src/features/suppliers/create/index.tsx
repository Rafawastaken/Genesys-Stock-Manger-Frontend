// src/features/suppliers/create/index.tsx
import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Endpoints } from "@/constants/endpoints";
import { HttpClient, HttpError } from "@/lib/http-client";
import { authStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  FlaskConical,
  Save,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";

/* --------------------------------------------------------------------------------
   TYPES (espelhados do OpenAPI que partilhaste)
---------------------------------------------------------------------------------*/

// Supplier
type SupplierCreate = {
  name: string;
  active?: boolean;
  logo_image?: string | null;
  contact_name?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  margin?: number;
  country?: string | null;
};
type SupplierOut = {
  id: number;
  name: string;
  active: boolean;
  logo_image?: string | null;
  contact_name?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  margin: number;
  country?: string | null;
  created_at: string;
  updated_at: string | null;
};

// Feed
type SupplierFeedCreate = {
  kind: string;
  format: string;
  url: string;
  active?: boolean;
  headers?: Record<string, string> | null;
  params?: Record<string, string> | null;
  auth_kind?: string | null;
  auth?: Record<string, any> | null;
  extra?: Record<string, any> | null;
  csv_delimiter?: string | null;
};
type SupplierFeedOut = {
  id: number;
  supplier_id: number;
  kind: string;
  format: string;
  url: string;
  active: boolean;
  csv_delimiter?: string | null;
  created_at: string;
  updated_at: string | null;
};

// Feed test
type FeedTestRequest = {
  kind?: string | null;
  format: string;
  url: string;
  headers?: Record<string, string> | null;
  params?: Record<string, string> | null;
  auth_kind?: string | null;
  auth?: Record<string, any> | null;
  extra?: Record<string, any> | null;
  csv_delimiter?: string | null;
  max_rows?: number | null;
};
type FeedTestResponse = {
  ok: boolean;
  status_code: number;
  content_type: string | null;
  bytes_read: number;
  preview_type: string | null;
  rows_preview: Array<Record<string, any>> | null;
  error?: string | null;
};

// Mapper
type FeedMapperUpsert = {
  profile: Record<string, any>;
  bump_version?: boolean;
};
type FeedMapperOut = {
  id: number;
  feed_id: number;
  profile: Record<string, any>;
  version: number;
  created_at: string;
  updated_at: string | null;
};
type MapperValidateIn = {
  profile?: Record<string, any> | null;
  headers?: string[] | null;
};
type MapperValidateOut = {
  ok: boolean;
  errors: Array<Record<string, any>>;
  warnings: Array<Record<string, any>>;
  required_coverage: Record<string, any>;
  headers_checked: boolean;
};

/* --------------------------------------------------------------------------------
   HTTP client (usa token do authStore e base dos Endpoints)
---------------------------------------------------------------------------------*/
const http = new HttpClient({
  baseUrl: Endpoints.BASE_URL,
  token: () => authStore.get(),
});

/* --------------------------------------------------------------------------------
   HELPERS
---------------------------------------------------------------------------------*/
function parseJson<T = any>(
  s: string
): { data: T | null; error: string | null } {
  if (!s.trim()) return { data: null, error: null };
  try {
    return { data: JSON.parse(s), error: null };
  } catch (e: any) {
    return { data: null, error: e?.message || "JSON inválido" };
  }
}

function JsonTextarea({
  value,
  onChange,
  rows = 6,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className="w-full rounded-md border bg-background px-3 py-2 font-mono text-xs leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-ring"
    />
  );
}

function ErrorNote({ error }: { error?: unknown }) {
  if (!error) return null;
  if (error instanceof HttpError) {
    const detail = (error.data as any)?.detail;
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {detail ? String(detail) : `Falha HTTP ${error.status}`}
      </div>
    );
  }
  return (
    <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
      {(error as any)?.message ?? "Ocorreu um erro."}
    </div>
  );
}

function Stepper({
  step,
  done,
}: {
  step: number;
  done: { supplier: boolean; feed: boolean; mapper: boolean };
}) {
  const items = [
    { id: 1, label: "Fornecedor", complete: done.supplier },
    { id: 2, label: "Feed", complete: done.feed },
    { id: 3, label: "Mapper", complete: done.mapper },
  ];
  return (
    <ol className="flex items-center gap-6">
      {items.map((it, idx) => {
        const isActive = step === it.id;
        const isDone = it.complete || it.id < step;
        return (
          <li key={idx} className="flex items-center gap-2">
            <span
              className={cn(
                "grid h-6 w-6 place-items-center rounded-full border text-xs",
                isDone
                  ? "border-primary bg-primary text-primary-foreground"
                  : isActive
                  ? "border-foreground"
                  : "border-muted-foreground/40 text-muted-foreground"
              )}
            >
              {isDone ? <Check className="h-3.5 w-3.5" /> : it.id}
            </span>
            <span
              className={cn(
                "text-sm",
                isDone
                  ? "text-foreground"
                  : isActive
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {it.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/* --------------------------------------------------------------------------------
   WIZARD
---------------------------------------------------------------------------------*/
export default function SupplierCreateWizard() {
  const nav = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // created ids (passam entre steps)
  const [supplier, setSupplier] = useState<SupplierOut | null>(null);
  const [feed, setFeed] = useState<SupplierFeedOut | null>(null);

  const done = {
    supplier: !!supplier,
    feed: !!feed,
    mapper: false,
  };

  return (
    <div className="mx-auto space-y-6">
      {/* Header */}
      <div className="rounded-2xl border p-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Novo fornecedor
            </h1>
            <p className="text-sm text-muted-foreground">
              Cria o fornecedor e configura o feed e o mapeamento.
            </p>
          </div>
          <Stepper step={step} done={done} />
        </div>
      </div>

      {/* Steps */}
      <Card className="p-6">
        {step === 1 && (
          <StepSupplier
            defaultActive
            onCancel={() => nav("/suppliers")}
            onNext={(sup) => {
              setSupplier(sup);
              setStep(2);
            }}
          />
        )}

        {step === 2 && supplier && (
          <StepFeed
            supplierId={supplier.id}
            onBack={() => setStep(1)}
            onNext={(f) => {
              setFeed(f);
              setStep(3);
            }}
          />
        )}

        {step === 3 && supplier && feed && (
          <StepMapper
            feedId={feed.id}
            onBack={() => setStep(2)}
            onDone={() => nav("/suppliers")}
          />
        )}
      </Card>
    </div>
  );
}

/* --------------------------------------------------------------------------------
   STEP 1: SUPPLIER
---------------------------------------------------------------------------------*/
function StepSupplier({
  onCancel,
  onNext,
  defaultActive = true,
}: {
  onCancel: () => void;
  onNext: (created: SupplierOut) => void;
  defaultActive?: boolean;
}) {
  const [form, setForm] = useState<SupplierCreate>({
    name: "",
    active: defaultActive,
    logo_image: "",
    contact_name: "",
    contact_phone: "",
    contact_email: "",
    margin: 0,
    country: "",
  });

  const canSubmit = form.name.trim().length > 0;

  const createMutation = useMutation({
    mutationFn: async (payload: SupplierCreate) => {
      return await http.post<SupplierOut>(Endpoints.SUPPLIERS, payload);
    },
  });

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Dados do fornecedor</h2>
        <Badge variant={form.active ? "secondary" : "outline"}>
          {form.active ? "Ativo" : "Inativo"}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="grid gap-2">
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Acme, Inc."
            autoFocus
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="country">País</Label>
          <Input
            id="country"
            value={form.country ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, country: e.target.value }))
            }
            placeholder="PT"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="logo">Logo (URL)</Label>
          <Input
            id="logo"
            value={form.logo_image ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, logo_image: e.target.value }))
            }
            placeholder="https://…/logo.png"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="margin">Margem (%)</Label>
          <Input
            id="margin"
            type="number"
            value={String(form.margin ?? 0)}
            onChange={(e) =>
              setForm((f) => ({ ...f, margin: Number(e.target.value) || 0 }))
            }
            min={0}
            step={0.01}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="cname">Contacto (nome)</Label>
          <Input
            id="cname"
            value={form.contact_name ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, contact_name: e.target.value }))
            }
            placeholder="Nome do contacto"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="cphone">Contacto (telefone)</Label>
          <Input
            id="cphone"
            value={form.contact_phone ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, contact_phone: e.target.value }))
            }
            placeholder="+351 9xx xxx xxx"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="cemail">Contacto (email)</Label>
          <Input
            id="cemail"
            type="email"
            value={form.contact_email ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, contact_email: e.target.value }))
            }
            placeholder="email@empresa.com"
          />
        </div>

        <div className="grid gap-2">
          <Label>Estado</Label>
          <Select
            value={form.active ? "true" : "false"}
            onValueChange={(v) =>
              setForm((f) => ({ ...f, active: v === "true" }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Ativo</SelectItem>
              <SelectItem value="false">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <ErrorNote error={createMutation.error} />

      <div className="mt-2 flex items-center justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          onClick={async () => {
            const created = await createMutation.mutateAsync(form);
            onNext(created);
          }}
          disabled={!canSubmit || createMutation.isPending}
        >
          {createMutation.isPending ? (
            "A criar…"
          ) : (
            <>
              Continuar <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------------
   STEP 2: FEED
---------------------------------------------------------------------------------*/
function StepFeed({
  supplierId,
  onBack,
  onNext,
}: {
  supplierId: number;
  onBack: () => void;
  onNext: (feed: SupplierFeedOut) => void;
}) {
  const [form, setForm] = useState<SupplierFeedCreate>({
    kind: "supplier",
    format: "csv",
    url: "",
    active: true,
    headers: null,
    params: null,
    auth_kind: null,
    auth: null,
    extra: null,
    csv_delimiter: ",",
  });

  const [jsonHeaders, setJsonHeaders] = useState("");
  const [jsonParams, setJsonParams] = useState("");
  const [jsonAuth, setJsonAuth] = useState("");
  const [jsonExtra, setJsonExtra] = useState("");
  const [maxRows, setMaxRows] = useState<number>(20);

  const [testResult, setTestResult] = useState<FeedTestResponse | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const headersFromPreview = useMemo<string[] | null>(() => {
    const row = testResult?.rows_preview?.[0];
    return row ? Object.keys(row) : null;
  }, [testResult]);

  const testMutation = useMutation({
    mutationFn: async (payload: FeedTestRequest) => {
      return await http.post<FeedTestResponse>(Endpoints.FEEDS_TEST, payload);
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async (payload: SupplierFeedCreate) => {
      return await http.put<SupplierFeedOut>(
        Endpoints.FEED_BY_SUPPLIER(supplierId),
        payload
      );
    },
  });

  function collectPayload(): { payload: SupplierFeedCreate; jsonErr?: string } {
    const h = parseJson<Record<string, string>>(jsonHeaders);
    const p = parseJson<Record<string, string>>(jsonParams);
    const a = parseJson<Record<string, any>>(jsonAuth);
    const e = parseJson<Record<string, any>>(jsonExtra);

    const firstError = h.error || p.error || a.error || e.error;
    const payload: SupplierFeedCreate = {
      ...form,
      headers: h.data,
      params: p.data,
      auth: a.data,
      extra: e.data,
    };
    return { payload, jsonErr: firstError };
  }

  const canTest = form.url.trim().length > 0 && form.format.trim().length > 0;
  const canSave = canTest;

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Configuração do feed</h2>
        <Badge variant={form.active ? "secondary" : "outline"}>
          {form.active ? "Ativo" : "Inativo"}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="grid gap-2">
          <Label>Kind</Label>
          <Input
            value={form.kind}
            onChange={(e) => setForm((f) => ({ ...f, kind: e.target.value }))}
            placeholder="supplier | products | ..."
          />
        </div>

        <div className="grid gap-2">
          <Label>Formato</Label>
          <Select
            value={form.format}
            onValueChange={(v) => setForm((f) => ({ ...f, format: v }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">csv</SelectItem>
              <SelectItem value="json">json</SelectItem>
              <SelectItem value="xml">xml</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2 grid gap-2">
          <Label>URL</Label>
          <Input
            value={form.url}
            onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
            placeholder="https://…/feed.csv"
          />
        </div>

        <div className="grid gap-2">
          <Label>CSV delimiter</Label>
          <Input
            value={form.csv_delimiter ?? ","}
            onChange={(e) =>
              setForm((f) => ({ ...f, csv_delimiter: e.target.value }))
            }
            placeholder=","
            maxLength={2}
          />
        </div>

        <div className="grid gap-2">
          <Label>Estado</Label>
          <Select
            value={form.active ? "true" : "false"}
            onValueChange={(v) =>
              setForm((f) => ({ ...f, active: v === "true" }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Ativo</SelectItem>
              <SelectItem value="false">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>Headers (JSON)</Label>
          <JsonTextarea
            value={jsonHeaders}
            onChange={setJsonHeaders}
            placeholder='{"Authorization":"Bearer ..."}'
          />
        </div>

        <div className="grid gap-2">
          <Label>Query Params (JSON)</Label>
          <JsonTextarea
            value={jsonParams}
            onChange={setJsonParams}
            placeholder='{"page":"1"}'
          />
        </div>

        <div className="grid gap-2">
          <Label>Auth kind</Label>
          <Input
            value={form.auth_kind ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, auth_kind: e.target.value || null }))
            }
            placeholder="api_key | basic | oauth2 … (opcional)"
          />
        </div>

        <div className="grid gap-2">
          <Label>Auth (JSON)</Label>
          <JsonTextarea
            value={jsonAuth}
            onChange={setJsonAuth}
            placeholder='{"api_key":"..."}'
          />
        </div>

        <div className="col-span-2 grid gap-2">
          <Label>Extra (JSON)</Label>
          <JsonTextarea
            value={jsonExtra}
            onChange={setJsonExtra}
            placeholder='{"notes":"…"}'
          />
        </div>

        <div className="grid gap-2">
          <Label>Max rows (teste)</Label>
          <Input
            type="number"
            min={1}
            value={String(maxRows)}
            onChange={(e) =>
              setMaxRows(Math.max(1, Number(e.target.value) || 1))
            }
          />
        </div>
      </div>

      {/* Test feed */}
      <div className="rounded-lg border bg-muted/20 p-4">
        <div className="mb-3 flex items-center gap-2">
          <FlaskConical className="h-4 w-4" />
          <h3 className="font-medium">Teste rápido</h3>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            disabled={!canTest || testMutation.isPending}
            onClick={async () => {
              setTestError(null);
              setTestResult(null);
              const { payload, jsonErr } = collectPayload();
              if (jsonErr) {
                setTestError(jsonErr);
                return;
              }
              const resp = await testMutation.mutateAsync({
                kind: payload.kind,
                format: payload.format,
                url: payload.url,
                headers: payload.headers,
                params: payload.params,
                auth_kind: payload.auth_kind,
                auth: payload.auth,
                extra: payload.extra,
                csv_delimiter: payload.csv_delimiter,
                max_rows: maxRows,
              });
              setTestResult(resp);
              if (!resp.ok)
                setTestError(resp.error || "Falha no teste do feed");
            }}
          >
            {testMutation.isPending ? "A testar…" : "Testar feed"}
          </Button>

          {testResult && (
            <span className="text-sm text-muted-foreground">
              {testResult.ok ? (
                <>
                  <ShieldCheck className="mr-1 inline h-4 w-4 text-emerald-600" />
                  {testResult.rows_preview?.length ?? 0} linhas de
                  pré-visualização
                </>
              ) : (
                <>
                  <TriangleAlert className="mr-1 inline h-4 w-4 text-amber-600" />
                  Erro • {testResult.status_code}
                </>
              )}
            </span>
          )}
        </div>

        {testError && (
          <div className="mt-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {testError}
          </div>
        )}

        {testResult?.rows_preview && (
          <div className="mt-4 overflow-auto rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  {Object.keys(testResult.rows_preview[0] ?? {}).map((h) => (
                    <th key={h} className="px-3 py-2 text-left font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {testResult.rows_preview.slice(0, 5).map((row, i) => (
                  <tr key={i} className="border-t">
                    {Object.values(row).map((v, j) => (
                      <td key={j} className="px-3 py-2">
                        {String(v)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ErrorNote error={upsertMutation.error} />

      <div className="mt-2 flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <Button
          onClick={async () => {
            const { payload, jsonErr } = collectPayload();
            if (jsonErr) {
              alert(`Erro JSON: ${jsonErr}`);
              return;
            }
            const created = await upsertMutation.mutateAsync(payload);
            onNext(created);
          }}
          disabled={!canSave || upsertMutation.isPending}
        >
          {upsertMutation.isPending ? (
            "A guardar…"
          ) : (
            <>
              Continuar <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------------
   STEP 3: MAPPER
---------------------------------------------------------------------------------*/
function StepMapper({
  feedId,
  onBack,
  onDone,
}: {
  feedId: number;
  onBack: () => void;
  onDone: () => void;
}) {
  // perfil JSON inicial mínimo
  const [profileText, setProfileText] = useState<string>(() =>
    JSON.stringify(
      {
        fields: {
          // exemplo: "dest_field": "source_header"
        },
      },
      null,
      2
    )
  );
  const [validateResult, setValidateResult] =
    useState<MapperValidateOut | null>(null);
  const headersInputRef = useRef<HTMLInputElement>(null);

  const validateMutation = useMutation({
    mutationFn: async (payload: MapperValidateIn) => {
      return await http.post<MapperValidateOut>(
        Endpoints.MAPPER_VALIDATE(feedId),
        payload
      );
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: FeedMapperUpsert) => {
      return await http.put<FeedMapperOut>(
        Endpoints.MAPPER_BY_FEED(feedId),
        payload
      );
    },
  });

  async function handleValidate() {
    const prof = parseJson<Record<string, any>>(profileText);
    if (prof.error) {
      alert(`JSON inválido no profile: ${prof.error}`);
      return;
    }
    const headersCsv = headersInputRef.current?.value?.trim() || "";
    const headers = headersCsv
      ? headersCsv
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : null;
    const res = await validateMutation.mutateAsync({
      profile: prof.data ?? {},
      headers,
    });
    setValidateResult(res);
  }

  const canSave = !!validateResult?.ok;

  return (
    <div className="grid gap-6">
      <h2 className="text-lg font-medium">Mapper</h2>

      <div className="grid grid-cols-2 gap-5">
        <div className="grid gap-2">
          <Label>Profile (JSON)</Label>
          <JsonTextarea
            value={profileText}
            onChange={setProfileText}
            rows={16}
            placeholder='{"fields": {"dest":"source"}}'
          />
          <p className="text-xs text-muted-foreground">
            Define como as colunas do feed mapeiam para os campos de destino.
          </p>
        </div>

        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label>Headers (lista opcional, separados por vírgula)</Label>
            <Input ref={headersInputRef} placeholder="sku,name,price,stock" />
            <p className="text-xs text-muted-foreground">
              Se souberes as colunas do feed, inclui-as para validação mais
              precisa.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleValidate}
              disabled={validateMutation.isPending}
            >
              {validateMutation.isPending ? "A validar…" : "Validar"}
            </Button>
            {validateResult && (
              <span
                className={cn(
                  "text-sm",
                  validateResult.ok ? "text-emerald-600" : "text-amber-600"
                )}
              >
                {validateResult.ok ? "Válido" : "Com avisos/erros"}
              </span>
            )}
          </div>

          {validateResult && (
            <div className="grid gap-3 rounded-lg border p-3">
              <div className="text-sm">
                <span className="font-medium">Cobertura requerida:</span>{" "}
                <code className="text-xs">
                  {Object.keys(validateResult.required_coverage || {}).length}{" "}
                  campos
                </code>
              </div>

              {validateResult.errors?.length > 0 && (
                <BlockList
                  title="Erros"
                  items={validateResult.errors}
                  tone="destructive"
                />
              )}
              {validateResult.warnings?.length > 0 && (
                <BlockList
                  title="Avisos"
                  items={validateResult.warnings}
                  tone="amber"
                />
              )}
            </div>
          )}

          <ErrorNote error={saveMutation.error} />
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <Button
          onClick={async () => {
            const prof = parseJson<Record<string, any>>(profileText);
            if (prof.error) {
              alert(`JSON inválido no profile: ${prof.error}`);
              return;
            }
            await saveMutation.mutateAsync({
              profile: prof.data ?? {},
              bump_version: true,
            });
            onDone();
          }}
          disabled={!canSave || saveMutation.isPending}
        >
          {saveMutation.isPending ? (
            "A guardar…"
          ) : (
            <>
              Concluir <Save className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function BlockList({
  title,
  items,
  tone = "destructive",
}: {
  title: string;
  items: Array<Record<string, any>>;
  tone?: "destructive" | "amber";
}) {
  const color = tone === "destructive" ? "text-destructive" : "text-amber-600";
  const border =
    tone === "destructive" ? "border-destructive/30" : "border-amber-500/30";
  const bg = tone === "destructive" ? "bg-destructive/10" : "bg-amber-500/10";
  return (
    <div className={cn("rounded-md border px-3 py-2 text-sm", border, bg)}>
      <div className={cn("mb-1 font-medium", color)}>{title}</div>
      <ul className="list-inside list-disc space-y-1">
        {items.map((it, i) => (
          <li key={i} className="break-words">
            <code className="text-xs">{JSON.stringify(it)}</code>
          </li>
        ))}
      </ul>
    </div>
  );
}
