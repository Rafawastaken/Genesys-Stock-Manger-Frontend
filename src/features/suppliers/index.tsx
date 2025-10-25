// src/features/suppliers/index.tsx
import { useEffect, useMemo, useState } from "react";
import { useSuppliersList, supplierKeys } from "./queries";
import { Card } from "@/components/ui/card";
import SuppliersTable from "./components/suppliers-table";
import PageHeader from "./components/page-header";
import SuppliersToolbar from "./components/toolbar";
import PaginationBar from "./components/pagination";
import useDebounced from "./components/use-debounced";
import SkeletonRows from "./components/skeleton-rows";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { suppliersClient } from "@/api/suppliers";
import { useNavigate } from "react-router-dom";

export default function SuppliersPage() {
  const nav = useNavigate();
  const qc = useQueryClient();

  const [searchInput, setSearchInput] = useState<string>("");
  const search = useDebounced(searchInput.trim() || null, 350) as string | null;

  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { data, isLoading, isFetching } = useSuppliersList({
    page,
    pageSize,
    search,
  });

  const totalPages = useMemo(
    () => (data ? Math.max(1, Math.ceil(data.total / data.page_size)) : 1),
    [data]
  );
  const elapsedMs = (data as any)?.elapsedMs as number | undefined;

  useEffect(() => {
    setPage(1);
  }, [search, status, pageSize]);

  const filtered = useMemo(
    () =>
      (data?.items ?? []).filter((s) =>
        status === "all" ? true : status === "active" ? s.active : !s.active
      ),
    [data?.items, status]
  );

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const deleteM = useMutation({
    mutationFn: async (id: number) => {
      setDeletingId(id);
      await suppliersClient.deleteSupplier(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: supplierKeys.root });
    },
    onSettled: () => {
      setDeletingId(null);
    },
  });

  return (
    <div className="mx-auto space-y-6">
      <PageHeader
        onReset={() => {
          setSearchInput("");
          setStatus("all");
          setPageSize(20);
        }}
      >
        <SuppliersToolbar
          searchInput={searchInput}
          onSearchChange={setSearchInput}
          status={status}
          onStatusChange={setStatus}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          stats={
            data
              ? `${data.total} resultados` +
                (typeof elapsedMs === "number"
                  ? ` • ${Math.round(elapsedMs)} ms`
                  : "") +
                (isFetching ? " • a atualizar…" : "")
              : undefined
          }
        />
      </PageHeader>

      <Card className="overflow-hidden p-0">
        <div className="min-w-full overflow-x-auto">
          <SuppliersTable
            items={filtered}
            isLoading={isLoading}
            emptyHref="/suppliers/create"
            searchQuery={search}
            SkeletonRows={SkeletonRows}
            onEdit={(id) => nav(`/suppliers/${id}/edit`)}
            onDelete={(id) => deleteM.mutate(id)}
            deletingId={deletingId}
          />
        </div>

        <PaginationBar
          page={data?.page ?? page}
          totalPages={totalPages}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => p + 1)}
        />
      </Card>
    </div>
  );
}
