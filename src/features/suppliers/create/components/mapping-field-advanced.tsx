import { useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import KeyValueEditor from "./kv-editor";
import type { ProfileFormRHF } from "../mapping-types";

export default function MappingFieldAdvanced({ index }: { index: number }) {
  const form = useFormContext<ProfileFormRHF>();

  return (
    <div className="rounded-md border p-3 space-y-3 bg-muted/20">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-3 flex items-center gap-2">
          <Checkbox
            checked={!!form.watch(`fields.${index}.required`)}
            onCheckedChange={(v) =>
              form.setValue(`fields.${index}.required`, !!v, {
                shouldDirty: true,
              })
            }
            id={`req-${index}`}
          />
          <Label htmlFor={`req-${index}`}>Obrigatório</Label>
        </div>

        <div className="md:col-span-3 flex items-center gap-2">
          <Checkbox
            checked={!!form.watch(`fields.${index}.opts.trim`)}
            onCheckedChange={(v) =>
              form.setValue(`fields.${index}.opts.trim`, !!v, {
                shouldDirty: true,
              })
            }
            id={`trim-${index}`}
          />
          <Label htmlFor={`trim-${index}`}>Trim</Label>
        </div>

        <div className="md:col-span-3 flex items-center gap-2">
          <Checkbox
            checked={!!form.watch(`fields.${index}.opts.lowercase`)}
            onCheckedChange={(v) =>
              form.setValue(`fields.${index}.opts.lowercase`, !!v, {
                shouldDirty: true,
              })
            }
            id={`lower-${index}`}
          />
          <Label htmlFor={`lower-${index}`}>lowercase</Label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-3">
          <Label>Decimal</Label>
          <Input
            placeholder="."
            value={form.watch(`fields.${index}.opts.to_number.decimal`) || ""}
            onChange={(e) =>
              form.setValue(
                `fields.${index}.opts.to_number.decimal`,
                e.target.value,
                { shouldDirty: true }
              )
            }
          />
        </div>
        <div className="md:col-span-3">
          <Label>Milhar</Label>
          <Input
            placeholder=","
            value={form.watch(`fields.${index}.opts.to_number.thousands`) || ""}
            onChange={(e) =>
              form.setValue(
                `fields.${index}.opts.to_number.thousands`,
                e.target.value,
                { shouldDirty: true }
              )
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Value map</Label>
        <KeyValueEditor
          value={form.watch(`fields.${index}.opts.value_map_kv`) || []}
          onChange={(v) =>
            form.setValue(`fields.${index}.opts.value_map_kv`, v, {
              shouldDirty: true,
            })
          }
          keyPlaceholder="de"
          valPlaceholder="para"
        />
      </div>
    </div>
  );
}
