import { Check } from "lucide-react";

function cx(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}

export default function Stepper({
  step,
  done,
}: {
  step: 1 | 2 | 3;
  done: { supplier: boolean; feed: boolean; mapper: boolean };
}) {
  const items = [
    { id: 1 as const, label: "Fornecedor", complete: done.supplier },
    { id: 2 as const, label: "Feed", complete: done.feed },
    { id: 3 as const, label: "Mapper", complete: done.mapper },
  ];
  return (
    <ol className="flex items-center gap-6 bg-background">
      {items.map((it) => {
        const isActive = step === it.id;
        const isDone = it.complete || it.id < step;
        return (
          <li key={it.id} className="flex items-center gap-2">
            <span
              className={cx(
                "grid h-6 w-6 place-items-center rounded-full border text-xs",
                isDone
                  ? "border-primary bg-primary text-primary-foreground"
                  : isActive
                  ? "border-foreground"
                  : "border-muted-foreground/40 text-muted-foreground"
              )}
            >
              {isDone ? <Check className="h-3.5 w-3.5" /> : it.id}
            </span>
            <span
              className={cx(
                "text-sm",
                isDone
                  ? "text-foreground"
                  : isActive
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {it.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
