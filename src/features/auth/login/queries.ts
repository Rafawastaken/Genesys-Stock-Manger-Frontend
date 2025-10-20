// src/features/auth/login/queries.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/api/auth";
import { authStore } from "@/lib/auth-store";
import type { LoginRequest, LoginResponse } from "@/api/auth";
import { HttpError } from "@/lib/http-client";

export const authKeys = { me: ["auth", "me"] as const };

export function useLoginMutation() {
  const qc = useQueryClient();
  return useMutation<LoginResponse, HttpError, LoginRequest>({
    mutationFn: (payload) => authClient.login(payload),
    onSuccess: (data) => {
      authStore.set(data.access_token);
      qc.invalidateQueries({ queryKey: authKeys.me });
    },
  });
}

export function useMeQuery(enabled = true) {
  // /auth/me devolve um objeto genérico (OpenAPI não define schema) → tipa como Record<string, unknown>
  return useQuery<Record<string, unknown>, HttpError>({
    queryKey: authKeys.me,
    queryFn: () => authClient.me(),
    enabled,
    retry: 0,
  });
}
