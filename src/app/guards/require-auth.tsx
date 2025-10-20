import { Navigate, useLocation } from "react-router-dom";
import type { PropsWithChildren } from "react";
import { useAuthToken } from "@/lib/auth-hooks";
import { useMeQuery } from "@/features/auth/login/queries";

function FullPageSpinner() {
  return (
    <div className="grid place-items-center min-h-[60vh] text-sm text-muted-foreground">
      A verificar sessão…
    </div>
  );
}

export function RequireAuth({ children }: PropsWithChildren) {
  const token = useAuthToken();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const { isLoading, isError } = useMeQuery(true);
  if (isLoading) return <FullPageSpinner />;
  if (isError)
    return <Navigate to="/login" replace state={{ from: location }} />;

  return <>{children}</>;
}
