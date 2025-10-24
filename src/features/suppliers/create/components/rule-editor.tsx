import { Button } from "@/components/ui/button";
import KeyValueEditor from "./kv-editor";
import type { Row as KV } from "./kv-editor";
import ConditionRow from "./condition-row";

type MapperOp = {
  op: string;
  label: string; // obrigatório para alinhar com ConditionRow
  arity: number;
  input: "any" | "number" | "regex" | "text";
};

const FALLBACK_OPS: ReadonlyArray<MapperOp> = [
  { op: "eq", label: "=", arity: 2, input: "any" },
  { op: "neq", label: "≠", arity: 2, input: "any" },
  { op: "gt", label: ">", arity: 2, input: "number" },
  { op: "lt", label: "<", arity: 2, input: "number" },
  { op: "regex", label: "regex", arity: 2, input: "regex" },
  { op: "in", label: "in", arity: 2, input: "text" },
];

type Rule = {
  when: Array<{ op: string; left: string; right: string | string[] }>;
  set: KV[];
};

function normalizeOps(
  arr?: Array<{ op: string; label?: string; arity?: number; input?: string }>
): MapperOp[] {
  if (!arr || arr.length === 0) return [...FALLBACK_OPS];
  return arr.map((o) => {
    const allowed: Array<MapperOp["input"]> = [
      "any",
      "number",
      "regex",
      "text",
    ];
    const asInput: MapperOp["input"] = allowed.includes(o.input as any)
      ? (o.input as MapperOp["input"])
      : "any";
    return {
      op: o.op,
      label: o.label ?? o.op,
      arity: o.arity ?? 2,
      input: asInput,
    };
  });
}

export default function RuleEditor({
  value = [],
  onChange,
  ops = [],
}: {
  value?: Rule[];
  onChange: (v: Rule[]) => void;
  ops?: Array<{ op: string; label?: string; arity?: number; input?: string }>;
}) {
  const _ops: MapperOp[] = normalizeOps(ops);
  const safeOp = _ops[0]?.op ?? "eq";
  const list = value ?? [];

  const addRule = () =>
    onChange([
      ...list,
      { when: [{ op: safeOp, left: "$field", right: "" }], set: [] },
    ]);

  const updateRule = (i: number, patch: Partial<Rule>) => {
    const cur = [...list];
    cur[i] = { ...cur[i], ...patch };
    onChange(cur);
  };

  const removeRule = (i: number) => {
    const cur = [...list];
    cur.splice(i, 1);
    onChange(cur);
  };

  return (
    <div className="space-y-4">
      {list.map((r, i) => (
        <div key={i} className="rounded-md border p-3 space-y-3">
          <div className="space-y-2">
            <div className="text-xs font-medium">Condições</div>
            <div className="space-y-2">
              {(r.when ?? []).map((c, j) => (
                <ConditionRow
                  key={j}
                  value={c}
                  ops={_ops}
                  onChange={(v) => {
                    const when = [...(r.when ?? [])];
                    when[j] = v;
                    updateRule(i, { when });
                  }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  updateRule(i, {
                    when: [
                      ...(r.when ?? []),
                      { op: safeOp, left: "$field", right: "" },
                    ],
                  })
                }
              >
                + condição
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium">Set</div>
            <KeyValueEditor
              value={r.set ?? []}
              onChange={(set) => updateRule(i, { set })}
              keyPlaceholder="campo"
              valPlaceholder="valor"
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeRule(i)}
            >
              Remover regra
            </Button>
          </div>
        </div>
      ))}

      <Button type="button" variant="secondary" size="sm" onClick={addRule}>
        Adicionar regra
      </Button>
    </div>
  );
}
