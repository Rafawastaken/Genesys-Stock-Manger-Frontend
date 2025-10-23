import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ConditionUI = { op: string; left: string; right: string | string[] };
type MapperOp = {
  op: string;
  label: string;
  arity: number;
  input: "any" | "number" | "regex" | "text";
};

export default function ConditionRow({
  value,
  ops,
  onChange,
}: {
  value: ConditionUI;
  ops: MapperOp[];
  onChange: (v: ConditionUI) => void;
}) {
  const op = value.op || ops[0]?.op || "eq";
  const isIn = op === "in";

  return (
    <div className="grid grid-cols-12 gap-2 items-end">
      <div className="col-span-4">
        <Label>Campo</Label>
        <Input
          placeholder="$status"
          value={value.left}
          onChange={(e) => onChange({ ...value, left: e.target.value })}
        />
      </div>
      <div className="col-span-2">
        <Label>Op</Label>
        <Select value={op} onValueChange={(v) => onChange({ ...value, op: v })}>
          <SelectTrigger>
            <SelectValue placeholder="op" />
          </SelectTrigger>
          <SelectContent>
            {(ops.length
              ? ops
              : [{ op: "eq", label: "=", arity: 2, input: "any" }]
            ).map((o) => (
              <SelectItem key={o.op} value={o.op}>
                {o.label || o.op}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="col-span-6">
        <Label>Valor</Label>
        <Input
          placeholder={isIn ? "a,b,c" : "valor"}
          value={
            Array.isArray(value.right)
              ? value.right.join(",")
              : String(value.right ?? "")
          }
          onChange={(e) => {
            const raw = e.target.value;
            onChange({
              ...value,
              right: isIn
                ? raw
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                : raw,
            });
          }}
        />
      </div>
    </div>
  );
}
