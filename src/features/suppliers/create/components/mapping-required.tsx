import { useFormContext } from "react-hook-form";
import { INTERNAL_FIELDS, type ProfileFormRHF } from "../mapping-types";

export default function MappingRequired() {
  const form = useFormContext<ProfileFormRHF>();
  const required = form.watch("required") || [];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {INTERNAL_FIELDS.map((f) => {
        const checked = required.includes(f);
        return (
          <label
            key={f}
            className={[
              "flex items-center gap-2 rounded border px-3 py-2 text-sm cursor-pointer select-none",
              checked
                ? "bg-muted/30 border-muted-foreground/30"
                : "border-muted",
            ].join(" ")}
          >
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={checked}
              onChange={(e) => {
                const cur = new Set(form.getValues("required") || []);
                if (e.target.checked) cur.add(f);
                else cur.delete(f);
                form.setValue("required", Array.from(cur), {
                  shouldDirty: true,
                });
              }}
            />
            {f}
          </label>
        );
      })}
    </div>
  );
}
