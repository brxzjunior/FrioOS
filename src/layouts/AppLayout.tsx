import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { clearToken, logout } from "../auth/auth";
import { getMe } from "../services/userService";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: "📊" },
  { to: "/orders", label: "Ordens", icon: "📋" },
  { to: "/new-order", label: "Nova OS", icon: "➕" },
  { to: "/clients", label: "Clientes", icon: "👤" },
  { to: "/reports", label: "Relatórios", icon: "📈" },
];

type User = { id: string; name: string; email: string; avatarUrl?: string };

const SIDEBAR_FULL = 220;
const SIDEBAR_COMPACT = 60;

export default function AppLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile drawer
  const [collapsed, setCollapsed] = useState(false); // desktop collapse
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const sidebarW = collapsed ? SIDEBAR_COMPACT : SIDEBAR_FULL;

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await getMe();
        setCurrentUser(data);
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

  // ── Sidebar content (shared desktop/mobile) ──────────────
  function SidebarContent() {
    return (
      <>
        {/* logo + toggle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
            marginBottom: 24,
            padding: "0 4px",
            minHeight: 36,
          }}
        >
          {!collapsed && (
            <img
              src="/Frio.svg"
              alt="FrioOS"
              onClick={() => {
                navigate("/dashboard");
                handleNavClick();
              }}
              style={{
                height: 28,
                cursor: "pointer",
                objectFit: "contain",
              }}
            />
          )}

          {/* botão toggle — só desktop */}
          {!isMobile && (
            <button
              onClick={() => setCollapsed((v) => !v)}
              title={collapsed ? "Expandir menu" : "Recolher menu"}
              style={{
                border: "none",
                background: "transparent",
                color: "var(--muted)",
                cursor: "pointer",
                padding: 6,
                borderRadius: 6,
                fontSize: 14,
                lineHeight: 1,
                transition: "color 0.15s, background 0.15s",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--surface2)";
                e.currentTarget.style.color = "var(--text)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--muted)";
              }}
            >
              {collapsed ? "▶" : "◀"}
            </button>
          )}

          {/* botão fechar — só mobile */}
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

        {/* nav items */}
        <nav
          style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}
        >
          {NAV_ITEMS.map(({ to, label, icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                onClick={handleNavClick}
                title={collapsed ? label : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: collapsed ? 0 : 10,
                  justifyContent: collapsed ? "center" : "flex-start",
                  padding: collapsed ? "10px 0" : "9px 12px",
                  borderRadius: 8,
                  background: active ? "rgba(45,212,191,0.12)" : "transparent",
                  color: active ? "var(--accent)" : "var(--muted)",
                  fontWeight: active ? 600 : 400,
                  textDecoration: "none",
                  fontSize: 14,
                  borderLeft:
                    !collapsed && active
                      ? "2px solid var(--accent)"
                      : "2px solid transparent",
                  transition: "all 0.15s",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "var(--surface2)";
                    e.currentTarget.style.color = "var(--text)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--muted)";
                  }
                }}
              >
                <span style={{ fontSize: 16, flexShrink: 0, lineHeight: 1 }}>
                  {icon}
                </span>
                {!collapsed && (
                  <span
                    style={{ overflow: "hidden", textOverflow: "ellipsis" }}
                  >
                    {label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* perfil + logout */}
        <div
          style={{
            marginTop: "auto",
            paddingTop: 12,
            borderTop: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {/* avatar / nome */}
          <div
            onClick={() => {
              navigate("/profile");
              handleNavClick();
            }}
            title={collapsed ? (currentUser?.name ?? "Perfil") : undefined}
            style={{
              display: "flex",
              alignItems: "center",
              gap: collapsed ? 0 : 10,
              justifyContent: collapsed ? "center" : "flex-start",
              padding: collapsed ? "8px 0" : "8px 10px",
              borderRadius: 8,
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--surface2)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                flexShrink: 0,
                background: "rgba(45,212,191,0.15)",
                border: "1px solid rgba(45,212,191,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 700,
                color: "var(--accent)",
                overflow: "hidden",
              }}
            >
              {currentUser?.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                initial
              )}
            </div>
            {!collapsed && (
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--text)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {currentUser?.name ?? "Usuário"}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--muted)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {currentUser?.email ?? ""}
                </div>
              </div>
            )}
          </div>

          {/* sair */}
          <button
            onClick={handleLogout}
            title={collapsed ? "Sair" : undefined}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed ? "center" : "flex-start",
              gap: collapsed ? 0 : 8,
              padding: collapsed ? "10px 0" : "9px 12px",
              borderRadius: 8,
              border: "1px solid rgba(248,113,113,0.25)",
              background: "rgba(248,113,113,0.07)",
              color: "#f87171",
              cursor: "pointer",
              fontSize: 14,
              minHeight: 40,
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(248,113,113,0.14)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "rgba(248,113,113,0.07)")
            }
          >
            <span style={{ fontSize: 16 }}>🚪</span>
            {!collapsed && <span>Sair</span>}
          </button>
        </div>
      </>
    );
  }

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
      {/* overlay mobile */}
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

      {/* ── SIDEBAR ──────────────────────────────────────── */}
      <aside
        style={{
          width: isMobile ? SIDEBAR_FULL : sidebarW,
          borderRight: "1px solid var(--border)",
          padding: "16px 10px",
          display: "flex",
          flexDirection: "column",
          background: "var(--surface)",
          flexShrink: 0,
          transition: "width 0.22s ease",
          overflow: "hidden",

          // mobile: drawer
          ...(isMobile && {
            position: "fixed",
            top: 0,
            left: 0,
            bottom: 0,
            zIndex: 40,
            transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 0.25s ease",
            boxShadow: sidebarOpen ? "4px 0 24px rgba(0,0,0,0.4)" : "none",
            width: SIDEBAR_FULL,
          }),
        }}
      >
        <SidebarContent />
      </aside>

      {/* ── CONTEÚDO ─────────────────────────────────────── */}
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
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            background: "var(--surface)",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
              /* breadcrumb simples */
              <span style={{ fontSize: 13, color: "var(--muted)" }}>
                {NAV_ITEMS.find((n) => n.to === pathname)?.icon}{" "}
                <span style={{ color: "var(--text)", fontWeight: 500 }}>
                  {NAV_ITEMS.find((n) => n.to === pathname)?.label ?? "FrioOS"}
                </span>
              </span>
            )}
          </div>

          {/* avatar no header */}
          <div
            onClick={() => navigate("/profile")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: 13, color: "var(--muted)" }}>
              {currentUser?.name ?? ""}
            </span>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "rgba(45,212,191,0.15)",
                border: "1px solid rgba(45,212,191,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 700,
                color: "var(--accent)",
                overflow: "hidden",
              }}
            >
              {currentUser?.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                initial
              )}
            </div>
          </div>
        </header>

        {/* página */}
        <main style={{ flex: 1, overflowY: "auto" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
