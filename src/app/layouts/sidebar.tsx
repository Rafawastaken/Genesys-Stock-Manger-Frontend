// Sidebar.tsx
import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Store,
  ChevronDown,
  ToolCase,
  Truck,
  ChartSpline,
  MonitorCog,
  LayoutDashboard,
  Package2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import SidebarFooter from "./sidebar-footer";

type Props = {
  mini: boolean; // controla largura/visual (md:w-16 vs md:w-64)
  mobileOpen: boolean; // gaveta em < md
  onCloseMobile: () => void;
};

type NavItem = { to: string; label: string };
type NavGroup = {
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  items: NavItem[];
};

const NAV_ITEMS: NavGroup[] = [
  {
    name: "Fornecedores",
    icon: Store,
    items: [{ to: "/suppliers", label: "Lista de Fornecedores" }],
  },
  {
    name: "Produtos",
    icon: ToolCase,
    items: [
      { to: "/products", label: "Produtos" },
      { to: "/brands", label: "Marcas" },
      { to: "/categorias", label: "Categorias" },
    ],
  },
  {
    name: "Encomendas",
    icon: Package2,
    items: [{ to: "/orders", label: "Encomendas" }],
  },
  {
    name: "Transportadoras",
    icon: Truck,
    items: [
      { to: "/carriers", label: "Transportadoras" },
      { to: "/carriers/rules", label: "Regras de Envio" },
    ],
  },
  {
    name: "Preços",
    icon: ChartSpline,
    items: [
      { to: "/prices/price-history", label: "Histórico de Preços" },
      { to: "/prices/price-drops", label: "Quedas de Preços" },
      { to: "/prices/price-increase", label: "Subida de Preços" },
    ],
  },
  {
    name: "Sistema",
    icon: MonitorCog,
    items: [
      { to: "/system/runs", label: "Logs de Análises" },
      { to: "/system/dlq", label: "Erros de sincro" },
    ],
  },
];

const GROUPS_KEY = "sidebar_groups_v1";

