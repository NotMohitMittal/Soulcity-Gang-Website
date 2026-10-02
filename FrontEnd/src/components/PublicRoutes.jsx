import React from "react";
import useAuthStore from "../store/useAuthStore";
import { Navigate, Outlet } from "react-router-dom";

const PublicRoutes = () => {
  const { authUser, isCheckingAuth } = useAuthStore();

  if (isCheckingAuth) return null;

  return !authUser ? <Outlet /> : <Navigate to="/dashboard/home" replace />;
};

export default PublicRoutes;
