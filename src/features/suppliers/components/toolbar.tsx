// src/features/suppliers/components/toolbar.tsx
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

type Props = {
  searchInput: string;
  onSearchChange: (v: string) => void;
  status: "all" | "active" | "inactive";
  onStatusChange: (v: "all" | "active" | "inactive") => void;
  pageSize: number;
  onPageSizeChange: (v: number) => void;
  stats?: string;
};

export default function SuppliersToolbar({
  searchInput,
  onSearchChange,
  status,
  onStatusChange,
  pageSize,
  onPageSizeChange,
  stats,
}: Props) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      <div className="relative md:w-[420px]">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Procurar por nome, email…"
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex items-center gap-2 md:ml-auto">
        <Select value={status} onValueChange={(v) => onStatusChange(v as any)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os estados</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={String(pageSize)}
          onValueChange={(v) => onPageSizeChange(Number(v))}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Itens/página" />
          </SelectTrigger>
          <SelectContent>
            {[10, 20, 50, 100].map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n} / pág.
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {stats && (
          <span className="ml-2 text-sm text-muted-foreground">{stats}</span>
        )}
      </div>
    </div>
  );
}
