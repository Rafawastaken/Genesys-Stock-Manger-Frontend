// src/api/auth/types.ts
// Types para autenticação

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
  token_type?: string; // "bearer"
  expires_in: number;
  user: Record<string, unknown>;
};
