import { Button } from "@/components/ui/button";
import KeyValueEditor from "./kv-editor";
import type { KV } from "@/components/shared/KeyValueEditor";
import ConditionRow from "./condition-row";

// lista fixa de operadores (não há endpoint de ops)
const DEFAULT_OPS = [
  { op: "eq", label: "=", arity: 2, input: "any" },
  { op: "neq", label: "≠", arity: 2, input: "any" },
  { op: "gt", label: ">", arity: 2, input: "number" },
  { op: "lt", label: "<", arity: 2, input: "number" },
  { op: "regex", label: "regex", arity: 2, input: "regex" },
  { op: "in", label: "in", arity: 2, input: "text" },
] as const;

type Rule = {
  when: Array<{ op: string; left: string; right: string | string[] }>;
  set: KV[];
};

export default function RuleEditor({
  value = [],
  onChange,
}: {
  value?: Rule[];
  onChange: (v: Rule[]) => void;
}) {
  const ops = DEFAULT_OPS as any[];
  const safeOp = ops[0]?.op ?? "eq";
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
                  ops={ops}
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
