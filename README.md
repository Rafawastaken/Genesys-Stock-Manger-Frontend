
```
Frontend
├─ .env
├─ .env.example
├─ components.json
├─ eslint.config.js
├─ index.html
├─ package-lock.json
├─ package.json
├─ public
│  └─ logo.png
├─ README.md
├─ src
│  ├─ api
│  │  ├─ auth
│  │  │  ├─ index.ts
│  │  │  ├─ service.ts
│  │  │  └─ types.ts
│  │  ├─ suppliers
│  │  │  ├─ index.ts
│  │  │  ├─ service.ts
│  │  │  └─ types.ts
│  │  └─ system
│  │     ├─ index.ts
│  │     ├─ service.ts
│  │     └─ types.ts
│  ├─ app
│  │  ├─ app-router.tsx
│  │  ├─ guards
│  │  │  └─ require-auth.tsx
│  │  └─ layouts
│  │     ├─ private-layout.tsx
│  │     ├─ public-layout.tsx
│  │     ├─ sidebar-footer.tsx
│  │     ├─ sidebar.tsx
│  │     └─ topbar.tsx
│  ├─ App.tsx
│  ├─ assets
│  ├─ components
│  │  ├─ feedback
│  │  │  └─ status-dot.tsx
│  │  ├─ genesys-ui
│  │  │  └─ Hightlight.tsx
│  │  └─ ui
│  │     ├─ avatar.tsx
│  │     ├─ badge.tsx
│  │     ├─ button.tsx
│  │     ├─ card.tsx
│  │     ├─ input.tsx
│  │     ├─ label.tsx
│  │     ├─ mode-toggle.tsx
│  │     ├─ select.tsx
│  │     ├─ separator.tsx
│  │     ├─ skeleton.tsx
│  │     ├─ sonner.tsx
│  │     ├─ table.tsx
│  │     └─ tooltip.tsx
│  ├─ constants
│  │  └─ endpoints.ts
│  ├─ features
│  │  ├─ auth
│  │  │  └─ login
│  │  │     ├─ index.tsx
│  │  │     └─ queries.ts
│  │  ├─ home
│  │  │  └─ index.tsx
│  │  ├─ suppliers
│  │  │  ├─ components
│  │  │  │  ├─ page-header.tsx
│  │  │  │  ├─ pagination.tsx
│  │  │  │  ├─ skeleton-rows.tsx
│  │  │  │  ├─ suppliers-table.tsx
│  │  │  │  ├─ toolbar.tsx
│  │  │  │  └─ use-debounced.ts
│  │  │  ├─ create
│  │  │  │  └─ index.tsx
│  │  │  ├─ index.tsx
│  │  │  └─ queries.ts
│  │  └─ system
│  │     └─ healthz
│  │        └─ queries.ts
│  ├─ index.css
│  ├─ lib
│  │  ├─ auth-hooks.ts
│  │  ├─ auth-store.ts
│  │  ├─ formatters.ts
│  │  ├─ http-client.ts
│  │  ├─ http.ts
│  │  ├─ query-client.ts
│  │  └─ utils.ts
│  ├─ main.tsx
│  └─ providers
│     └─ theme-provider.tsx
├─ tsconfig.app.json
├─ tsconfig.json
├─ tsconfig.node.json
└─ vite.config.ts

```