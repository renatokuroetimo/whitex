import React from "react";
import { Navigate } from "react-router-dom";
import { adminAPI } from "@/lib/admin-api";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({
  children,
}) => {
  const isAuthenticated = adminAPI.isAuthenticated();

  if (!isAuthenticated) {
    // Redirecionar para login do admin se não estiver autenticado
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;
