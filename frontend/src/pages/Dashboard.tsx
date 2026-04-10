import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOrderStats, type OrderStats } from "../services/statsService.ts";
import {
  getRevenueByMonth,
  getMostUsedServices,
  getOrders,
  type Order,
} from "../services/orderService";

// ── Helpers ──────────────────────────────────────────────
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

const TIPO_LABELS: Record<string, string> = {
  INSTALACAO: "Instalação",
  MANUTENCAO: "Manutenção",
  LIMPEZA: "Limpeza",
  RETIRADA: "Retirada",
};

// ── Types ─────────────────────────────────────────────────
type WidgetId =
  | "stats"
  | "pagamentos"
  | "donut"
  | "revenue"
  | "services"
  | "quicknav"
  | "recentOrders";

type WidgetConfig = {
  id: WidgetId;
  title: string;
  icon: string;
  visible: boolean;
  order: number;
};

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: "stats", title: "Resumo Geral", icon: "📊", visible: true, order: 0 },
  {
    id: "pagamentos",
    title: "Pagamentos",
    icon: "💰",
    visible: true,
    order: 1,
  },
  { id: "donut", title: "Status das OS", icon: "🍩", visible: true, order: 2 },
  { id: "revenue", title: "Faturamento", icon: "📈", visible: true, order: 3 },
  { id: "services", title: "Serviços", icon: "🔧", visible: true, order: 4 },
  {
    id: "recentOrders",
    title: "OS Recentes",
    icon: "📋",
    visible: true,
    order: 5,
  },
  { id: "quicknav", title: "Atalhos", icon: "⚡", visible: true, order: 6 },
];

