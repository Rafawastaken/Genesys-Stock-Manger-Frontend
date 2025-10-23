import { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ProfileFormRHF } from "../mapping-types";
import MappingFieldAdvanced from "./mapping-field-advanced";

export default function MappingFieldTable() {
  const form = useFormContext<ProfileFormRHF>();
  const { fields, append, remove } = useFieldArray<
    ProfileFormRHF,
    "fields",
    "rhfId"
  >({
    control: form.control,
    name: "fields",
    keyName: "rhfId",
  });

  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="rounded-lg border">
      <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs text-muted-foreground bg-muted/30 border-b">
        <div className="col-span-6">Campo interno</div>
        <div className="col-span-5">Fonte (coluna / chave)</div>
        <div className="col-span-1 text-right"></div>
      </div>

      <div className="divide-y">
        {fields.map((row, idx) => (
          <div key={row.rhfId}>
            <div className="grid grid-cols-12 gap-2 px-3 py-2 items-center">
              <div className="col-span-6">
                <Input
                  list="internal-fields-list"
                  placeholder="ex.: partnumber"
                  {...form.register(`fields.${idx}.target` as const)}
                />
              </div>
              <div className="col-span-5">
                <Input
                  placeholder="ex.: CODIGO (csv) ou data[*].sku (json)"
                  {...form.register(`fields.${idx}.source` as const)}
                />
              </div>
              <div className="col-span-1 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                >
                  {openIdx === idx ? "Esconder" : "Opções"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => remove(idx)}
                >
                  Remover
                </Button>
              </div>
            </div>

            {openIdx === idx && (
              <div className="px-3 pb-3">
                <MappingFieldAdvanced index={idx} />
              </div>
            )}
          </div>
        ))}

        <div className="px-3 py-2">
          <Button
            type="button"
            onClick={() => append({ target: "", source: "" })}
            variant="secondary"
            size="sm"
          >
            Adicionar mapeamento
          </Button>
        </div>
      </div>
    </div>
  );
}
