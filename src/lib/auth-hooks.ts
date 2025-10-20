import { useSyncExternalStore, useCallback } from "react";
import { authStore } from "./auth-store";
import { useNavigate, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

export function useAuthToken() {
  return useSyncExternalStore(
    authStore.subscribe,
    authStore.get,
    authStore.get
  );
}

export function useLogout() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const loc = useLocation();
  return useCallback(() => {
    authStore.set(null);
    qc.clear();
    nav("/login", { replace: true, state: { from: loc } });
  }, [nav, qc, loc]);
}