// ── Stat Card ─────────────────────────────────────────────
function StatCard({
  title,
  value,
  color,
  icon,
  subtitle,
}: {
  title: string;
  value: string | number;
  color: string;
  icon: string;
  subtitle?: string;
}) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderLeft: `3px solid ${color}`,
        borderRadius: 12,
        padding: "12px 14px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        transition: "transform 0.15s, box-shadow 0.15s",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform =
          "translateY(-2px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          `0 8px 24px ${color}22`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          background: `${color}18`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontSize: 11,
            color: "var(--muted)",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            fontWeight: 600,
          }}
        >
          {title}
        </p>
        <h2
          style={{
            margin: "3px 0 0",
            fontSize: 20,
            color,
            lineHeight: 1,
            fontWeight: 700,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {value}
        </h2>
        {subtitle && (
          <p style={{ margin: "3px 0 0", fontSize: 11, color: "var(--muted)" }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Pagamentos Widget ─────────────────────────────────────
function PagamentosWidget({ orders }: { orders: Order[] }) {
  const pagos = orders.filter((o) => o.pago);
  const pendentes = orders.filter((o) => !o.pago && o.status !== "FINALIZADA");
  const finalizadosSemPagar = orders.filter(
    (o) => !o.pago && o.status === "FINALIZADA",
  );

  const totalPago = pagos.reduce((s, o) => s + Number(o.valor), 0);
  const totalPendente = orders
    .filter((o) => !o.pago)
    .reduce((s, o) => s + Number(o.valor), 0);
  const totalGeral = orders.reduce((s, o) => s + Number(o.valor), 0);
  const pctPago = totalGeral > 0 ? (totalPago / totalGeral) * 100 : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Barra de progresso geral */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          <span style={{ fontSize: 12, color: "var(--muted)" }}>
            Recebido vs Pendente
          </span>
          <span
            style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)" }}
          >
            {pctPago.toFixed(0)}%
          </span>
        </div>
        <div
          style={{
            height: 8,
            background: "var(--surface2)",
            borderRadius: 99,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${pctPago}%`,
              background: "linear-gradient(90deg, #2dd4bf, #34d399)",
              borderRadius: 99,
              transition: "width 0.8s ease",
            }}
          />
        </div>
      </div>

      {/* Valores */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div
          style={{
            background: "rgba(45,212,191,0.07)",
            border: "1px solid rgba(45,212,191,0.2)",
            borderRadius: 10,
            padding: "12px 14px",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 11,
              color: "#2dd4bf",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            ✅ Recebido
          </p>
          <p
            style={{
              margin: "6px 0 0",
              fontSize: 18,
              fontWeight: 700,
              color: "var(--text)",
            }}
          >
            {formatBRL(totalPago)}
          </p>
          <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--muted)" }}>
            {pagos.length} OS pagas
          </p>
        </div>
        <div
          style={{
            background: "rgba(251,191,36,0.07)",
            border: "1px solid rgba(251,191,36,0.2)",
            borderRadius: 10,
            padding: "12px 14px",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 11,
              color: "#fbbf24",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            ⏳ Pendente
          </p>
          <p
            style={{
              margin: "6px 0 0",
              fontSize: 18,
              fontWeight: 700,
              color: "var(--text)",
            }}
          >
            {formatBRL(totalPendente)}
          </p>
          <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--muted)" }}>
            {orders.filter((o) => !o.pago).length} OS pendentes
          </p>
        </div>
      </div>

      {/* Alerta de finalizadas sem pagar */}
      {finalizadosSemPagar.length > 0 && (
        <div
          style={{
            background: "rgba(248,113,113,0.08)",
            border: "1px solid rgba(248,113,113,0.25)",
            borderRadius: 10,
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ fontSize: 18 }}>🚨</span>
          <div>
            <p
              style={{
                margin: 0,
                fontSize: 12,
                fontWeight: 600,
                color: "#f87171",
              }}
            >
              {finalizadosSemPagar.length} OS finalizada
              {finalizadosSemPagar.length > 1 ? "s" : ""} sem receber
            </p>
            <p
              style={{ margin: "2px 0 0", fontSize: 11, color: "var(--muted)" }}
            >
              {formatBRL(
                finalizadosSemPagar.reduce((s, o) => s + Number(o.valor), 0),
              )}{" "}
              a receber
            </p>
          </div>
        </div>
      )}

      {/* Lista rápida de pendentes */}
      {pendentes.length > 0 && (
        <div>
          <p
            style={{
              margin: "0 0 8px",
              fontSize: 11,
              color: "var(--muted)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              fontWeight: 600,
            }}
          >
            Em aberto
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {pendentes.slice(0, 4).map((o) => (
              <div
                key={o.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 10px",
                  background: "var(--surface2)",
                  borderRadius: 8,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 12,
                      color: "var(--text)",
                      fontWeight: 500,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: 160,
                    }}
                  >
                    {o.descricao}
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: "var(--muted)" }}>
                    {TIPO_LABELS[o.tipo] ?? o.tipo} · {o.clientNome}
                  </p>
                </div>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#fbbf24",
                    flexShrink: 0,
                    marginLeft: 8,
                  }}
                >
                  {formatBRL(Number(o.valor))}
                </span>
              </div>
            ))}
            {pendentes.length > 4 && (
              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  color: "var(--muted)",
                  textAlign: "center",
                }}
              >
                +{pendentes.length - 4} mais
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Donut Chart ───────────────────────────────────────────
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
        style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}
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
            <strong style={{ color: s.color, fontSize: 15 }}>{s.value}</strong>
            <span
              style={{
                fontSize: 11,
                color: "var(--muted)",
                width: 36,
                textAlign: "right",
              }}
            >
              {stats.total > 0 ? ((s.value / stats.total) * 100).toFixed(0) : 0}
              %
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Revenue Chart ─────────────────────────────────────────
function RevenueChart({ revenue }: { revenue: any[] }) {
  const displayed = [...revenue].reverse().slice(-6);
  const maxVal = Math.max(...displayed.map((r) => Number(r.total)), 1);

  if (displayed.length === 0)
    return (
      <p style={{ color: "var(--muted)", fontSize: 13 }}>
        Nenhum faturamento registrado ainda.
      </p>
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {displayed.map((r) => {
        const pct = (Number(r.total) / maxVal) * 100;
        return (
          <div key={r.mes}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 6,
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
                  fontWeight: 700,
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
                  transition: "width 0.8s ease",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Services Chart ────────────────────────────────────────
function ServicesChart({ services }: { services: any[] }) {
  const COLORS = ["#2dd4bf", "#60a5fa", "#fbbf24", "#f87171"];
  const maxVal = Math.max(...services.map((s) => Number(s.total)), 1);

  if (services.length === 0)
    return (
      <p style={{ color: "var(--muted)", fontSize: 13 }}>
        Nenhum serviço registrado ainda.
      </p>
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
                width: 82,
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
                  transition: "width 0.8s ease",
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
  );
}

// ── Recent Orders ─────────────────────────────────────────
function RecentOrders({ orders }: { orders: Order[] }) {
  const recent = [...orders].slice(0, 6);

  const statusStyle: Record<
    string,
    { color: string; bg: string; label: string }
  > = {
    ABERTA: { color: "#f87171", bg: "rgba(248,113,113,0.1)", label: "Aberta" },
    ANDAMENTO: {
      color: "#fbbf24",
      bg: "rgba(251,191,36,0.1)",
      label: "Andamento",
    },
    FINALIZADA: {
      color: "#2dd4bf",
      bg: "rgba(45,212,191,0.1)",
      label: "Finalizada",
    },
  };

  if (recent.length === 0)
    return (
      <p style={{ color: "var(--muted)", fontSize: 13 }}>
        Nenhuma OS encontrada.
      </p>
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {recent.map((o) => {
        const s = statusStyle[o.status] ?? statusStyle.ABERTA;
        return (
          <div
            key={o.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 12px",
              background: "var(--surface2)",
              borderRadius: 10,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  color: "var(--text)",
                  fontWeight: 500,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {o.descricao}
              </p>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: 11,
                  color: "var(--muted)",
                }}
              >
                {o.clientNome} · {TIPO_LABELS[o.tipo] ?? o.tipo}
              </p>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 4,
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--accent)",
                }}
              >
                {formatBRL(Number(o.valor))}
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  padding: "2px 7px",
                  borderRadius: 99,
                  background: s.bg,
                  color: s.color,
                }}
              >
                {s.label}
              </span>
            </div>
            <div style={{ flexShrink: 0 }}>
              {o.pago ? (
                <span title="Pago" style={{ fontSize: 16 }}>
                  ✅
                </span>
              ) : (
                <span title="Pendente" style={{ fontSize: 16 }}>
                  ⏳
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Widget Shell (drag + hide) ────────────────────────────
function Widget({
  config,
  onHide,
  onDragStart,
  onDragOver,
  onDrop,
  isDraggingOver,
  children,
}: {
  config: WidgetConfig;
  onHide: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  isDraggingOver: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      style={{
        background: "var(--surface)",
        border: `1px solid ${isDraggingOver ? "var(--accent)" : "var(--border)"}`,
        borderRadius: 14,
        padding: "14px",
        marginBottom: 0,
        transition: "border-color 0.2s, box-shadow 0.2s, opacity 0.2s",
        boxShadow: isDraggingOver ? "0 0 0 2px var(--accent)33" : "none",
        cursor: "grab",
        overflow: "hidden",
        boxSizing: "border-box" as const,
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 16,
        }}
      >
        <span style={{ fontSize: 16 }}>{config.icon}</span>
        <h3
          style={{
            margin: 0,
            fontSize: 13,
            color: "var(--muted)",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            fontWeight: 700,
            flex: 1,
          }}
        >
          {config.title}
        </h3>
        <button
          onClick={onHide}
          title="Esconder widget"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--muted)",
            fontSize: 14,
            padding: "2px 6px",
            borderRadius: 6,
            lineHeight: 1,
            transition: "color 0.15s, background 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color =
              "var(--danger)";
            (e.currentTarget as HTMLButtonElement).style.background =
              "rgba(248,113,113,0.1)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "var(--muted)";
            (e.currentTarget as HTMLButtonElement).style.background = "none";
          }}
        >
          ✕
        </button>
      </div>
      <div style={{ cursor: "default" }}>{children}</div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [revenue, setRevenue] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_WIDGETS);
  const [showPanel, setShowPanel] = useState(false);
  const [draggingId, setDraggingId] = useState<WidgetId | null>(null);
  const [dragOverId, setDragOverId] = useState<WidgetId | null>(null);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [s, r, sv, o] = await Promise.all([
          getOrderStats(),
          getRevenueByMonth(),
          getMostUsedServices(),
          getOrders(),
        ]);
        setStats(s);
        setRevenue(Array.isArray(r) ? r : []);
        setServices(Array.isArray(sv) ? sv : []);
        setOrders(Array.isArray(o) ? o : []);
      } catch {
        setError("Erro ao carregar estatísticas.");
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const hideWidget = (id: WidgetId) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, visible: false } : w)),
    );
  };

  const showWidget = (id: WidgetId) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, visible: true } : w)),
    );
  };

  const handleDragStart = (id: WidgetId) => {
    setDraggingId(id);
  };

  const handleDragOver = (e: React.DragEvent, id: WidgetId) => {
    e.preventDefault();
    setDragOverId(id);
  };

  const handleDrop = (e: React.DragEvent, targetId: WidgetId) => {
    e.preventDefault();
    if (!draggingId || draggingId === targetId) {
      setDraggingId(null);
      setDragOverId(null);
      return;
    }
    setWidgets((prev) => {
      const draggingOrder = prev.find((w) => w.id === draggingId)!.order;
      const targetOrder = prev.find((w) => w.id === targetId)!.order;
      return prev.map((w) => {
        if (w.id === draggingId) return { ...w, order: targetOrder };
        if (w.id === targetId) return { ...w, order: draggingOrder };
        return w;
      });
    });
    setDraggingId(null);
    setDragOverId(null);
  };

  const visibleWidgets = [...widgets]
    .filter((w) => w.visible)
    .sort((a, b) => a.order - b.order);
  const hiddenWidgets = widgets.filter((w) => !w.visible);

  const totalPago = orders
    .filter((o) => o.pago)
    .reduce((s, o) => s + Number(o.valor), 0);
  const totalPendente = orders
    .filter((o) => !o.pago)
    .reduce((s, o) => s + Number(o.valor), 0);

  if (loading) {
    return (
      <div
        className="main"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 300,
        }}
      >
        <div style={{ textAlign: "center", color: "var(--muted)" }}>
          <div
            style={{
              fontSize: 32,
              marginBottom: 12,
              animation: "spin 1s linear infinite",
            }}
          >
            ⚙️
          </div>
          <p>Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error)
    return (
      <div className="main" style={{ color: "var(--danger)" }}>
        {error}
      </div>
    );
  if (!stats) return <div className="main">Sem dados.</div>;

  const renderWidgetContent = (id: WidgetId) => {
    switch (id) {
      case "stats":
        return (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 8,
            }}
          >
            <StatCard
              title="Total"
              value={stats.total}
              color="var(--accent)"
              icon="📋"
              subtitle="ordens de serviço"
            />
            <StatCard
              title="Abertas"
              value={stats.abertas}
              color="#f87171"
              icon="🔴"
              subtitle="aguardando"
            />
            <StatCard
              title="Andamento"
              value={stats.andamento}
              color="#fbbf24"
              icon="🟡"
              subtitle="em progresso"
            />
            <StatCard
              title="Finalizadas"
              value={stats.finalizadas}
              color="#2dd4bf"
              icon="✅"
              subtitle="concluídas"
            />
            <StatCard
              title="Recebido"
              value={formatBRL(totalPago)}
              color="#34d399"
              icon="💚"
              subtitle="pagamentos recebidos"
            />
            <StatCard
              title="A Receber"
              value={formatBRL(totalPendente)}
              color="#fbbf24"
              icon="⏳"
              subtitle="pagamentos pendentes"
            />
          </div>
        );
      case "pagamentos":
        return <PagamentosWidget orders={orders} />;
      case "donut":
        return <DonutChart stats={stats} />;
      case "revenue":
        return <RevenueChart revenue={revenue} />;
      case "services":
        return <ServicesChart services={services} />;
      case "recentOrders":
        return <RecentOrders orders={orders} />;
      case "quicknav":
        return (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: 8,
            }}
          >
            {[
              {
                to: "/orders",
                icon: "📋",
                title: "Ordens",
                desc: "Gerenciar OS",
              },
              {
                to: "/new-order",
                icon: "➕",
                title: "Nova OS",
                desc: "Criar ordem",
              },
              {
                to: "/clients",
                icon: "👤",
                title: "Clientes",
                desc: "Gerenciar",
              },
              {
                to: "/reports",
                icon: "📈",
                title: "Relatórios",
                desc: "Ver dados",
              },
            ].map(({ to, icon, title, desc }) => (
              <div
                key={to}
                onClick={() => navigate(to)}
                style={{
                  padding: "14px 10px",
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  background: "var(--surface2)",
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "border-color 0.15s, transform 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor =
                    "var(--accent)";
                  (e.currentTarget as HTMLDivElement).style.transform =
                    "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor =
                    "var(--border)";
                  (e.currentTarget as HTMLDivElement).style.transform =
                    "translateY(0)";
                }}
              >
                <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
                <p
                  style={{
                    margin: "0 0 2px",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--text)",
                  }}
                >
                  {title}
                </p>
                <p style={{ margin: 0, fontSize: 11, color: "var(--muted)" }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="main">
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ marginBottom: 2 }}>Dashboard</h1>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: 13 }}>
            Visão geral do sistema · Arraste os cards para reorganizar
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {hiddenWidgets.length > 0 && (
            <button
              onClick={() => setShowPanel((v) => !v)}
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: showPanel ? "var(--accent)" : "var(--surface2)",
                color: showPanel ? "#000" : "var(--text)",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                transition: "all 0.15s",
              }}
            >
              🧩 Widgets ({hiddenWidgets.length} ocultos)
            </button>
          )}
          <button
            onClick={() => setWidgets(DEFAULT_WIDGETS)}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--surface2)",
              color: "var(--muted)",
              cursor: "pointer",
              fontSize: 12,
              transition: "all 0.15s",
            }}
          >
            ↺ Resetar
          </button>
        </div>
      </div>

      {/* Painel de widgets ocultos */}
      {showPanel && hiddenWidgets.length > 0 && (
        <div
          style={{
            marginBottom: 16,
            padding: "14px 16px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
          }}
        >
          <p
            style={{
              margin: "0 0 10px",
              fontSize: 12,
              color: "var(--muted)",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Widgets ocultos — clique para mostrar
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {hiddenWidgets.map((w) => (
              <button
                key={w.id}
                onClick={() => {
                  showWidget(w.id);
                  setShowPanel(false);
                }}
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: "1px dashed var(--border)",
                  background: "var(--surface2)",
                  color: "var(--text)",
                  cursor: "pointer",
                  fontSize: 13,
                  transition: "border-color 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = "var(--accent)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = "var(--border)")
                }
              >
                {w.icon} {w.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Widgets */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {visibleWidgets.map((w) => (
          <Widget
            key={w.id}
            config={w}
            onHide={() => hideWidget(w.id)}
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = "move";
              handleDragStart(w.id);
            }}
            onDragOver={(e) => handleDragOver(e, w.id)}
            onDrop={(e) => handleDrop(e, w.id)}
            isDraggingOver={dragOverId === w.id}
          >
            {renderWidgetContent(w.id)}
          </Widget>
        ))}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        html, body { scroll-behavior: smooth; overflow-x: hidden; -webkit-overflow-scrolling: touch; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
