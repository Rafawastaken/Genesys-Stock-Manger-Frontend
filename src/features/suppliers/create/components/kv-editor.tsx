import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export type Row = { key: string; value: string };

export default function KVEditor({
  value,
  onChange,
  keyPlaceholder = "chave",
  valPlaceholder = "valor",
  addLabel = "Adicionar",
}: {
  value: Row[];
  onChange: (next: Row[]) => void;
  keyPlaceholder?: string;
  valPlaceholder?: string;
  addLabel?: string;
}) {
  return (
    <div className="space-y-2">
      {value.map((row, idx) => (
        <div key={idx} className="grid grid-cols-12 gap-2">
          <Input
            placeholder={keyPlaceholder}
            value={row.key}
            onChange={(e) => {
              const next = [...value];
              next[idx] = { ...row, key: e.target.value };
              onChange(next);
            }}
            className="col-span-5"
          />
          <Input
            placeholder={valPlaceholder}
            value={row.value}
            onChange={(e) => {
              const next = [...value];
              next[idx] = { ...row, value: e.target.value };
              onChange(next);
            }}
            className="col-span-6"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => onChange(value.filter((_, i) => i !== idx))}
            className="col-span-1"
          >
            ×
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => onChange([...value, { key: "", value: "" }])}
      >
        {addLabel}
      </Button>
    </div>
  );
}
