// src/features/suppliers/edit/index.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { useSupplierDetail } from "../queries";
import { supplierKeys } from "../queries";
import {
  useUpdateSupplierOnly,
  useUpdateSupplierFeed,
  useUpdateSupplierMapper,
  useValidateMapper,
} from "./queries";

import FeedOrigin from "@/features/suppliers/create/components/feed-origin";
import FeedAdvanced from "@/features/suppliers/create/components/feed-advanced";
import {
  kvToRecord,
  recordToKV,
  safeParseObjJSON,
  ensureAuthShape,
  type KV,
} from "@/features/suppliers/create/utils";
import type { SupplierDetailOut, SupplierFeedCreate } from "@/api/suppliers";

// ---------------- Supplier form ----------------
type SupplierForm = {
  name: string;
  active: boolean;
  logo_image: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  margin: number | null;
  country: string | null;
};

// ---------------- Feed form ----------------
type FeedForm = {
  kind: "http" | "ftp" | "supplier";
  format: "csv" | "json" | "xml";
  url: string;
  active: boolean;
  csv_delimiter: string | null;

  auth_kind:
    | "none"
    | "basic"
    | "bearer"
    | "api_key"
    | "oauth_password"
    | "ftp_password";
  headers_kv: KV[];
  params_kv: KV[];
  auth_kv: KV[];

  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body_json_text: string;

  pagination_enabled: boolean;
  page_field?: string;
  size_field?: string;
  page_start?: string;
  page_max_pages?: string;
  page_stop_on_empty?: boolean;
};