export default function Sidebar({ mini, mobileOpen, onCloseMobile }: Props) {
  const location = useLocation();

  // default: todos fechados na primeira vez
  const allFalse = useMemo(
    () =>
      Object.fromEntries(NAV_ITEMS.map((g) => [g.name, false])) as Record<
        string,
        boolean
      >,
    []
  );

  const readSaved = () => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(GROUPS_KEY) || "{}"
      ) as Record<string, boolean>;
      const base: Record<string, boolean> = { ...allFalse };
      for (const g of NAV_ITEMS) base[g.name] = saved[g.name] ?? false;
      return base;
    } catch {
      return { ...allFalse };
    }
  };

  // estado de grupos abertos (independente do 'mini')
  const [open, setOpen] = useState<Record<string, boolean>>(() => readSaved());

  // persistência
  useEffect(() => {
    localStorage.setItem(GROUPS_KEY, JSON.stringify(open));
  }, [open]);

  // ao mudar de rota, abre o grupo correspondente (sem fechar os outros)
  useEffect(() => {
    setOpen((m) => {
      const next = { ...m };
      for (const g of NAV_ITEMS) {
        const active = g.items.some((i) => location.pathname.startsWith(i.to));
        if (active) next[g.name] = true;
      }
      return next;
    });
  }, [location.pathname]);

  const toggleGroup = (name: string) =>
    setOpen((m) => ({ ...m, [name]: !m[name] }));

  const groupIsActive = (g: NavGroup) =>
    g.items.some((i) => location.pathname.startsWith(i.to));

  return (
    <aside
      role="navigation"
      aria-label="Navegação principal"
      className={cn(
        "fixed md:static inset-y-0 left-0 z-40 h-full md:h-screen border-r",
        "bg-background/70 supports-[backdrop-filter]:bg-background/30 backdrop-blur-xl",
        "transition-[width,transform] duration-200 ease-in-out",
        "flex flex-col",
        mini ? "w-16" : "w-72 md:w-64",
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      {/* Cabeçalho */}
      <div className="h-14 px-3 flex items-center gap-3 border-b">
        <img
          src="/logo.png"
          alt="Genesys"
          className={cn("h-10 w-10 rounded-full", mini && "h-8 w-8 mx-auto")}
        />
        {!mini && (
          <span className="font-semibold tracking-wider truncate text-lg">
            Genesys
          </span>
        )}
      </div>

      {/* Navegação */}
      <nav className="p-2 space-y-1 overflow-auto flex-1 sidebar-scroll">
        {/* Dashboard */}
        <NavLink
          to="/"
          end
          onClick={onCloseMobile}
          title={mini ? "Dashboard" : undefined}
          className={({ isActive }) =>
            cn(
              "group relative flex items-center rounded-md transition-colors outline-none",
              mini ? "justify-center " : "px-3 py-2 text-sm font-medium mb-2",
              "hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring",
              isActive &&
                (mini
                  ? "bg-accent/80 py-3 text-accent-foreground ring-1 ring-border"
                  : "bg-accent text-accent-foreground")
            )
          }
        >
          {({ isActive }) => (
            <>
              {!mini && (
                <span
                  className={cn(
                    "absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-primary opacity-0 transition-opacity",
                    isActive && "opacity-100"
                  )}
                />
              )}
              <LayoutDashboard
                className={cn(
                  "h-5 w-5 transition-colors",
                  mini ? "text-foreground/80 group-hover:text-foreground" : "",
                  isActive && "text-primary"
                )}
              />
              {!mini && <span className="ml-2">Dashboard</span>}
            </>
          )}
        </NavLink>

        {/* Grupos */}
        {NAV_ITEMS.map((group) => {
          const { name, icon: Icon, items } = group;
          const isOpen = open[name];
          const isGrpActive = groupIsActive(group);
          const contentId = `group-${name.replace(/\s+/g, "-").toLowerCase()}`;

          return (
            <div key={name} className="mb-1">
              <div
                className={cn(
                  "group flex items-center rounded-md px-3 py-2 transition-colors",
                  mini ? "justify-center" : "justify-between",
                  isGrpActive && !mini && "bg-accent/50 text-accent-foreground"
                )}
                aria-label={name}
                title={mini ? name : undefined}
              >
                <div className="flex items-center gap-2">
                  <Icon
                    className={cn("h-5 w-5", isGrpActive && "text-primary")}
                  />
                  {!mini && (
                    <h2
                      className={cn(
                        "text-sm font-medium",
                        isGrpActive && "text-foreground"
                      )}
                    >
                      {name}
                    </h2>
                  )}
                </div>

                {/* Botão abrir/fechar grupo só quando NÃO mini */}
                {!mini && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleGroup(name)}
                    aria-expanded={isOpen}
                    aria-controls={contentId}
                    aria-label={
                      isOpen ? `Recolher ${name}` : `Expandir ${name}`
                    }
                    className="h-8 w-8"
                  >
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        isOpen ? "rotate-0" : "-rotate-90"
                      )}
                    />
                  </Button>
                )}
              </div>

              {/* Conteúdo do grupo */}
              <div
                id={contentId}
                className={cn(
                  "grid transition-[grid-template-rows,opacity] duration-300 ease-in-out",
                  mini
                    ? "grid-rows-[0fr] opacity-0 pointer-events-none"
                    : isOpen
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                )}
                aria-hidden={mini || !isOpen}
              >
                <div className="overflow-hidden">
                  {items.map(({ to, label }) => (
                    <NavLink
                      to={to}
                      key={to}
                      onClick={onCloseMobile}
                      title={mini ? label : undefined}
                      className={({ isActive }) =>
                        cn(
                          "relative ml-3 flex items-center rounded-md px-3 py-2 text-sm font-medium mb-1 transition-colors outline-none",
                          "hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring",
                          isActive && "bg-accent text-accent-foreground"
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {!mini && (
                            <span
                              className={cn(
                                "absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-primary opacity-0 transition-opacity",
                                isActive && "opacity-100"
                              )}
                            />
                          )}
                          <span>{label}</span>
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer: merchant + user + logout */}
      <SidebarFooter mini={mini} />
    </aside>
  );
}
