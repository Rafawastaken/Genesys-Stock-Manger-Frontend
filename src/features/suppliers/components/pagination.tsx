// src/features/suppliers/components/pagination.tsx
import { Button } from "@/components/ui/button";

type Props = {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
};

export default function PaginationBar({
  page,
  totalPages,
  onPrev,
  onNext,
}: Props) {
  return (
    <div className="flex items-center justify-between border-t bg-gradient-to-b from-transparent to-muted/30 px-4 py-3">
      <span className="text-sm text-muted-foreground">
        Página {page} de {totalPages}
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={onPrev}
        >
          Anterior
        </Button>
        <Button
          variant="default"
          size="sm"
          disabled={page >= totalPages}
          onClick={onNext}
        >
          Seguinte
        </Button>
      </div>
    </div>
  );
}
