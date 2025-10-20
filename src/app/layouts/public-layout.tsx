// src/app/layouts/public-layout.tsx
// Layout simples para paginas publicas

import type { PropsWithChildren } from "react";

export function PublicLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen grid place-items-center bg-background">
      <div className="w-full max-w-sm p-6">{children}</div>
    </div>
  );
}
