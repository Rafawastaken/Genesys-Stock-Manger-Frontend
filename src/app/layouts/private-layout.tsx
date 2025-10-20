import type { PropsWithChildren } from "react";
import { Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/lib/auth-hooks";

export function PrivateLayout(_: PropsWithChildren) {
  const logout = useLogout();
  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container h-14 flex items-center justify-between">
          <div className="font-semibold">Genesys Console</div>
          <Button variant="outline" size="sm" onClick={logout}>
            Sair
          </Button>
        </div>
      </header>
      <main className="container py-6">
        <Outlet />
      </main>
    </div>
  );
}
