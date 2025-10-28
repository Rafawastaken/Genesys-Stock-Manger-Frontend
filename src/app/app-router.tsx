// src/app/app-router.tsx
// Configuração das rotas da aplicação

import { createBrowserRouter, Navigate } from "react-router-dom";
import { RequireAuth } from "./guards/require-auth";
import { PublicLayout } from "./layouts/public-layout";
import PrivateLayout from "./layouts/private-layout";

import LoginPage from "@/features/auth/login";
import HomePage from "@/features/home";
// Suppliers
import SuppliersPage from "@/features/suppliers";
import SuppliersCreatePage from "@/features/suppliers/create";
import SupplierEditPage from "@/features/suppliers/edit";
import ProductsPage from "@/features/products";

export const router = createBrowserRouter([
  // público
  {
    path: "/login",
    element: (
      <PublicLayout>
        <LoginPage />
      </PublicLayout>
    ),
  },

  // privado
  {
    path: "/",
    element: (
      <RequireAuth>
        <PrivateLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <HomePage /> },
      // Suppliers
      { path: "suppliers", element: <SuppliersPage /> },
      { path: "suppliers/create", element: <SuppliersCreatePage /> },
      { path: "suppliers/:id/edit", element: <SupplierEditPage /> },
      // Products
      { path: "products", element: <ProductsPage /> },
    ],
  },

  // fallback
  { path: "*", element: <Navigate to="/" replace /> },
]);
