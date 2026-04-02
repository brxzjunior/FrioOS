import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import AppLayout from "../layouts/AppLayout";

import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Dashboard from "../pages/Dashboard";
import Clients from "../pages/Clients";
import Orders from "../pages/Orders";
import NewOrder from "../pages/NewOrder";
import Reports from "../pages/Reports";
import LoginSuccess from "../pages/LoginSuccess";
import GoogleCallback from "../pages/GoogleCallback";
import ResetPassword from "../pages/ResetPassword";
import Profile from "../pages/Profile";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Google callback NÃO pode ser protegido */}
        <Route path="/auth/google/callback" element={<GoogleCallback />} />

        <Route path="/login/success" element={<LoginSuccess />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* privadas */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/new-order" element={<NewOrder />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
