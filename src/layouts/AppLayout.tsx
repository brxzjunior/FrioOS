// src/components/AppLayout.tsx
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { clearToken, logout } from "../auth/auth";
import { getMe } from "../services/userService";

const NAV_ITEMS = [
  { to: "/dashboard", label: "📊 Dashboard" },
  { to: "/orders", label: "📋 Ordens" },
  { to: "/new-order", label: "➕ Nova OS" },
  { to: "/clients", label: "👤 Clientes" },
  { to: "/reports", label: "📈 Relatórios" },
];

type User = { id: string; name: string; email: string; avatarUrl?: string };

export default function AppLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        // 🔥 pega do backend (CORRETO)
        const data = await getMe();

        setCurrentUser(data);

        // 🔥 salva completo (inclui avatar)
        localStorage.setItem("user", JSON.stringify(data));
      } catch (err) {
        console.error("Erro ao carregar usuário", err);
      }
    }

    loadUser();
  }, []);

  useEffect(() => {
    function handleResize() {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function handleNavClick() {
    if (isMobile) setSidebarOpen(false);
  }

  function handleLogout() {
    logout?.();
    clearToken();
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  }

  const initial = (currentUser?.name?.[0] || "U").toUpperCase();

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        maxHeight: "100vh",
        overflow: "hidden",
        background: "var(--bg)",
      }}
    >
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 30,
          }}
        />
      )}

      <aside
        style={{
          width: 220,
          borderRight: "1px solid var(--border)",
          padding: "20px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          background: "var(--surface)",
          flexShrink: 0,
          ...(isMobile && {
            position: "fixed",
            top: 0,
            left: 0,
            bottom: 0,
            zIndex: 40,
            transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 0.25s ease",
            boxShadow: sidebarOpen ? "4px 0 24px rgba(0,0,0,0.4)" : "none",
          }),
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
            padding: "0 8px",
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
              color: "var(--accent)",
              fontSize: 16,
              letterSpacing: "0.03em",
            }}
          >
            ❄️ FrioOS
          </h3>
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              style={{
                border: "none",
                background: "transparent",
                color: "var(--muted)",
                fontSize: 18,
                cursor: "pointer",
                padding: 4,
              }}
            >
              ✕
            </button>
          )}
        </div>

        {NAV_ITEMS.map(({ to, label }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              onClick={handleNavClick}
              style={{
                display: "block",
                padding: "9px 12px",
                borderRadius: 8,
                background: active ? "rgba(45,212,191,0.12)" : "transparent",
                color: active ? "var(--accent)" : "var(--muted)",
                fontWeight: active ? 600 : 400,
                textDecoration: "none",
                fontSize: 14,
                borderLeft: active
                  ? "2px solid var(--accent)"
                  : "2px solid transparent",
                transition: "all 0.15s",
              }}
            >
              {label}
            </Link>
          );
        })}

        <button
          onClick={handleLogout}
          style={{
            marginTop: "auto",
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid rgba(248,113,113,0.3)",
            background: "rgba(248,113,113,0.08)",
            color: "#f87171",
            cursor: "pointer",
            fontSize: 14,
            minHeight: 44,
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(248,113,113,0.15)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "rgba(248,113,113,0.08)")
          }
        >
          Sair
        </button>
      </aside>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        <header
          style={{
            height: 60,
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
            background: "var(--surface)",
            flexShrink: 0,
          }}
        >
          {isMobile ? (
            <button
              onClick={() => setSidebarOpen((p) => !p)}
              style={{
                border: "none",
                background: "transparent",
                color: "var(--text)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 4px",
                minHeight: 44,
                minWidth: 44,
              }}
            >
              <span style={{ fontSize: 20 }}>☰</span>
              <span style={{ fontWeight: 700, color: "var(--accent)" }}>
                FrioOS
              </span>
            </button>
          ) : (
            <span
              style={{ fontWeight: 700, color: "var(--accent)", fontSize: 15 }}
            >
              ❄️ FrioOS
            </span>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span
              style={{
                fontSize: 13,
                color: "var(--text)",
                cursor: "pointer",
              }}
              onClick={() => navigate("/profile")}
            >
              {currentUser?.name || "Usuário"}
            </span>

            <div
              onClick={() => navigate("/profile")}
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "rgba(45,212,191,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                fontWeight: 600,
                color: "var(--accent)",
                cursor: "pointer",
                overflow: "hidden",
              }}
            >
              {currentUser?.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                initial
              )}
            </div>
          </div>
        </header>

        <main
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 24,
            background: "var(--bg0)",
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
