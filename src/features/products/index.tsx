import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import Highlight from "@/components/genesys-ui/hightlight";
import { cn } from "@/lib/utils";
import { Loader2, Search, ExternalLink } from "lucide-react";
import { useProductsList } from "./queries";
import type { ProductOut } from "@/api/products";

/* ---------------- helpers ---------------- */
function useDebounced<T>(value: T, delay = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}
function fmtPrice(n?: number | null) {
  if (typeof n !== "number" || !Number.isFinite(n)) return "—";
  try {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
    }).format(n);
  } catch {
    return n.toFixed(2);
  }
}

/* ------- backend extended types we use in UI ------- */
type OfferOut = {
  id_supplier: number;
  supplier_name?: string | null;
  supplier_image?: string | null;
  price?: string | null;
  stock?: number | null;
  updated_at?: string | null;
};
type ProductExt = ProductOut & {
  brand_name?: string | null;
  category_name?: string | null;
  offers?: OfferOut[];
  best_offer?: OfferOut | null;
  id_ecommerce?: number | null;
};

/* ---------------- subcomponents ---------------- */
function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span
      className={cn(
        "inline-block h-2 w-2 rounded-full",
        ok ? "bg-emerald-500" : "bg-amber-500"
      )}
    />
  );
}

function OffersInline({
  offers,
  best,
}: {
  offers?: OfferOut[];
  best?: OfferOut | null;
}) {
  if (!offers || offers.length === 0)
    return <span className="text-xs text-muted-foreground">—</span>;
  const bestId = best?.id_supplier ?? null;

  return (
    <div className="inline-flex items-center gap-1.5 rounded-md bg-muted/40 px-1.5 py-1">
      {offers.map((o, i) => {
        const isBest = o.id_supplier === bestId;
        const priceNum = o.price != null ? Number.parseFloat(o.price) : NaN;
        const priceText = Number.isFinite(priceNum)
          ? fmtPrice(priceNum)
          : o.price ?? "—";
        const stockText = typeof o.stock === "number" ? `${o.stock} un.` : "—";

        const inner = o.supplier_image ? (
          <img
            src={o.supplier_image}
            alt={o.supplier_name ?? "fornecedor"}
            className="h-6 w-6 object-cover rounded"
            loading="lazy"
          />
        ) : (
          <div className="h-6 w-6 grid place-items-center rounded text-[9px] bg-muted">
            {(o.supplier_name || "??").slice(0, 2).toUpperCase()}
          </div>
        );

        return (
          <Tooltip key={`${o.id_supplier}-${i}`}>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "rounded overflow-hidden border transition",
                  isBest
                    ? "ring-2 ring-emerald-500 border-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.25)]"
                    : "border-border/40 hover:border-border"
                )}
                role="img"
                aria-label={`${
                  o.supplier_name ?? "Fornecedor"
                } • ${stockText} • ${priceText}`}
                title={`${
                  o.supplier_name ?? "Fornecedor"
                } • ${stockText} • ${priceText}`}
              >
                {inner}
              </div>
            </TooltipTrigger>
            <TooltipContent className="text-xs">
              <div className="font-medium">
                {o.supplier_name ?? "Fornecedor"}
              </div>
              <div>Stock: {stockText}</div>
              <div>Preço: {priceText}</div>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}

/* ---------------- page ---------------- */
export default function ProductsPage() {
  const [qInput, setQInput] = useState("");
  const q = useDebounced(qInput.trim(), 350) || null;

  const [hasStock, setHasStock] = useState<"all" | "in" | "out">("all");
  const [sort, setSort] = useState<"recent" | "name">("recent");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { data, isLoading, isFetching } = useProductsList({
    page,
    pageSize,
    q,
    sort,
    has_stock: hasStock === "all" ? null : hasStock === "in",
  });

  const totalPages = useMemo(
    () => (data ? Math.max(1, Math.ceil(data.total / data.page_size)) : 1),
    [data]
  );
  const elapsedMs = (data as any)?.elapsedMs as number | undefined;
  const items = (data?.items as unknown as ProductExt[]) ?? [];

  useEffect(() => {
    setPage(1);
  }, [q, hasStock, sort, pageSize]);

  return (
    <TooltipProvider delayDuration={100}>
      <div className="mx-auto space-y-6">
        {/* Header (desktop-only mindset; sem barra colorida) */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-xl font-semibold tracking-tight">Produtos</h1>
              <p className="text-sm text-muted-foreground">
                Catálogo agregado com ofertas por fornecedor e melhor preço.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative w-[360px]">
                <span className="absolute left-2 top-1/2 -translate-y-1/2">
                  <Search className="h-4 w-4 text-slate-400 pointer-events-none" />
                </span>
                <Input
                  placeholder="Pesquisar por nome, GTIN, MPN…"
                  value={qInput}
                  onChange={(e) => setQInput(e.target.value)}
                  className="pl-8"
                />
              </div>

              {/* Stock */}
              <Select
                value={hasStock}
                onValueChange={(v) => setHasStock(v as any)}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="in">Com stock</SelectItem>
                  <SelectItem value="out">Sem stock</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sort} onValueChange={(v) => setSort(v as any)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recentes</SelectItem>
                  <SelectItem value="name">Nome</SelectItem>
                </SelectContent>
              </Select>

              {/* Page size */}
              <Select
                value={String(pageSize)}
                onValueChange={(v) => setPageSize(Number(v))}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Tamanho" />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 50, 100].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}/página
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-3 text-xs text-muted-foreground">
            {data
              ? `${data.total} resultados` +
                (typeof elapsedMs === "number"
                  ? ` • ${Math.round(elapsedMs)} ms`
                  : "") +
                (isFetching ? " • a atualizar…" : "")
              : "—"}
          </div>
        </Card>

        {/* Tabela (desktop) */}
        <Card className="overflow-hidden p-0">
          <div className="min-w-full overflow-x-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <TableRow className="[&_th]:text-muted-foreground">
                  <TableHead className="w-[36%]">Produto</TableHead>
                  <TableHead className="w-[12%]">Marca</TableHead>
                  <TableHead className="w-[16%]">GTIN/MPN</TableHead>
                  <TableHead className="w-[16%]">Ofertas</TableHead>
                  <TableHead className="w-[10%] text-right">Preço</TableHead>
                  <TableHead className="w-[8%] text-right">Stock</TableHead>
                  <TableHead className="w-[2%]"> </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {/* Skeleton */}
                {isLoading &&
                  Array.from({ length: 10 }).map((_, r) => (
                    <TableRow key={`sk-${r}`} className="hover:bg-transparent">
                      {Array.from({ length: 7 }).map((__, c) => (
                        <TableCell key={`skc-${r}-${c}`} className="py-4">
                          <div
                            className={cn(
                              "flex items-center gap-2",
                              c === 4 || c === 5 ? "justify-end" : ""
                            )}
                          >
                            <div className="h-4 w-full max-w-[220px] animate-pulse rounded bg-muted" />
                            {c === 0 && (
                              <div className="h-6 w-6 rounded-full bg-muted animate-pulse" />
                            )}
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}

                {/* Empty */}
                {!isLoading && items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-16">
                      <div className="flex flex-col items-center justify-center gap-2 text-center">
                        <div className="h-12 w-12 rounded-full bg-muted" />
                        <p className="text-sm text-muted-foreground">
                          Sem resultados. Ajuste os filtros ou{" "}
                          <Link className="underline" to="/suppliers/create">
                            crie um fornecedor
                          </Link>{" "}
                          para começar a importar.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {/* Rows */}
                {!isLoading &&
                  items.map((p) => {
                    const initials = (p.brand_name || p.name || "?")
                      .slice(0, 2)
                      .toUpperCase();
                    const bestPrice =
                      p.best_offer?.price != null
                        ? Number.parseFloat(p.best_offer.price)
                        : NaN;

                    return (
                      <TableRow key={p.id} className="group hover:bg-muted/30">
                        {/* Produto */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border">
                              {p.image_url ? (
                                <AvatarImage
                                  src={p.image_url}
                                  alt={p.name || ""}
                                />
                              ) : (
                                <AvatarFallback className="text-[10px]">
                                  {initials}
                                </AvatarFallback>
                              )}
                            </Avatar>

                            <div className="min-w-0">
                              {/* Nome + badge importação alinhados */}
                              <div className="flex items-center gap-2">
                                <div className="truncate font-medium leading-tight max-w-[32ch]">
                                  <Highlight text={p.name || "—"} query={q} />
                                </div>
                                <Badge
                                  variant={
                                    p.id_ecommerce ? "secondary" : "outline"
                                  }
                                  className={cn(
                                    "h-5 px-2 text-[10px] font-medium",
                                    p.id_ecommerce ? "border-emerald-300" : ""
                                  )}
                                  title={
                                    p.id_ecommerce
                                      ? `Importado (ID: ${p.id_ecommerce})`
                                      : "Por importar"
                                  }
                                >
                                  {p.id_ecommerce
                                    ? "importado"
                                    : "por importar"}
                                </Badge>
                              </div>

                              <div className="truncate text-xs text-muted-foreground">
                                {p.category_name || "—"}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        {/* Marca */}
                        <TableCell className="truncate">
                          {p.brand_name ? (
                            <Highlight text={p.brand_name} query={q} />
                          ) : (
                            "—"
                          )}
                        </TableCell>

                        {/* GTIN/MPN */}
                        <TableCell className="truncate">
                          <div className="text-xs">
                            <span className="text-muted-foreground">GTIN:</span>{" "}
                            {p.gtin ? (
                              <Highlight text={p.gtin} query={q} />
                            ) : (
                              "—"
                            )}
                          </div>
                          <div className="text-xs">
                            <span className="text-muted-foreground">MPN:</span>{" "}
                            {p.partnumber ? (
                              <Highlight
                                text={String(p.partnumber)}
                                query={q}
                              />
                            ) : (
                              "—"
                            )}
                          </div>
                        </TableCell>

                        {/* Ofertas */}
                        <TableCell>
                          <OffersInline offers={p.offers} best={p.best_offer} />
                        </TableCell>

                        {/* Preço (melhor oferta) */}
                        <TableCell className="text-right">
                          <div className="leading-tight">
                            <div className="text-[11px] text-muted-foreground">
                              desde
                            </div>
                            <div className="text-base font-semibold tabular-nums">
                              {Number.isFinite(bestPrice)
                                ? fmtPrice(bestPrice)
                                : "—"}
                            </div>
                          </div>
                        </TableCell>

                        {/* Stock (melhor oferta) */}
                        <TableCell className="text-right">
                          {typeof p.best_offer?.stock === "number" ? (
                            <div className="inline-flex items-center justify-end gap-2">
                              <StatusDot ok={(p.best_offer?.stock ?? 0) > 0} />
                              <span className="text-sm tabular-nums">
                                {p.best_offer?.stock}
                              </span>
                            </div>
                          ) : (
                            "—"
                          )}
                        </TableCell>

                        {/* Ações */}
                        <TableCell>
                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="gap-1"
                          >
                            <Link to={`/product/${p.id}`} title="Ver detalhe">
                              <ExternalLink className="h-4 w-4" />
                              Detalhe
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <Separator />
          <div className="flex items-center justify-between px-4 py-3">
            <div className="text-xs text-muted-foreground">
              Página {data?.page ?? page} de {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={(data?.page ?? page) <= 1 || isFetching}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p + 1))}
                disabled={(data?.page ?? page) >= totalPages || isFetching}
              >
                Seguinte
              </Button>
              {isFetching && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            </div>
          </div>
        </Card>
      </div>
    </TooltipProvider>
  );
}
