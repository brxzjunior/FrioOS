import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../auth/auth";

export default function AppLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  function NavItem({ to, label }: { to: string; label: string }) {
    const active = pathname === to;

    return (
      <Link
        to={to}
        style={{
          display: "block",
          padding: "10px",
          borderRadius: "8px",
          background: active ? "#eee" : "transparent",
          textDecoration: "none",
          color: "#000",
        }}
      >
        {label}
      </Link>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: "220px",
          borderRight: "1px solid #ddd",
          padding: "16px",
        }}
      >
        <h3>FrioOS</h3>

        <NavItem to="/dashboard" label="Dashboard" />
        <NavItem to="/clientes" label="Clientes" />
        <NavItem to="/ordens" label="Ordens" />
        <NavItem to="/ordens/nova" label="Nova OS" />
        <NavItem to="/relatorios" label="Relatórios" />

        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          style={{ marginTop: "20px" }}
        >
          Sair
        </button>
      </aside>

      {/* Conteúdo */}
      <main style={{ flex: 1, padding: "20px" }}>
        <Outlet />
      </main>
    </div>
  );
}