export default function SupplierEditPage() {
  const { id } = useParams<{ id: string }>();
  const supplierId = id ? Number(id) : NaN;
  const nav = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading, refetch } = useSupplierDetail(
    Number.isFinite(supplierId) ? supplierId : undefined
  );

  // ---------------- Supplier form setup ----------------
  const supForm = useForm<SupplierForm>({
    defaultValues: {
      name: "",
      active: true,
      logo_image: null,
      contact_name: null,
      contact_phone: null,
      contact_email: null,
      margin: null,
      country: null,
    },
    mode: "onBlur",
  });

  useEffect(() => {
    if (!data) return;
    const s = data.supplier;
    supForm.reset(
      {
        name: s.name ?? "",
        active: !!s.active,
        logo_image: s.logo_image ?? null,
        contact_name: s.contact_name ?? null,
        contact_phone: s.contact_phone ?? null,
        contact_email: s.contact_email ?? null,
        margin: typeof s.margin === "number" ? s.margin : null,
        country: s.country ?? null,
      },
      { keepDirty: false, keepTouched: false }
    );
  }, [data, supForm]);

  const updateSupplierM = useUpdateSupplierOnly(supplierId, async () => {
    await qc.invalidateQueries({ queryKey: supplierKeys.root });
    await refetch();
  });

  const submitSupplier = (vals: SupplierForm) => {
    updateSupplierM.mutate({
      name: vals.name,
      active: vals.active,
      logo_image: emptyToNull(vals.logo_image),
      contact_name: emptyToNull(vals.contact_name),
      contact_phone: emptyToNull(vals.contact_phone),
      contact_email: emptyToNull(vals.contact_email),
      margin: vals.margin ?? 0,
      country: emptyToNull(vals.country),
    });
  };

  // ---------------- Feed form setup ----------------
  const feedForm = useForm<FeedForm>({
    defaultValues: {
      kind: "http",
      format: "csv",
      url: "",
      active: true,
      csv_delimiter: ",",
      auth_kind: "none",
      headers_kv: [],
      params_kv: [],
      auth_kv: [],
      method: "GET",
      body_json_text: "",
      pagination_enabled: false,
      page_field: "page",
      size_field: "page_size",
      page_start: "1",
      page_max_pages: "1000",
      page_stop_on_empty: true,
    },
    mode: "onBlur",
  });

  // prefill feed
  useEffect(() => {
    const d = data as SupplierDetailOut | undefined;
    if (!d || !d.feed) return;
    const f = d.feed;

    const headersObj = safeParseObjJSON(f.headers_json ?? (f as any).headers);
    const paramsObj = safeParseObjJSON(f.params_json ?? (f as any).params);
    const authObj = safeParseObjJSON(f.auth_json ?? (f as any).auth);
    const extraObj = safeParseObjJSON(f.extra_json ?? (f as any).extra);

    let authKV = recordToKV(authObj || {});
    authKV = ensureAuthShape(
      authKV,
      (f as any).auth_kind || undefined,
      f.kind as any
    );

    const baseVals: Partial<FeedForm> = {
      kind: f.kind as any,
      format: f.format as any,
      url: f.url,
      active: f.active,
      csv_delimiter: f.format === "csv" ? f.csv_delimiter ?? "," : null,
      auth_kind: ((f as any).auth_kind as any) ?? "none",
      headers_kv: recordToKV(headersObj || {}),
      params_kv: recordToKV(paramsObj || {}),
      auth_kv: authKV,
      method: "GET",
      body_json_text: "",
      pagination_enabled: false,
      page_field: "page",
      size_field: "page_size",
      page_start: "1",
      page_max_pages: "1000",
      page_stop_on_empty: true,
    };

    if (extraObj && typeof extraObj === "object") {
      if (typeof extraObj.method === "string") {
        baseVals.method = String(
          extraObj.method
        ).toUpperCase() as FeedForm["method"];
      }
      if (extraObj.body_json && typeof extraObj.body_json === "object") {
        baseVals.body_json_text = JSON.stringify(extraObj.body_json, null, 2);
      }
      if (extraObj.pagination && typeof extraObj.pagination === "object") {
        const p = extraObj.pagination as any;
        baseVals.pagination_enabled = true;
        baseVals.page_field = p.page_field ?? "page";
        baseVals.size_field = p.size_field ?? "page_size";
        baseVals.page_start = String(p.start ?? "1");
        baseVals.page_max_pages = String(p.max_pages ?? "1000");
        baseVals.page_stop_on_empty =
          typeof p.stop_on_empty === "boolean" ? p.stop_on_empty : true;
      }
    }

    feedForm.reset(baseVals as FeedForm, {
      keepDirty: false,
      keepTouched: false,
    });

    // garantir notificação dos watchers e não perder focus
    setTimeout(() => {
      feedForm.setValue("auth_kind", baseVals.auth_kind ?? "none", {
        shouldDirty: false,
      });
      feedForm.setValue("auth_kv", baseVals.auth_kv ?? [], {
        shouldDirty: false,
      });
      feedForm.setValue("headers_kv", baseVals.headers_kv ?? [], {
        shouldDirty: false,
      });
      feedForm.setValue("params_kv", baseVals.params_kv ?? [], {
        shouldDirty: false,
      });
    }, 0);
  }, [data, feedForm]);

  const feedKind = feedForm.watch("kind");
  const feedFormat = feedForm.watch("format");
  const feedAuthKind =
    (feedForm.watch("auth_kind") as string | undefined) ?? "none";

  useEffect(() => {
    const allowed =
      feedKind === "ftp"
        ? ["none", "ftp_password"]
        : ["none", "basic", "bearer", "api_key", "oauth_password"];
    if (!allowed.includes(feedAuthKind)) {
      feedForm.setValue("auth_kind", "none", { shouldDirty: true });
      feedForm.setValue("auth_kv", [], { shouldDirty: true });
      return;
    }
    if (feedAuthKind === "none") {
      feedForm.setValue("auth_kv", [], { shouldDirty: true });
      return;
    }
    const cur = (feedForm.getValues("auth_kv") as KV[]) || [];
    const shaped = ensureAuthShape(cur, feedAuthKind, feedKind as any);
    if (JSON.stringify(cur) !== JSON.stringify(shaped)) {
      feedForm.setValue("auth_kv", shaped, { shouldDirty: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedKind, feedAuthKind]);

  useEffect(() => {
    if (feedFormat === "csv") {
      const cur = feedForm.getValues("csv_delimiter");
      if (!cur) feedForm.setValue("csv_delimiter", ",", { shouldDirty: true });
    } else if (feedForm.getValues("csv_delimiter") !== null) {
      feedForm.setValue("csv_delimiter", null, { shouldDirty: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedFormat]);

  // Remount controlado apenas por tipo de auth (evita perder focus ao digitar)
  const watchAuthKind = useWatch({
    control: feedForm.control,
    name: "auth_kind",
  }) as string | undefined;
  const feedAdvancedKey = `adv-${watchAuthKind ?? "none"}`;

  const buildExtra = (v: FeedForm) => {
    if (v.kind !== "http") return {};
    const extra: any = { method: v.method || "GET" };
    const bodyTxt = (v.body_json_text || "").trim();
    if (bodyTxt) {
      try {
        extra.body_json = JSON.parse(bodyTxt);
      } catch {}
    }
    if (v.pagination_enabled) {
      const start = parseInt((v.page_start || "1").trim(), 10);
      const maxPages = parseInt((v.page_max_pages || "1000").trim(), 10);
      extra.pagination = {
        mode: "page",
        page_field: v.page_field || "page",
        size_field: v.size_field || "page_size",
        start: Number.isFinite(start) ? start : 1,
        max_pages: Number.isFinite(maxPages) ? maxPages : 1000,
        stop_on_empty:
          typeof v.page_stop_on_empty === "boolean"
            ? v.page_stop_on_empty
            : true,
      };
    }
    return extra;
  };

  const feedPayloadFromForm = (v: FeedForm): SupplierFeedCreate => ({
    kind: v.kind,
    format: v.format,
    url: v.url,
    active: v.active,
    csv_delimiter: v.format === "csv" ? v.csv_delimiter || "," : undefined,
    headers: kvToRecord(v.headers_kv),
    params: kvToRecord(v.params_kv),
    auth_kind: v.auth_kind && v.auth_kind !== "none" ? v.auth_kind : "none",
    auth: v.auth_kind && v.auth_kind !== "none" ? kvToRecord(v.auth_kv) : null,
    extra: buildExtra(v),
  });

  const updateFeedM = useUpdateSupplierFeed(supplierId, async () => {
    await qc.invalidateQueries({ queryKey: supplierKeys.root });
    await refetch();
  });

  const submitFeed = (vals: FeedForm) => {
    updateFeedM.mutate(feedPayloadFromForm(vals));
  };

  // ---------------- Mapper editor ----------------
  const feedId = data?.feed?.id ?? undefined;
  const [mapperText, setMapperText] = useState<string>("");

  useEffect(() => {
    const m = data?.mapper?.profile ?? null;
    if (m && typeof m === "object") {
      setMapperText(JSON.stringify(m, null, 2));
    } else {
      setMapperText('{\n  "fields": {}\n}');
    }
  }, [data?.mapper]);

  const validateMapperM = useValidateMapper(feedId);
  const saveMapperM = useUpdateSupplierMapper(supplierId, async () => {
    await qc.invalidateQueries({ queryKey: supplierKeys.root });
    await refetch();
  });

  const parseMapper = () => {
    try {
      return JSON.parse(mapperText || "{}");
    } catch (e: any) {
      toast.error("JSON inválido no mapper.", {
        description: String(e?.message ?? "Corrija o JSON."),
      });
      return null;
    }
  };

  const onValidateMapper = () => {
    const parsed = parseMapper();
    if (!parsed) return;
    validateMapperM.mutate({ profile: parsed });
  };

  const onSaveMapper = () => {
    const parsed = parseMapper();
    if (!parsed) return;
    if (!feedId) {
      toast.error("Não existe feed associado a este fornecedor.");
      return;
    }
    saveMapperM.mutate({ profile: parsed, bump_version: true });
  };

  const mapperVersion = data?.mapper?.version ?? null;

  const headerBadge = useMemo(() => {
    const active = supForm.watch("active");
    return (
      <Badge variant={active ? "secondary" : "outline"}>
        {active ? "Ativo" : "Inativo"}
      </Badge>
    );
  }, [supForm]);

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">
              {data
                ? `Editar fornecedor: ${data.supplier.name}`
                : "Editar fornecedor"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Fornecedor • Feed • Mapper
            </p>
          </div>
          {headerBadge}
        </div>
      </Card>

      <Card className="p-6">
        <Tabs defaultValue="supplier">
          <TabsList>
            <TabsTrigger value="supplier">Fornecedor</TabsTrigger>
            <TabsTrigger value="feed">Feed</TabsTrigger>
            <TabsTrigger value="mapper">Mapper</TabsTrigger>
          </TabsList>

          <TabsContent value="supplier" className="space-y-6 pt-4">
            <form
              className="space-y-6"
              onSubmit={supForm.handleSubmit(submitSupplier)}
            >
              <section className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-6 space-y-1">
                  <Label>Nome</Label>
                  <Input
                    placeholder="Nome do fornecedor"
                    {...supForm.register("name", { required: true })}
                    disabled={isLoading || updateSupplierM.isPending}
                  />
                </div>

                <div className="md:col-span-3 space-y-1">
                  <Label>País</Label>
                  <Input
                    placeholder="PT"
                    {...supForm.register("country")}
                    disabled={isLoading || updateSupplierM.isPending}
                  />
                </div>

                <div className="md:col-span-3 space-y-1">
                  <Label className="block">Ativo</Label>
                  <div className="h-10 flex items-center">
                    <Switch
                      checked={!!supForm.watch("active")}
                      onCheckedChange={(v) =>
                        supForm.setValue("active", v, { shouldDirty: true })
                      }
                      disabled={isLoading || updateSupplierM.isPending}
                    />
                  </div>
                </div>

                <div className="md:col-span-6 space-y-1">
                  <Label>Logo (URL)</Label>
                  <Input
                    placeholder="https://…"
                    value={supForm.watch("logo_image") ?? ""}
                    onChange={(e) =>
                      supForm.setValue("logo_image", e.target.value || null, {
                        shouldDirty: true,
                      })
                    }
                    disabled={isLoading || updateSupplierM.isPending}
                  />
                </div>

                <div className="md:col-span-3 space-y-1">
                  <Label>Margem (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="10"
                    value={supForm.watch("margin") ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      supForm.setValue("margin", v === "" ? null : Number(v), {
                        shouldDirty: true,
                      });
                    }}
                    disabled={isLoading || updateSupplierM.isPending}
                  />
                </div>
              </section>

              <Separator />

              <section className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-4 space-y-1">
                  <Label>Contacto (nome)</Label>
                  <Input
                    placeholder="Nome do contacto"
                    value={supForm.watch("contact_name") ?? ""}
                    onChange={(e) =>
                      supForm.setValue("contact_name", e.target.value || null, {
                        shouldDirty: true,
                      })
                    }
                    disabled={isLoading || updateSupplierM.isPending}
                  />
                </div>
                <div className="md:col-span-4 space-y-1">
                  <Label>Contacto (telefone)</Label>
                  <Input
                    placeholder="+351…"
                    value={supForm.watch("contact_phone") ?? ""}
                    onChange={(e) =>
                      supForm.setValue(
                        "contact_phone",
                        e.target.value || null,
                        {
                          shouldDirty: true,
                        }
                      )
                    }
                    disabled={isLoading || updateSupplierM.isPending}
                  />
                </div>
                <div className="md:col-span-4 space-y-1">
                  <Label>Contacto (email)</Label>
                  <Input
                    type="email"
                    placeholder="email@exemplo.com"
                    value={supForm.watch("contact_email") ?? ""}
                    onChange={(e) =>
                      supForm.setValue(
                        "contact_email",
                        e.target.value || null,
                        {
                          shouldDirty: true,
                        }
                      )
                    }
                    disabled={isLoading || updateSupplierM.isPending}
                  />
                </div>
              </section>

              <div className="flex justify-between pt-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => nav("/suppliers")}
                  disabled={updateSupplierM.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={updateSupplierM.isPending}
                  className="gap-2"
                >
                  {updateSupplierM.isPending ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : null}
                  {updateSupplierM.isPending
                    ? "A guardar…"
                    : "Guardar alterações"}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="feed" className="space-y-6 pt-4">
            <FormProvider {...feedForm}>
              <section className="space-y-6">
                <FeedOrigin
                  tabKind={feedForm.watch("kind") as any}
                  setTabKind={(k) =>
                    feedForm.setValue("kind", k, { shouldDirty: true })
                  }
                />
                <FeedAdvanced key={feedAdvancedKey} />
              </section>

              <Separator />

              <section className="space-y-4">
                {feedForm.watch("kind") === "http" ? (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-3 space-y-1">
                      <Label>Método</Label>
                      <select
                        className="h-10 w-full rounded-md border px-2 text-sm"
                        value={feedForm.watch("method")}
                        onChange={(e) =>
                          feedForm.setValue(
                            "method",
                            e.target.value as FeedForm["method"],
                            {
                              shouldDirty: true,
                            }
                          )
                        }
                      >
                        {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-9 space-y-1">
                      <Label>Body JSON (opcional)</Label>
                      <Textarea
                        className="font-mono text-xs min-h-[120px]"
                        placeholder='ex.: { "page": 1, "page_size": 200 }'
                        value={feedForm.watch("body_json_text") ?? ""}
                        onChange={(e) =>
                          feedForm.setValue("body_json_text", e.target.value, {
                            shouldDirty: true,
                          })
                        }
                        spellCheck={false}
                      />
                    </div>
                  </div>
                ) : null}

                <div className="space-y-2 rounded-md border p-3 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="mb-0">Paginar resultados</Label>
                      <p className="text-xs text-muted-foreground">
                        Modo page (page/size/start/max_pages).
                      </p>
                    </div>
                    <Switch
                      checked={!!feedForm.watch("pagination_enabled")}
                      onCheckedChange={(v) =>
                        feedForm.setValue("pagination_enabled", v, {
                          shouldDirty: true,
                        })
                      }
                    />
                  </div>

                  {feedForm.watch("pagination_enabled") && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mt-2">
                      <div className="md:col-span-3">
                        <Label>Campo página</Label>
                        <Input
                          placeholder="page"
                          value={feedForm.watch("page_field") ?? ""}
                          onChange={(e) =>
                            feedForm.setValue("page_field", e.target.value, {
                              shouldDirty: true,
                            })
                          }
                        />
                      </div>
                      <div className="md:col-span-3">
                        <Label>Campo tamanho</Label>
                        <Input
                          placeholder="page_size"
                          value={feedForm.watch("size_field") ?? ""}
                          onChange={(e) =>
                            feedForm.setValue("size_field", e.target.value, {
                              shouldDirty: true,
                            })
                          }
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Início</Label>
                        <Input
                          placeholder="1"
                          value={feedForm.watch("page_start") ?? ""}
                          onChange={(e) =>
                            feedForm.setValue("page_start", e.target.value, {
                              shouldDirty: true,
                            })
                          }
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Máx. páginas</Label>
                        <Input
                          placeholder="1000"
                          value={feedForm.watch("page_max_pages") ?? ""}
                          onChange={(e) =>
                            feedForm.setValue(
                              "page_max_pages",
                              e.target.value,
                              { shouldDirty: true }
                            )
                          }
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label className="block">Parar quando vazio</Label>
                        <div className="flex h-10 items-center">
                          <Switch
                            checked={!!feedForm.watch("page_stop_on_empty")}
                            onCheckedChange={(v) =>
                              feedForm.setValue("page_stop_on_empty", v, {
                                shouldDirty: true,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => nav("/suppliers")}
                >
                  Voltar
                </Button>
                <Button
                  onClick={feedForm.handleSubmit(submitFeed)}
                  disabled={updateFeedM.isPending}
                  className="gap-2"
                >
                  {updateFeedM.isPending ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : null}
                  {updateFeedM.isPending ? "A guardar…" : "Guardar feed"}
                </Button>
              </div>
            </FormProvider>
          </TabsContent>

          <TabsContent value="mapper" className="space-y-6 pt-4">
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Perfil (JSON)</Label>
                  <p className="text-xs text-muted-foreground">
                    Edita o perfil do mapper em JSON. Versão atual:{" "}
                    {mapperVersion !== null ? `v${mapperVersion}` : "—"}
                  </p>
                </div>
                <Badge variant={feedId ? "secondary" : "outline"}>
                  {feedId ? `feed #${feedId}` : "sem feed"}
                </Badge>
              </div>
              <Textarea
                className="font-mono text-xs min-h-[320px]"
                value={mapperText}
                onChange={(e) => setMapperText(e.target.value)}
                spellCheck={false}
              />
            </section>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onValidateMapper}
                disabled={validateMapperM.isPending}
                className="gap-2"
              >
                {validateMapperM.isPending ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : null}
                {validateMapperM.isPending ? "A validar…" : "Validar"}
              </Button>

              <Button
                type="button"
                onClick={onSaveMapper}
                disabled={saveMapperM.isPending}
                className="gap-2"
              >
                {saveMapperM.isPending ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : null}
                {saveMapperM.isPending ? "A guardar…" : "Guardar mapper"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}

function emptyToNull<T extends string | null | undefined>(v: T): string | null {
  if (v === undefined || v === null) return null;
  return v.trim() === "" ? null : v;
}
