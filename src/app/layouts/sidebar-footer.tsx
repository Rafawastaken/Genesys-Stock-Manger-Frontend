// app/layouts/sidebar-footer.tsx
// Componente do rodapé da sidebar com informações do utilizador e logout

import { Button } from "@/components/ui/button";
import { useMeQuery } from "@/features/auth/login/queries";
import { useLogout } from "@/lib/auth-hooks";
import { useAuthToken } from "@/lib/auth-hooks";
import { cn } from "@/lib/utils";
import { LogOut, User } from "lucide-react";
import { useMemo } from "react";

/** Decodifica o payload do JWT (base64url) com fallback seguro */
function decodeJwtPayload(token?: string | null): Record<string, any> | null {
  if (!token) return null;
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const pad = (s: string) => s + "===".slice((s.length + 3) % 4);
    const b64 = pad(payload).replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(b64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export default function SidebarFooter({ mini }: { mini: boolean }) {
  const logout = useLogout();
  const token = useAuthToken();

  // Busca /auth/me se existir token (ou usa cache se já existir pelo RequireAuth)
  const { data } = useMeQuery(!!token);

  // Nome do utilizador: 1) /auth/me -> name | user.name | email
  //                     2) JWT payload (name | email | sub)
  const userName = useMemo(() => {
    const fromMe =
      (data as any)?.name ??
      (data as any)?.user?.name ??
      (data as any)?.email ??
      (data as any)?.user?.email;

    if (fromMe) return String(fromMe);

    const payload = decodeJwtPayload(token);
    const fromJwt =
      payload?.name ?? payload?.user?.name ?? payload?.email ?? payload?.sub;

    return fromJwt ? String(fromJwt) : "Utilizador";
  }, [data, token]);

  const merchantName =
    (import.meta.env as any).VITE_MERCHANT_NAME?.toString() || "Genesys";

  return (
    <div className="border-t p-3">
      <div
        className={cn(
          "flex items-center gap-3",
          mini ? "justify-center" : "justify-between"
        )}
      >
        {/* Avatar/User icon */}
        <div
          className="h-10 w-10 rounded-xl bg-muted grid place-items-center shrink-0"
          title={mini ? `${merchantName} — ${userName}` : undefined}
          aria-label="Perfil"
        >
          <User className="h-5 w-5" />
        </div>

        {/* Texto (esconde em mini) */}
        {!mini && (
          <div className="min-w-0 flex-1" aria-live="polite">
            <div className="text-sm font-medium leading-tight truncate">
              {merchantName}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {userName}
            </div>
          </div>
        )}

        {/* Logout */}
        <Button
          variant="ghost"
          size="icon"
          onClick={logout}
          title="Terminar sessão"
          aria-label="Terminar sessão"
          className="shrink-0"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
