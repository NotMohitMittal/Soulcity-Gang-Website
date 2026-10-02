import React from "react";
import useAuthStore from "../store/useAuthStore";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoutes = () => {
  const { authUser, isCheckingAuth } = useAuthStore();

  if (isCheckingAuth) return null;

  // ProtectedRoutes.jsx
  return authUser ? <Outlet /> : <Navigate to="/" state={{ requireLogin: true }} replace />;
};

export default ProtectedRoutes;
