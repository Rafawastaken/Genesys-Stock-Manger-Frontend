// src/features/suppliers/components/page-header.tsx
import type { PropsWithChildren } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus, Filter } from "lucide-react";
import { Link } from "react-router-dom";

type Props = PropsWithChildren<{
  onReset: () => void;
}>;

export default function PageHeader({ onReset, children }: Props) {
  return (
    <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-b from-background to-muted/40 p-5">
      <div className="absolute inset-x-0 -top-24 -z-10 h-48 bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.06),transparent_60%)]" />
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Fornecedores
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestão centralizada de parceiros e integrações de feed.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" className="gap-2" onClick={onReset}>
                  <Filter className="h-4 w-4" /> Limpar filtros
                </Button>
              </TooltipTrigger>
              <TooltipContent>Limpa pesquisa, estado e página</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button asChild className="gap-2">
            <Link to="/suppliers/create">
              <Plus className="h-3.5 w-4" /> Novo fornecedor
            </Link>
          </Button>
        </div>
      </div>

      <Separator className="my-4" />
      {children}
    </div>
  );
}
