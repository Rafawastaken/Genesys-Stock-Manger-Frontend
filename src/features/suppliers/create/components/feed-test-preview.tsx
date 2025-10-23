import { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { RefreshCw, Play, AlertTriangle, CheckCircle2 } from "lucide-react";

type Fmt = "csv" | "json" | "xml";

type Preview = {
  ok: boolean;
  status_code: number;
  content_type?: string | null;
  bytes_read: number;
  preview_type?: Fmt | null;
  rows_preview: any[];
  error?: string | null;
} | null;

export default function FeedTestPreview({
  preview,
  onTest,
  onClear,
  testing,
}: {
  preview: Preview;
  onTest: () => void;
  onClear: () => void;
  testing?: boolean;
}) {
  const form = useFormContext();

  const previewMeta = useMemo(() => {
    if (!preview) return null;
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        <div className="rounded border p-2">
          <div className="text-muted-foreground">HTTP</div>
          <div className="font-medium">{preview.status_code}</div>
        </div>
        <div className="rounded border p-2">
          <div className="text-muted-foreground">Content-Type</div>
          <div className="font-medium">{preview.content_type ?? "-"}</div>
        </div>
        <div className="rounded border p-2">
          <div className="text-muted-foreground">Bytes lidos</div>
          <div className="font-medium">{preview.bytes_read}</div>
        </div>
        <div className="rounded border p-2">
          <div className="text-muted-foreground">Preview</div>
          <div className="font-medium">{preview.preview_type ?? "-"}</div>
        </div>
      </div>
    );
  }, [preview]);

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h3 className="text-sm font-medium">Teste de ligação</h3>
          <p className="text-xs text-muted-foreground">
            Executa a ligação e mostra uma amostra dos dados.
          </p>
        </div>

        <div className="flex items-end gap-3">
          <div className="grid grid-cols-1 gap-2">
            <div className="space-y-1">
              <Label htmlFor="max_rows" className="text-xs">
                Max rows
              </Label>
              <Input
                id="max_rows"
                type="number"
                min={1}
                max={50}
                value={form.watch("max_rows")}
                onChange={(e) =>
                  form.setValue("max_rows", Number(e.target.value))
                }
              />
            </div>
          </div>

          <Button
            type="button"
            onClick={onTest}
            disabled={testing}
            className="gap-2"
          >
            {testing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {testing ? "A testar…" : "Testar"}
          </Button>
        </div>
      </div>

      {preview && (
        <div className="rounded-lg border overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2">
            <span
              className={[
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs border",
                preview.ok
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-red-50 text-red-700 border-red-200",
              ].join(" ")}
              title={`HTTP ${preview.status_code}`}
            >
              {preview.ok ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <AlertTriangle className="h-3.5 w-3.5" />
              )}
              {preview.ok ? "Ligação ok" : "Falha"} · {preview.status_code}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={onClear}
              className="gap-2"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Limpar
            </Button>
          </div>
          <Separator />

          {preview.ok ? (
            <div className="p-3">
              <Tabs defaultValue="data" className="w-full">
                <TabsList>
                  <TabsTrigger value="data">Dados</TabsTrigger>
                  <TabsTrigger value="meta">Meta</TabsTrigger>
                </TabsList>
                <TabsContent value="data">
                  <div className="rounded-md bg-muted/40 border p-3 text-xs overflow-auto">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(
                        (preview.rows_preview || []).slice(0, 10),
                        null,
                        2
                      )}
                    </pre>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Mostrando até 10 linhas.
                  </p>
                </TabsContent>
                <TabsContent value="meta">{previewMeta}</TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="p-3 text-sm text-red-700 bg-red-50">
              {preview.error || "Erro desconhecido."}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
