import { BrowserRouter, Routes, Route } from "react-router-dom";
import Clients from "../pages/Clients";
import Dashboard from "../pages/Dashboard";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/clientes" element={<Clients />} />
      </Routes>
    </BrowserRouter>
  );
}
