import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { logout } from "../auth/auth";

export default function AppLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  useEffect(() => {
    function handleResize() {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function NavItem({ to, label }: { to: string; label: string }) {
    const active = pathname === to;

    return (
      <Link
        to={to}
        onClick={() => isMobile && setSidebarOpen(false)}
        style={{
          display: "block",
          padding: "10px",
          borderRadius: "8px",
          background: active ? "#eee" : "transparent",
          textDecoration: "none",
          color: "#000",
          marginBottom: "4px",
        }}
      >
        {label}
      </Link>
    );
  }

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        maxHeight: "100vh",
        overflow: "hidden",
      }}
    >
      {(!isMobile || sidebarOpen) && (
        <aside
          style={{
            width: 220,
            borderRight: "1px solid #ddd",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            backgroundColor: "#fff",
            position: isMobile ? "fixed" : "static",
            inset: isMobile ? "0 auto 0 0" : undefined,
            zIndex: 40,
            boxShadow: isMobile ? "2px 0 6px rgba(0,0,0,0.15)" : "none",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <h3
              onClick={() => {
                navigate("/dashboard");
                if (isMobile) setSidebarOpen(false);
              }}
              style={{ cursor: "pointer" }}
            >
              FrioOS
            </h3>

            {isMobile && (
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: 18,
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            )}
          </div>

          <NavItem to="/dashboard" label="Dashboard" />
          <NavItem to="/orders" label="Ordens" />
          <NavItem to="/new-order" label="Nova OS" />
          <NavItem to="/clients" label="Clientes" />
          <NavItem to="/reports" label="Relatórios" />

          <button
            onClick={handleLogout}
            style={{
              marginTop: "auto",
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid #ef4444",
              background: "#fee2e2",
              color: "#b91c1c",
              cursor: "pointer",
            }}
          >
            Sair
          </button>
        </aside>
      )}

      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.3)",
            zIndex: 30,
          }}
        />
      )}

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <header
          style={{
            height: 56,
            borderBottom: "1px solid #ddd",
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            backgroundColor: "#fff",
            flexShrink: 0,
          }}
        >
          {isMobile ? (
            <button
              type="button"
              onClick={() => setSidebarOpen((prev) => !prev)}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 22 }}>☰</span>
              <span style={{ fontWeight: 700 }}>FrioOS</span>
            </button>
          ) : (
            <span style={{ fontWeight: 700 }}>FrioOS</span>
          )}
        </header>

        <main
          style={{
            flex: 1,
            padding: "20px",
            overflowY: "auto",
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
