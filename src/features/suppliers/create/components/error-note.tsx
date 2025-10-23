import { HttpError } from "@/lib/http-client";

export default function ErrorNote({ error }: { error?: unknown }) {
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
