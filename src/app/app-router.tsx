import { createBrowserRouter, Navigate } from "react-router-dom";
import { RequireAuth } from "./guards/require-auth";
import { PublicLayout } from "./layouts/public-layout";
import PrivateLayout from "./layouts/private-layout";

import LoginPage from "@/features/auth/login";
import HomePage from "@/features/home";

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
      // outras rotas privadas aqui...
    ],
  },

  // fallback
  { path: "*", element: <Navigate to="/" replace /> },
]);
