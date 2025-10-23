import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function MappingJsonEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-3">
      <Label className="text-sm">Profile (JSON)</Label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="font-mono text-xs min-h-[320px]"
        spellCheck={false}
      />
      <p className="text-xs text-muted-foreground">
        Esta é a representação exata enviada/guardada no servidor.
      </p>
    </div>
  );
}
