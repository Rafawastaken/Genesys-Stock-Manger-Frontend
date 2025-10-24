// src/features/suppliers/create/components/step-mapping.tsx
import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

import KeyValueEditor from "./kv-editor";
import { kvToRecord, recordToKV } from "../utils";
import {
  useSupplierFeed,
  useMapper,
  useUpsertMapper,
  useValidateMapper,
  useMapperOps,
} from "../queries";
import type { SupplierFeedOut, FeedMapperOut } from "@/api/suppliers";

import MappingFieldTable from "./mapping-field-table";
import MappingRequired from "./mapping-required";
import MappingJsonEditor from "./mapping-json-editor";
import RuleEditor from "./rule-editor";
import DropIfEditor from "./drop-if-editor";
import type { ProfileFormRHF } from "../mapping-types";

/* ---------- util ---------- */
const toCanonicalCond = (c: {
  op: string;
  left: string;
  right: string | string[];
}) => {
  if (c.op === "in") {
    const arr = Array.isArray(c.right)
      ? c.right
      : String(c.right)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
    return { in: [c.left, arr] as [string, string[]] } as any;
  }
  const right = Array.isArray(c.right) ? c.right.join(",") : String(c.right);
  return { [c.op]: [c.left, right] } as any;
};
const fromCanonicalCond = (cond: any) => {
  const op = Object.keys(cond)[0] as string;
  const [left, right] = cond[op] as [string, any];
  if (op === "in")
    return { op, left: String(left), right: (right as any[]).map(String) };
  return { op, left: String(left), right: String(right) };
};
const seedProfileFor = (format: "csv" | "json"): ProfileFormRHF => ({
  input: format,
  row_selector: format === "json" ? "$[*]" : null,
  fields: [],
  required: ["name", "gtin", "partnumber", "price", "stock"],
  defaults_kv: [],
  rules: [],
  drop_if: undefined,
});
function fieldsArrayFromProfile(profile: any): ProfileFormRHF["fields"] {
  const f = profile?.fields;
  if (Array.isArray(f)) return f as any;
  if (f && typeof f === "object") {
    return Object.entries(f).map(([target, cfg]: any) => {
      const row: any = { target };
      if (cfg?.source) row.source = cfg.source;
      if (cfg?.required) row.required = !!cfg.required;

      const opts: any = {};
      if (cfg?.trim) opts.trim = true;
      if (cfg?.lowercase) opts.lowercase = true;
      if (cfg?.to_number) opts.to_number = cfg.to_number;
      if (cfg?.value_map) {
        opts.value_map_kv = Object.entries(cfg.value_map).map(
          ([k, v]: any) => ({ key: String(k), value: String(v) })
        );
      }
      if (cfg?.derive) {
        const d = { ...cfg.derive };
        if (Array.isArray(d.when)) d.when = d.when.map(fromCanonicalCond);
        opts.derive = d;
      }
      if (Object.keys(opts).length) row.opts = opts;
      return row;
    });
  }
  return [];
}
function profileFromForm(f: ProfileFormRHF): Record<string, any> {
  const fieldsObj: Record<string, any> = {};
  (f.fields || []).forEach((r) => {
    if (!r.target) return;
    const cfg: Record<string, any> = {};
    if (r.source) cfg.source = r.source;
    if (r.required) cfg.required = true;

    const o = r.opts || {};
    if (o.trim) cfg.trim = true;
    if (o.lowercase) cfg.lowercase = true;
    if (o.to_number && (o.to_number.decimal || o.to_number.thousands)) {
      cfg.to_number = { ...o.to_number };
    }
    if (o.value_map_kv?.length) {
      cfg.value_map = o.value_map_kv.reduce((acc, kv) => {
        acc[kv.key] = kv.value;
        return acc;
      }, {} as Record<string, string>);
    }
    if (o.derive?.when?.length) {
      const when = o.derive.when.map(toCanonicalCond);
      cfg.derive = {
        when,
        then: o.derive.then,
        ...(o.derive.else !== undefined ? { else: o.derive.else } : {}),
      };
    }
    fieldsObj[r.target] = cfg;
  });

  (f.required || []).forEach((t) => {
    fieldsObj[t] = { ...(fieldsObj[t] || {}), required: true };
  });

  const defaults = kvToRecord(f.defaults_kv) || undefined;
  const rules = f.rules?.length
    ? f.rules.map((r) => ({
        when: (r.when || []).map(toCanonicalCond),
        set: kvToRecord(r.set) || {},
      }))
    : undefined;
  const drop_if = f.drop_if?.empty_any_of?.length
    ? [{ empty_any_of: f.drop_if.empty_any_of }]
    : undefined;

  const out: Record<string, any> = {
    input: f.input,
    ...(f.input === "json" ? { row_selector: f.row_selector || "$[*]" } : {}),
    fields: fieldsObj,
    ...(defaults ? { defaults } : {}),
    ...(rules ? { rules } : {}),
    ...(drop_if ? { drop_if } : {}),
  };
  return out;
}

