import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import ErrorNote from "./error-note";
import { useUpsertMapper, useValidateMapper } from "../queries";

function parseJson<T = any>(
  s: string
): { data: T | null; error: string | null } {
  const t = (s || "").trim();
  if (!t) return { data: {} as any, error: null };
  try {
    return { data: JSON.parse(t) as T, error: null };
  } catch (e: any) {
    return { data: null, error: e?.message || "JSON inválido" };
  }
}

function cx(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}

export default function StepMapper({
  feedId,
  onBack,
  onDone,
}: {
  feedId: number;
  onBack: () => void;
  onDone: () => void;
}) {
  const [profileText, setProfileText] = useState<string>(() =>
    JSON.stringify(
      {
        input: "csv",
        fields: {
          // "dest_field": { "source": "Header", "required": true }
        },
      },
      null,
      2
    )
  );
  const [validateResult, setValidateResult] = useState<any | null>(null);
  const headersRef = useRef<HTMLInputElement>(null);

  const validateM = useValidateMapper(feedId);
  const saveM = useUpsertMapper(feedId);

  async function onValidate() {
    setValidateResult(null);
    const prof = parseJson<Record<string, any>>(profileText);
    if (prof.error) {
      setValidateResult({
        ok: false,
        errors: [{ message: `JSON inválido: ${prof.error}` }],
        warnings: [],
        required_coverage: {},
        headers_checked: false,
      });
      return;
    }
    const headersCsv = headersRef.current?.value?.trim() || "";
    const headers = headersCsv
      ? headersCsv
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : null;
    const res = await validateM.mutateAsync({
      profile: prof.data ?? {},
      headers,
    });
    setValidateResult(res);
  }

  async function onSave() {
    const prof = parseJson<Record<string, any>>(profileText);
    if (prof.error) {
      alert(`JSON inválido: ${prof.error}`);
      return;
    }
    await saveM.mutateAsync({ profile: prof.data ?? {}, bump_version: true });
    onDone();
  }

  return (
    <>
      <CardHeader className="p-0">
        <CardTitle>Mapper</CardTitle>
        <CardDescription>
          Valida o perfil e guarda o mapeamento.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 p-0 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 space-y-2">
            <Label>Profile (JSON)</Label>
            <textarea
              value={profileText}
              onChange={(e) => setProfileText(e.target.value)}
              rows={18}
              className="font-mono text-xs w-full rounded-md border bg-background px-3 py-2"
              spellCheck={false}
              placeholder='{"input":"csv","fields":{"name":{"source":"Name"}}}'
            />
            <p className="text-xs text-muted-foreground">
              Define como as colunas/chaves do feed mapeiam para os campos
              internos.
            </p>
          </div>

          <div className="md:col-span-4 space-y-3">
            <div className="space-y-1">
              <Label>Headers (opcional, vírgulas)</Label>
              <Input ref={headersRef} placeholder="sku,name,price,stock" />
              <p className="text-xs text-muted-foreground">
                Ajuda a validação a verificar cobertura.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onValidate}
                disabled={validateM.isPending}
              >
                {validateM.isPending ? "A validar…" : "Validar"}
              </Button>
              {validateResult && (
                <span
                  className={cx(
                    "text-sm",
                    validateResult.ok ? "text-emerald-600" : "text-amber-600"
                  )}
                >
                  {validateResult.ok ? "Válido" : "Com avisos/erros"}
                </span>
              )}
            </div>

            {validateResult && (
              <div className="space-y-2 rounded-lg border p-3">
                <div className="text-sm">
                  Cobertura requerida:{" "}
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

            <ErrorNote error={saveM.error || validateM.error} />
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between p-0 pt-6">
        <Button variant="outline" onClick={onBack}>
          Voltar
        </Button>
        <Button onClick={onSave} disabled={saveM.isPending}>
          {saveM.isPending ? "A guardar…" : "Concluir"}
        </Button>
      </CardFooter>
    </>
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
    <div className={`rounded-md border px-3 py-2 text-sm ${border} ${bg}`}>
      <div className={`mb-1 font-medium ${color}`}>{title}</div>
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
