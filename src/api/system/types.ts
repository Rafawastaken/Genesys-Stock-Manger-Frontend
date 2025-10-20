export type HealthResponse = {
  ok: boolean;
  status: string;
  service?: string; // default "backend"
  env: string;
  now: string;
  uptime_s?: number | null;
  db_ok?: boolean | null;
};
