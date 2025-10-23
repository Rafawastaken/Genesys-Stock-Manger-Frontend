import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type DropIf = { empty_any_of?: string[] };

export default function DropIfEditor({
  value,
  onChange,
}: {
  value: DropIf | undefined;
  onChange: (v: DropIf | undefined) => void;
}) {
  const list = value?.empty_any_of ?? [];
  const [draft, setDraft] = useState("");

  const add = () => {
    const v = draft.trim();
    if (!v) return;
    const next = Array.from(new Set([...list, v]));
    onChange({ empty_any_of: next });
    setDraft("");
  };

  const remove = (x: string) => {
    const next = list.filter((f) => f !== x);
    onChange(next.length ? { empty_any_of: next } : undefined);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder="campo (ex.: sku)"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <Button type="button" variant="secondary" onClick={add}>
          Adicionar
        </Button>
      </div>

      {list.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {list.map((f) => (
            <span
              key={f}
              className="inline-flex items-center gap-2 rounded border px-2 py-1 text-xs"
            >
              {f}
              <button
                type="button"
                className="rounded px-1 hover:bg-muted/50"
                onClick={() => remove(f)}
                aria-label={`Remover ${f}`}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Remove linhas quando <strong>qualquer</strong> destes campos estiver
        vazio.
      </p>
    </div>
  );
}
