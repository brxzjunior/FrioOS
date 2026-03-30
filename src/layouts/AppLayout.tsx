import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { logout } from "../auth/auth";

const NAV_ITEMS = [
  { to: "/dashboard", label: "📊 Dashboard" },
  { to: "/orders", label: "📋 Ordens" },
  { to: "/new-order", label: "➕ Nova OS" },
  { to: "/clients", label: "👤 Clientes" },
  { to: "/reports", label: "📈 Relatórios" },
];

export default function AppLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    function handleResize() {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false); // reset ao voltar para desktop
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // fecha sidebar ao navegar no mobile
  function handleNavClick() {
    if (isMobile) setSidebarOpen(false);
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
      {/* ── OVERLAY (mobile) ───────────────────────────── */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.35)",
            zIndex: 30,
          }}
        />
      )}

      {/* ── SIDEBAR ────────────────────────────────────── */}
      <aside
        style={{
          width: 220,
          borderRight: "1px solid #ddd",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          backgroundColor: "#fff",
          flexShrink: 0,
          // mobile: drawer deslizante
          ...(isMobile && {
            position: "fixed",
            top: 0,
            left: 0,
            bottom: 0,
            zIndex: 40,
            transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 0.25s ease",
            boxShadow: sidebarOpen ? "4px 0 16px rgba(0,0,0,0.12)" : "none",
          }),
        }}
      >
        {/* cabeçalho da sidebar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <h3
            onClick={() => {
              navigate("/dashboard");
              handleNavClick();
            }}
            style={{
              margin: 0,
              cursor: "pointer",
              color: "#4f46e5",
              fontSize: 17,
            }}
          >
            ❄️ FrioOS
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
                padding: 4,
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* links */}
        {NAV_ITEMS.map(({ to, label }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              onClick={handleNavClick}
              style={{
                display: "block",
                padding: "10px 12px",
                borderRadius: "8px",
                background: active ? "#eef2ff" : "transparent",
                color: active ? "#4f46e5" : "#333",
                fontWeight: active ? 600 : 400,
                textDecoration: "none",
                fontSize: 14,
                transition: "background 0.15s",
              }}
            >
              {label}
            </Link>
          );
        })}

        {/* botão sair */}
        <button
          onClick={handleLogout}
          style={{
            marginTop: "auto",
            padding: "10px 12px",
            borderRadius: "8px",
            border: "1px solid #ef4444",
            background: "#fee2e2",
            color: "#b91c1c",
            cursor: "pointer",
            fontSize: 14,
            minHeight: 44,
          }}
        >
          Sair
        </button>
      </aside>

      {/* ── CONTEÚDO PRINCIPAL ─────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {/* header */}
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
                padding: "8px 4px",
                minHeight: 44,
                minWidth: 44,
              }}
            >
              <span style={{ fontSize: 22 }}>☰</span>
              <span style={{ fontWeight: 700 }}>FrioOS</span>
            </button>
          ) : (
            <span style={{ fontWeight: 700, color: "#4f46e5" }}>❄️ FrioOS</span>
          )}
        </header>

        {/* página */}
        <main style={{ flex: 1, overflowY: "auto" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
