import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOrderStats, type OrderStats } from "../services/statsService.ts";
import {
  getRevenueByMonth,
  getMostUsedServices,
} from "../services/orderService";

function formatBRL(value: number) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatMonth(mes: string) {
  const [year, month] = mes.split("-");
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString(
    "pt-BR",
    {
      month: "short",
      year: "2-digit",
    },
  );
}

// ── Stat Card ────────────────────────────────────────────
function StatCard({
  title,
  value,
  color,
  icon,
}: {
  title: string;
  value: number;
  color: string;
  icon: string;
}) {
  return (
    <div
      className="card"
      style={{
        marginBottom: 0,
        borderLeft: `3px solid ${color}`,
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          background: `${color}18`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <p
          style={{
            margin: 0,
            fontSize: 12,
            color: "var(--muted)",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          {title}
        </p>
        <h2 style={{ margin: "2px 0 0", fontSize: 28, color, lineHeight: 1 }}>
          {value}
        </h2>
      </div>
    </div>
  );
}

// ── Donut Chart ──────────────────────────────────────────
function DonutChart({ stats }: { stats: OrderStats }) {
  const segments = [
    { label: "Abertas", value: stats.abertas, color: "#f87171" },
    { label: "Andamento", value: stats.andamento, color: "#fbbf24" },
    { label: "Finalizadas", value: stats.finalizadas, color: "#2dd4bf" },
  ];

  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = 54,
    cx = 70,
    cy = 70,
    strokeW = 18;
  let cumulative = 0;

  const slices = segments.map((seg) => {
    const pct = seg.value / total;
    const start = cumulative * 2 * Math.PI - Math.PI / 2;
    cumulative += pct;
    const end = cumulative * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(start),
      y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end),
      y2 = cy + r * Math.sin(end);
    const large = pct > 0.5 ? 1 : 0;
    return {
      ...seg,
      pct,
      d: `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`,
    };
  });

  return (
    <div className="card" style={{ marginBottom: 0 }}>
      <h3
        style={{
          margin: "0 0 16px",
          fontSize: 14,
          color: "var(--muted)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        Status das OS
      </h3>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        <svg width={140} height={140} viewBox="0 0 140 140">
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="var(--border)"
            strokeWidth={strokeW}
          />
          {total > 1 &&
            slices.map((s, i) =>
              s.pct > 0.01 ? (
                <path
                  key={i}
                  d={s.d}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={strokeW}
                  strokeLinecap="butt"
                />
              ) : null,
            )}
          <text
            x={cx}
            y={cy - 8}
            textAnchor="middle"
            fontSize={11}
            fill="var(--muted)"
          >
            Total
          </text>
          <text
            x={cx}
            y={cy + 12}
            textAnchor="middle"
            fontSize={24}
            fontWeight="700"
            fill="var(--text)"
          >
            {stats.total}
          </text>
        </svg>

        <div
          style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}
        >
          {segments.map((s) => (
            <div
              key={s.label}
              style={{ display: "flex", alignItems: "center", gap: 10 }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: s.color,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 13, color: "var(--muted)", flex: 1 }}>
                {s.label}
              </span>
              <strong style={{ color: s.color, fontSize: 15 }}>
                {s.value}
              </strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Revenue Chart ────────────────────────────────────────
function RevenueChart({ revenue }: { revenue: any[] }) {
  const displayed = [...revenue].reverse().slice(-6);
  const maxVal = Math.max(...displayed.map((r) => Number(r.total)), 1);

  return (
    <div className="card" style={{ marginBottom: 0 }}>
      <h3
        style={{
          margin: "0 0 16px",
          fontSize: 14,
          color: "var(--muted)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        Faturamento por Mês
      </h3>
      {displayed.length === 0 ? (
        <p>Sem dados.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {displayed.map((r) => {
            const pct = (Number(r.total) / maxVal) * 100;
            return (
              <div key={r.mes}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 5,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--muted)",
                      textTransform: "capitalize",
                    }}
                  >
                    {formatMonth(r.mes)}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--accent)",
                    }}
                  >
                    {formatBRL(r.total)}
                  </span>
                </div>
                <div
                  style={{
                    height: 6,
                    background: "var(--surface2)",
                    borderRadius: 99,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${pct}%`,
                      background: "linear-gradient(90deg, #2dd4bf, #34d399)",
                      borderRadius: 99,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Services Chart ───────────────────────────────────────
function ServicesChart({ services }: { services: any[] }) {
  const TIPO_LABELS: Record<string, string> = {
    INSTALACAO: "Instalação",
    MANUTENCAO: "Manutenção",
    LIMPEZA: "Limpeza",
    RETIRADA: "Retirada",
  };
  const COLORS = ["#2dd4bf", "#60a5fa", "#fbbf24", "#f87171"];
  const maxVal = Math.max(...services.map((s) => Number(s.total)), 1);

  return (
    <div className="card" style={{ marginBottom: 0 }}>
      <h3
        style={{
          margin: "0 0 16px",
          fontSize: 14,
          color: "var(--muted)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        Serviços Realizados
      </h3>
      {services.length === 0 ? (
        <p>Sem dados.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {services.map((s, i) => {
            const pct = (Number(s.total) / maxVal) * 100;
            const color = COLORS[i % COLORS.length];
            return (
              <div
                key={s.tipo}
                style={{ display: "flex", alignItems: "center", gap: 10 }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    width: 80,
                    flexShrink: 0,
                  }}
                >
                  {TIPO_LABELS[s.tipo] ?? s.tipo}
                </span>
                <div
                  style={{
                    flex: 1,
                    height: 8,
                    background: "var(--surface2)",
                    borderRadius: 99,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${pct}%`,
                      background: color,
                      borderRadius: 99,
                    }}
                  />
                </div>
                <strong
                  style={{
                    fontSize: 13,
                    color,
                    width: 24,
                    textAlign: "right",
                    flexShrink: 0,
                  }}
                >
                  {s.total}
                </strong>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [revenue, setRevenue] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [s, r, sv] = await Promise.all([
          getOrderStats(),
          getRevenueByMonth(),
          getMostUsedServices(),
        ]);
        setStats(s);
        setRevenue(Array.isArray(r) ? r : []);
        setServices(Array.isArray(sv) ? sv : []);
      } catch {
        setError("Erro ao carregar estatísticas.");
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  if (loading) return <div className="main">Carregando...</div>;
  if (error)
    return (
      <div className="main" style={{ color: "var(--danger)" }}>
        {error}
      </div>
    );
  if (!stats) return <div className="main">Sem dados.</div>;

  return (
    <div className="main">
      <h1 style={{ marginBottom: 2 }}>Dashboard</h1>
      <p style={{ marginBottom: 24 }}>Visão geral do sistema</p>

      {/* STAT CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <StatCard
          title="Total"
          value={stats.total}
          color="var(--accent)"
          icon="📋"
        />
        <StatCard
          title="Abertas"
          value={stats.abertas}
          color="var(--danger)"
          icon="🔴"
        />
        <StatCard
          title="Andamento"
          value={stats.andamento}
          color="var(--warn)"
          icon="🟡"
        />
        <StatCard
          title="Finalizadas"
          value={stats.finalizadas}
          color="var(--accent2)"
          icon="✅"
        />
      </div>

      {/* GRÁFICOS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <DonutChart stats={stats} />
        <ServicesChart services={services} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <RevenueChart revenue={revenue} />
      </div>

      {/* NAVEGAÇÃO RÁPIDA */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: 10,
        }}
      >
        {[
          { to: "/orders", icon: "📋", title: "Ordens", desc: "Gerenciar OS" },
          {
            to: "/new-order",
            icon: "➕",
            title: "Nova OS",
            desc: "Criar ordem",
          },
          { to: "/clients", icon: "👤", title: "Clientes", desc: "Gerenciar" },
          {
            to: "/reports",
            icon: "📈",
            title: "Relatórios",
            desc: "Ver dados",
          },
        ].map(({ to, icon, title, desc }) => (
          <div
            key={to}
            className="card"
            style={{
              cursor: "pointer",
              marginBottom: 0,
              transition: "border-color 0.2s",
            }}
            onClick={() => navigate(to)}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = "var(--accent)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = "var(--border)")
            }
          >
            <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
            <h3 style={{ margin: "0 0 2px", fontSize: 14 }}>{title}</h3>
            <p style={{ margin: 0, fontSize: 12 }}>{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