/* ---------- props ---------- */
type Props = {
  supplierId: number;
  feedId: number;
  onBack: () => void;
  onDone: () => void;
};

export default function StepMapper({
  supplierId,
  feedId,
  onBack,
  onDone,
}: Props) {
  const feedQ = useSupplierFeed(supplierId);
  const mapperQ = useMapper(feedId);
  const upsertM = useUpsertMapper(feedId);
  const validateM = useValidateMapper(feedId);
  const mapperOpsQ = useMapperOps();

  const [mode, setMode] = useState<"form" | "json">("form");
  const [bump, setBump] = useState(true);
  const [jsonDraft, setJsonDraft] = useState<string>("{}");
  const [validateMsg, setValidateMsg] = useState<string>("");
  const [saveErr, setSaveErr] = useState<string | null>(null);

  const form = useForm<ProfileFormRHF>({
    defaultValues: seedProfileFor("csv"),
    mode: "onBlur",
  });
  const feed = feedQ.data as SupplierFeedOut | undefined;

  // 1) Se existir mapper no backend, hidratar o formulário
  useEffect(() => {
    const m = mapperQ.data as FeedMapperOut | undefined;
    if (!m?.profile) return;
    const prof = m.profile || {};
    const input: "csv" | "json" = prof.input === "json" ? "json" : "csv";
    const row_selector =
      input === "json"
        ? typeof prof.row_selector === "string"
          ? prof.row_selector
          : "$[*]"
        : null;

    const defaults_kv = recordToKV(prof.defaults || {});
    const requiredArr: string[] = [];
    const fieldsArr = fieldsArrayFromProfile(prof);
    Object.entries(prof.fields || {}).forEach(([target, cfg]: any) => {
      if (cfg?.required) requiredArr.push(target);
    });

    const rulesUI =
      (prof.rules || []).map((r: any) => ({
        when: (r.when || []).map(fromCanonicalCond),
        set: recordToKV(r.set || {}),
      })) || [];

    const dropIfUI =
      Array.isArray(prof.drop_if) && prof.drop_if[0]?.empty_any_of
        ? { empty_any_of: prof.drop_if[0].empty_any_of as string[] }
        : undefined;

    form.reset(
      {
        input,
        row_selector,
        fields: fieldsArr,
        required: Array.from(new Set(requiredArr)),
        defaults_kv,
        rules: rulesUI,
        drop_if: dropIfUI,
      },
      { keepDirty: false, keepTouched: false }
    );
    setJsonDraft(JSON.stringify(prof, null, 2));
  }, [mapperQ.data, form]);

  // 2) Se não houver mapper ainda, seed pelo formato do feed
  useEffect(() => {
    if (mapperQ.data) return; // já hidratado acima
    if (feedQ.isLoading) return;
    const fmt = (feed?.format || "csv").toLowerCase() as "csv" | "json";
    const seeded = seedProfileFor(fmt === "json" ? "json" : "csv");
    form.reset(seeded, { keepDirty: false, keepTouched: false });
    setJsonDraft(JSON.stringify(seeded, null, 2));
  }, [feed?.format, feedQ.isLoading, mapperQ.data, form]);

  const toProfile = (): Record<string, any> | null => {
    try {
      if (mode === "json") return JSON.parse(jsonDraft) as Record<string, any>;
      return profileFromForm(form.getValues());
    } catch {
      return null;
    }
  };

  const onValidate = async () => {
    setValidateMsg("");
    const profile = toProfile();
    if (mode === "json" && !profile) {
      setValidateMsg("JSON inválido.");
      return;
    }
    try {
      const res = await validateM.mutateAsync({
        profile: profile ?? undefined,
      });
      const errs = res.errors?.length || 0;
      const warns = res.warnings?.length || 0;
      setValidateMsg(
        res.ok
          ? `✅ Perfil válido${warns ? ` com ${warns} aviso(s)` : ""}.`
          : `❌ ${errs} erro(s)${warns ? ` + ${warns} aviso(s)` : ""}.`
      );
    } catch (e: any) {
      setValidateMsg(`❌ Falha ao validar: ${e?.message || "erro de rede"}`);
    }
  };

  const handleSave = async (thenFinish = false) => {
    setSaveErr(null);
    const profile = toProfile();
    if (!profile) {
      setSaveErr("JSON inválido.");
      return;
    }
    try {
      await upsertM.mutateAsync({ profile, bump_version: bump });
      if (thenFinish) onDone();
    } catch (e: any) {
      const apiMsg =
        e?.response?.data?.message ||
        e?.response?.data?.detail ||
        e?.message ||
        "Falha ao guardar o mapeamento.";
      setSaveErr(apiMsg);
    }
  };

  const disabled =
    upsertM.isPending ||
    feedQ.isLoading ||
    mapperQ.isLoading ||
    validateM.isPending;

  return (
    <>
      <CardHeader>
        <CardTitle>Mapeamento &amp; normalização</CardTitle>
        <CardDescription>
          Configura o mapeamento de campos e regras (value maps, derive, regras
          condicionais e filtros).
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-8">
        <Tabs value={mode} onValueChange={(v) => setMode(v as "form" | "json")}>
          <TabsList>
            <TabsTrigger value="form">Construtor</TabsTrigger>
            <TabsTrigger value="json">Editor JSON</TabsTrigger>
          </TabsList>

          {/* BUILDER */}
          <TabsContent value="form" className="space-y-6">
            <FormProvider {...form}>
              {/* Linha 1 */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-4 space-y-1">
                  <Label>Formato do feed</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={(feed?.format ?? "csv").toUpperCase()}
                      readOnly
                      className="font-medium"
                    />
                    <span className="text-xs text-muted-foreground">
                      bloqueado pelo feed
                    </span>
                  </div>
                </div>

                {(form.watch("input") ?? feed?.format) === "json" && (
                  <div className="md:col-span-8 space-y-1">
                    <Label>Row selector (JSONPath / caminho)</Label>
                    <Input
                      placeholder="$[*]"
                      value={form.watch("row_selector") ?? ""}
                      onChange={(e) =>
                        form.setValue("row_selector", e.target.value, {
                          shouldDirty: true,
                        })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Ex.: <code>$[*]</code> ou <code>data.items[*]</code>
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              <section className="space-y-3">
                <div>
                  <Label className="text-sm">Mapeamento de campos</Label>
                  <p className="text-xs text-muted-foreground">
                    Associa cada campo interno à coluna/chave e aplica
                    transformações por campo.
                  </p>
                </div>
                <MappingFieldTable />
              </section>

              <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-7 space-y-2">
                  <Label>Campos obrigatórios</Label>
                  <MappingRequired />
                </div>
                <div className="md:col-span-5 space-y-2">
                  <Label>Valores por defeito</Label>
                  <KeyValueEditor
                    value={form.watch("defaults_kv") || []}
                    onChange={(v) =>
                      form.setValue("defaults_kv", v, { shouldDirty: true })
                    }
                    keyPlaceholder="campo"
                    valPlaceholder="valor"
                  />
                  <p className="text-xs text-muted-foreground">
                    Usado quando a fonte não existir ou vier vazia.
                  </p>
                </div>
              </section>

              <Separator />

              <section className="space-y-3">
                <div>
                  <Label className="text-sm">Regras condicionais</Label>
                  <p className="text-xs text-muted-foreground">
                    Executa depois do cálculo/normalização dos campos. Usa{" "}
                    <code>$</code> para ler valores do registo.
                  </p>
                </div>
                <RuleEditor
                  // passa ops do backend (ou vazio → o componente faz fallback)
                  ops={mapperOpsQ.data || []}
                  value={form.watch("rules") ?? []}
                  onChange={(r) =>
                    form.setValue("rules", r, { shouldDirty: true })
                  }
                />
              </section>

              <section className="space-y-3">
                <div>
                  <Label className="text-sm">Filtrar linhas (drop_if)</Label>
                </div>
                <DropIfEditor
                  value={form.watch("drop_if")}
                  onChange={(v) =>
                    form.setValue("drop_if", v, { shouldDirty: true })
                  }
                />
              </section>
            </FormProvider>
          </TabsContent>

          {/* JSON */}
          <TabsContent value="json">
            <MappingJsonEditor value={jsonDraft} onChange={setJsonDraft} />
          </TabsContent>
        </Tabs>

        <Separator />
        <section className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={onValidate}
              disabled={validateM.isPending || disabled}
            >
              {validateM.isPending ? "A validar…" : "Validar perfil"}
            </Button>
            {validateMsg ? (
              <span className="text-xs px-2 py-1 rounded bg-slate-100">
                {validateMsg}
              </span>
            ) : null}
          </div>
        </section>
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Switch checked={bump} onCheckedChange={setBump} id="bump" />
          <Label htmlFor="bump" className="text-sm">
            Incrementar versão ao guardar
          </Label>
        </div>

        <div className="flex gap-2 items-center">
          {saveErr ? (
            <span className="text-xs text-red-600">{saveErr}</span>
          ) : null}
          <Button
            onClick={() => handleSave(false)}
            disabled={disabled || upsertM.isPending}
            className="gap-2"
          >
            {upsertM.isPending ? "A guardar…" : "Guardar"}
          </Button>
          <Button
            variant="outline"
            onClick={onBack}
            disabled={disabled || upsertM.isPending}
          >
            Voltar
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleSave(true)}
            disabled={disabled || upsertM.isPending}
          >
            {upsertM.isPending ? "A guardar…" : "Concluir"}
          </Button>
        </div>
      </CardFooter>

      <datalist id="internal-fields-list">
        <option value="name" />
        <option value="gtin" />
        <option value="partnumber" />
        <option value="price" />
        <option value="stock" />
        <option value="description" />
        <option value="brand" />
        <option value="category" />
        <option value="weight" />
        <option value="mpn" />
        <option value="image_url" />
        <option value="status" />
      </datalist>
    </>
  );
}
