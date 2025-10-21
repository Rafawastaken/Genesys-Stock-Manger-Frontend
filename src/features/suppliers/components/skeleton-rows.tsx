// src/features/suppliers/components/skeleton-rows.tsx

import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export default function SkeletonRows({
  rows = 8,
  cols = 6,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <TableRow key={`sk-${r}`} className="hover:bg-transparent">
          {Array.from({ length: cols }).map((__, c) => (
            <TableCell key={`sk-${r}-${c}`} className="py-4">
              <div className="flex items-center gap-2">
                {/* Primary shimmer block */}
                <Skeleton className="h-4 w-full max-w-[220px]" />
                {/* Optional shimmer circle for first col (e.g., logo/avatar) */}
                {c === 0 && <Skeleton className="h-6 w-6 rounded-full" />}
              </div>
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
