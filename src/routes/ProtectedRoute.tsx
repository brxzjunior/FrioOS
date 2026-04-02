import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "../auth/auth";

export default function ProtectedRoute() {
  const authed = isAuthenticated();

  if (!authed) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
