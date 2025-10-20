import { useHealthz } from "@/features/system/healthz/queries.ts";
import { StatusDot } from "@/components/feedback/status-dot";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Moon,
  RefreshCcw,
  Sun,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { useTheme } from "@/providers/theme-provider";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

type Props = {
  onToggleMobile: () => void; // abre/fecha gaveta no mobile
  onToggleMini: () => void; // alterna mini/expandida no desktop
  isSidebarOpen: boolean; // estado da gaveta no mobile
  mini: boolean; // estado "mini" (largura) no desktop
};

export default function Topbar({
  onToggleMobile,
  onToggleMini,
  isSidebarOpen,
  mini,
}: Props) {
  const { data, isFetching, refetch, isError } = useHealthz();

  const status = isError
    ? "critical"
    : !data
    ? "warning"
    : data.status?.toLowerCase();

  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const latencyMs = data?.elapsedMs ? Math.round(data.elapsedMs) : null;
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      if ((isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="sticky top-0 z-10 h-14 border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40">
      <div className="flex h-14 items-center justify-between px-4">
        {/* Esquerda: botões + título */}
        <div className="flex items-center gap-2">
          {/* Mobile: abrir/fechar gaveta */}
          <Button
            variant="link"
            size="icon"
            onClick={onToggleMobile}
            aria-label={isSidebarOpen ? "Fechar navegação" : "Abrir navegação"}
            className="md:hidden"
          >
            {isSidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>

          {/* Desktop: mini/expandir sidebar (largura) */}
          <Button
            variant="link"
            size="icon"
            onClick={onToggleMini}
            aria-label={
              mini ? "Expandir barra lateral" : "Colapsar barra lateral"
            }
            className="hidden md:inline-flex"
          >
            {mini ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>

          <div className="flex flex-col text-start justify-start align-center">
            <div className="text-sm font-medium">Genesys</div>
            <span className="text-xs text-muted-foreground">
              Sistema de Tratamento de Fornecedores e Encomendas
            </span>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 flex justify-center px-2"
        >
          <div className="relative w-full max-w-md">
            <span className="absolute left-2 top-1/2 -translate-y-1/2">
              <Search className="h-4 w-4 text-slate-400 pointer-events-none" />
            </span>
            <input
              ref={inputRef}
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Pesquisar… (Ctrl / Cmd + K)"
              className="w-full rounded-md border pl-8 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400"
              aria-label="Pesquisar"
            />
          </div>
        </form>

        {/* Direita: estado + ações */}
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs",
              status === "ok" && "border-emerald-200",
              status !== "ok" && "border-amber-200"
            )}
            title={
              isError
                ? "Erro ao verificar saúde do backend"
                : "Estado do backend"
            }
          >
            <StatusDot status={status || "warning"} />
            <span className="hidden sm:inline">
              {isError ? "Backend: erro" : `Backend: ${data?.status ?? "…"}`}
            </span>
            {data?.env && (
              <span className="text-muted-foreground">· {data.env}</span>
            )}
            {typeof data?.db_ok === "boolean" && (
              <span
                className={cn(
                  "ml-1",
                  data.db_ok ? "text-emerald-600" : "text-red-600"
                )}
              >
                DB {data.db_ok ? "ok" : "down"}
              </span>
            )}
            {latencyMs !== null && (
              <span className="text-muted-foreground">· {latencyMs}ms</span>
            )}
            {isFetching && (
              <Loader2 className="ml-1 h-3.5 w-3.5 animate-spin" />
            )}
          </div>

          {/* Refresh */}
          <Button
            variant="link"
            size="sm"
            onClick={() => refetch()}
            aria-label="Atualizar estado"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>

          {/* Toggle tema */}
          <div
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={`flex items-center cursor-pointer transition-transform duration-500 ${
              isDark ? "rotate-180" : "rotate-0"
            }`}
          >
            {isDark ? (
              <Sun className="h-6 w-6 text-yellow-500 rotate-0 transition-all" />
            ) : (
              <Moon className="h-6 w-6 text-blue-500 rotate-0 transition-all" />
            )}
            <span className="sr-only">Toggle theme</span>
          </div>
        </div>
      </div>
    </div>
  );
}
