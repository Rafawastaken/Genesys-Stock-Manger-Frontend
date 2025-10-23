// src/features/suppliers/components/suppliers-table.tsx
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Highlight from "@/components/genesys-ui/hightlight";
import { fmtDate } from "@/lib/formatters";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

type Supplier = {
  id: number;
  name: string;
  active: boolean;
  logo_image?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  margin: number;
  country: string;
  created_at: string;
};

type Props = {
  items: Supplier[];
  isLoading?: boolean;
  emptyHref: string;
  searchQuery: string | null;
  SkeletonRows: React.ComponentType<{ rows?: number; cols?: number }>;
};

export default function SuppliersTable({
  items,
  isLoading,
  emptyHref,
  searchQuery,
  SkeletonRows,
}: Props) {
  return (
    <Table>
      <TableHeader className="sticky top-0 z-10 bg-muted/40 backdrop-blur supports-[backdrop-filter]:bg-muted/60">
        <TableRow>
          <TableHead className="w-[34%]">Fornecedor</TableHead>
          <TableHead className="w-[10%]">Estado</TableHead>
          <TableHead className="w-[14%]">País</TableHead>
          <TableHead className="w-[12%] text-right">Margem</TableHead>
          <TableHead className="w-[20%]">Email</TableHead>
          <TableHead className="w-[10%]">Criado em</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {isLoading && (
          <TableRow>
            <TableCell colSpan={6} className="p-0">
              <SkeletonRows rows={8} cols={6} />
            </TableCell>
          </TableRow>
        )}

        {!isLoading && items.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="py-16">
              <div className="flex flex-col items-center justify-center gap-2 text-center">
                <Skeleton className="h-12 w-12 rounded-full" />
                <p className="text-sm text-muted-foreground">
                  Sem resultados. Ajuste os filtros ou crie um novo fornecedor.
                </p>
                <Button asChild size="sm" className="mt-2">
                  <Link to={emptyHref}>Criar fornecedor</Link>
                </Button>
              </div>
            </TableCell>
          </TableRow>
        )}

        {!isLoading &&
          items.map((s) => (
            <TableRow
              key={s.id}
              className="group cursor-default transition-colors hover:bg-muted/30"
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 border">
                    {s.logo_image ? (
                      <AvatarImage src={s.logo_image} alt={s.name} />
                    ) : (
                      <AvatarFallback className="text-[10px]">
                        {(s.name || "?").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>

                  <div className="min-w-0">
                    <div className="truncate font-medium leading-tight">
                      <Highlight text={s.name} query={searchQuery} />
                    </div>
                    {(s.contact_name || s.contact_phone) && (
                      <div className="truncate text-xs text-muted-foreground">
                        {s.contact_name ?? "—"}
                        {s.contact_phone ? ` • ${s.contact_phone}` : ""}
                      </div>
                    )}
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <Badge
                  variant={s.active ? "secondary" : "outline"}
                  className="capitalize"
                >
                  {s.active ? "Ativo" : "Inativo"}
                </Badge>
              </TableCell>

              <TableCell>{s.country || "—"}</TableCell>

              <TableCell className="text-right tabular-nums">
                {typeof s.margin === "number" ? `${s.margin}%` : "—"}
              </TableCell>

              <TableCell>
                {s.contact_email ? (
                  <a
                    className="hover:underline"
                    href={`mailto:${s.contact_email}`}
                  >
                    <span className="block max-w-[240px] truncate md:max-w-[320px]">
                      <Highlight text={s.contact_email} query={searchQuery} />
                    </span>
                  </a>
                ) : (
                  "—"
                )}
              </TableCell>

              <TableCell>{fmtDate(s.created_at)}</TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}
