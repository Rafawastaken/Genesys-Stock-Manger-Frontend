// src/lib/auth-store.ts
type Listener = (token: string | null) => void;

const KEY = "auth_token";

// rehidratar de forma síncrona ao carregar o módulo
let _token: string | null = (() => {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
})();

const listeners = new Set<Listener>();

// manter várias tabs sincronizadas
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) {
      _token = e.newValue;
      listeners.forEach((fn) => fn(_token));
    }
  });
}

export const authStore = {
  get: () => _token,
  set: (t: string | null) => {
    _token = t;
    try {
      if (t) localStorage.setItem(KEY, t);
      else localStorage.removeItem(KEY);
    } catch {}
    listeners.forEach((fn) => fn(_token));
  },
  subscribe: (fn: Listener) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
