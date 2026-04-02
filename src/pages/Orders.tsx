import { useEffect, useMemo, useState } from "react";
import { getClients, type Client } from "../services/clientService";
import {
  getOrders,
  updateOrderStatus,
  deleteOrder,
  updateOrder,
  type Order,
  type OrderStatus,
  type OrderTipo,
} from "../services/orderService";
import { generateOrderPdf } from "../utils/orderPdf";
import toast from "react-hot-toast";

// ── Constantes visuais ────────────────────────────────────
const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  ABERTA: {
    label: "Aberta",
    color: "#f87171",
    bg: "rgba(248,113,113,0.1)",
    border: "rgba(248,113,113,0.3)",
  },
  ANDAMENTO: {
    label: "Andamento",
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.1)",
    border: "rgba(251,191,36,0.3)",
  },
  FINALIZADA: {
    label: "Finalizada",
    color: "#2dd4bf",
    bg: "rgba(45,212,191,0.1)",
    border: "rgba(45,212,191,0.3)",
  },
};

const TIPO_LABELS: Record<string, string> = {
  INSTALACAO: "Instalação",
  MANUTENCAO: "Manutenção",
  LIMPEZA: "Limpeza",
  RETIRADA: "Retirada",
};

function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const s = STATUS_CONFIG[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px",
        borderRadius: 99,
        fontSize: 11,
        fontWeight: 600,
        color: s.color,
        background: s.bg,
        border: `1px solid ${s.border}`,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: s.color,
          display: "inline-block",
        }}
      />
      {s.label}
    </span>
  );
}

// ── Componente principal ──────────────────────────────────
export default function Orders() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editTipo, setEditTipo] = useState<OrderTipo>("MANUTENCAO");
  const [editDescricao, setEditDescricao] = useState("");
  const [editValor, setEditValor] = useState("");
  const [editObs, setEditObs] = useState("");
  const [editScheduledFor, setEditScheduledFor] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const clientMap = useMemo(() => {
    const map = new Map<string, Client>();
    clients.forEach((c) => map.set(c.id, c));
    return map;
  }, [clients]);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      setLoading(true);
      const [ordersData, clientsData] = await Promise.all([
        getOrders(),
        getClients(),
      ]);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setClients(clientsData);
    } catch {
      toast.error("Erro ao carregar ordens.");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(id: string, status: OrderStatus) {
    try {
      setUpdatingId(id);
      await updateOrderStatus(id, status);
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status } : o)),
      );
      toast.success("Status atualizado.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta OS?")) return;
    try {
      await deleteOrder(id);
      setOrders((prev) => prev.filter((o) => o.id !== id));
      toast.success("OS excluída.");
    } catch {
      toast.error("Erro ao excluir.");
    }
  }

  function handleGeneratePdf(order: Order) {
    const client = clientMap.get(order.clientId);
    generateOrderPdf(order, client);
    toast.success("PDF gerado.");
  }

  function openGoogleReminder(order: Order) {
    const client = clientMap.get(order.clientId);
    const title = encodeURIComponent(
      `Serviço: ${order.tipo} - ${client?.nome ?? ""}`,
    );
    const details = encodeURIComponent(
      `${order.descricao}\n\nObs: ${order.obs ?? "-"}`,
    );
    const base = order.scheduledFor ? new Date(order.scheduledFor) : new Date();
    const start = new Date(
      base.getFullYear(),
      base.getMonth(),
      base.getDate(),
      8,
      0,
    );
    const end = new Date(
      base.getFullYear(),
      base.getMonth(),
      base.getDate(),
      9,
      0,
    );
    const fmt = (d: Date) =>
      d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    window.open(
      `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${fmt(start)}/${fmt(end)}`,
      "_blank",
    );
  }

  function startEdit(order: Order) {
    setEditingOrder(order);
    setEditTipo(order.tipo);
    setEditDescricao(order.descricao);
    setEditValor(String(order.valor));
    setEditObs(order.obs ?? "");
    setEditScheduledFor(
      order.scheduledFor ? order.scheduledFor.slice(0, 10) : "",
    );
  }

  async function handleSaveEdit() {
    if (!editingOrder) return;
    if (!editDescricao.trim()) {
      toast.error("Preencha a descrição.");
      return;
    }
    if (!editValor.trim() || isNaN(Number(editValor))) {
      toast.error("Valor inválido.");
      return;
    }
    try {
      setSavingEdit(true);
      const updated = await updateOrder(editingOrder.id, {
        tipo: editTipo,
        descricao: editDescricao,
        valor: Number(editValor),
        obs: editObs || null,
        scheduledFor: editScheduledFor || null,
      });
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      toast.success("OS atualizada.");
      setEditingOrder(null);
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setSavingEdit(false);
    }
  }

  const visibleOrders =
    statusFilter === "ALL"
      ? orders
      : orders.filter((o) => o.status === statusFilter);

  // contadores para os filtros
  const counts = useMemo(
    () => ({
      ALL: orders.length,
      ABERTA: orders.filter((o) => o.status === "ABERTA").length,
      ANDAMENTO: orders.filter((o) => o.status === "ANDAMENTO").length,
      FINALIZADA: orders.filter((o) => o.status === "FINALIZADA").length,
    }),
    [orders],
  );

  return (
    <div className="main">
      {/* CABEÇALHO */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Ordens de Serviço</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13 }}>
            {visibleOrders.length} OS encontradas
          </p>
        </div>
      </div>

      {/* FILTROS EM PILLS */}
      <div
        style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}
      >
        {(["ALL", "ABERTA", "ANDAMENTO", "FINALIZADA"] as const).map((f) => {
          const active = statusFilter === f;
          const sc = f !== "ALL" ? STATUS_CONFIG[f] : null;
          return (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              style={{
                padding: "6px 14px",
                borderRadius: 99,
                fontSize: 13,
                cursor: "pointer",
                fontWeight: active ? 600 : 400,
                border: active
                  ? `1px solid ${sc?.border ?? "var(--accent)"}`
                  : "1px solid var(--border)",
                background: active
                  ? (sc?.bg ?? "rgba(45,212,191,0.1)")
                  : "var(--surface2)",
                color: active ? (sc?.color ?? "var(--accent)") : "var(--muted)",
                transition: "all 0.15s",
              }}
            >
              {f === "ALL" ? "Todas" : STATUS_CONFIG[f].label}
              <span
                style={{
                  marginLeft: 6,
                  padding: "1px 6px",
                  borderRadius: 99,
                  background: active
                    ? (sc?.border ?? "rgba(45,212,191,0.3)")
                    : "var(--border)",
                  fontSize: 11,
                }}
              >
                {counts[f]}
              </span>
            </button>
          );
        })}
      </div>

      {/* LISTA */}
      {loading ? (
        <p>Carregando...</p>
      ) : visibleOrders.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 40 }}>
          <p style={{ fontSize: 32, margin: "0 0 8px" }}>📋</p>
          <p style={{ margin: 0 }}>Nenhuma OS encontrada.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {visibleOrders.map((o) => {
            const client = clientMap.get(o.clientId);
            const sc = STATUS_CONFIG[o.status];
            const expanded = expandedId === o.id;

            return (
              <div
                key={o.id}
                className="card"
                style={{
                  marginBottom: 0,
                  borderLeft: `3px solid ${sc.color}`,
                  transition: "border-color 0.2s",
                }}
              >
                {/* LINHA PRINCIPAL — sempre visível */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    flexWrap: "wrap",
                    cursor: "pointer",
                  }}
                  onClick={() => setExpandedId(expanded ? null : o.id)}
                >
                  {/* tipo + cliente */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 600,
                          fontSize: 14,
                          color: "var(--text)",
                        }}
                      >
                        {TIPO_LABELS[o.tipo] ?? o.tipo}
                      </span>
                      <StatusBadge status={o.status} />
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "var(--muted)",
                        marginTop: 3,
                        display: "flex",
                        gap: 16,
                        flexWrap: "wrap",
                      }}
                    >
                      <span>👤 {client?.nome ?? "—"}</span>
                      {o.scheduledFor && (
                        <span>
                          📅 {o.scheduledFor.split("-").reverse().join("/")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* valor + chevron */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: 15,
                        color: "var(--accent)",
                      }}
                    >
                      {formatBRL(o.valor)}
                    </span>
                    <span
                      style={{
                        color: "var(--muted)",
                        fontSize: 12,
                        transition: "transform 0.2s",
                        transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                        display: "inline-block",
                      }}
                    >
                      ▾
                    </span>
                  </div>
                </div>

                {/* DETALHES EXPANDIDOS */}
                {expanded && (
                  <div
                    style={{
                      marginTop: 14,
                      paddingTop: 14,
                      borderTop: "1px solid var(--border)",
                    }}
                  >
                    {/* descrição e obs */}
                    {o.descricao && (
                      <div style={{ marginBottom: 8 }}>
                        <span
                          style={{
                            fontSize: 11,
                            color: "var(--muted)",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          Descrição
                        </span>
                        <p
                          style={{
                            margin: "4px 0 0",
                            fontSize: 13,
                            color: "var(--text)",
                          }}
                        >
                          {o.descricao}
                        </p>
                      </div>
                    )}
                    {o.obs && (
                      <div style={{ marginBottom: 12 }}>
                        <span
                          style={{
                            fontSize: 11,
                            color: "var(--muted)",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          Observações
                        </span>
                        <p
                          style={{
                            margin: "4px 0 0",
                            fontSize: 13,
                            color: "var(--text)",
                          }}
                        >
                          {o.obs}
                        </p>
                      </div>
                    )}

                    {/* AÇÕES */}
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                        alignItems: "center",
                      }}
                    >
                      {/* status inline */}
                      <select
                        className="input"
                        style={{ maxWidth: 150, marginTop: 0, fontSize: 13 }}
                        value={o.status}
                        onChange={(e) =>
                          handleStatusChange(
                            o.id,
                            e.target.value as OrderStatus,
                          )
                        }
                        disabled={updatingId === o.id}
                      >
                        <option value="ABERTA">Aberta</option>
                        <option value="ANDAMENTO">Andamento</option>
                        <option value="FINALIZADA">Finalizada</option>
                      </select>

                      <button
                        className="button"
                        style={{ padding: "8px 14px", fontSize: 13 }}
                        onClick={() => startEdit(o)}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        className="button"
                        style={{ padding: "8px 14px", fontSize: 13 }}
                        onClick={() => handleGeneratePdf(o)}
                      >
                        📄 PDF
                      </button>
                      <button
                        className="button"
                        style={{ padding: "8px 14px", fontSize: 13 }}
                        onClick={() => openGoogleReminder(o)}
                      >
                        📅 Lembrete
                      </button>
                      <button
                        onClick={() => handleDelete(o.id)}
                        style={{
                          padding: "8px 14px",
                          fontSize: 13,
                          borderRadius: 8,
                          cursor: "pointer",
                          border: "1px solid rgba(248,113,113,0.3)",
                          background: "rgba(248,113,113,0.08)",
                          color: "#f87171",
                          minHeight: 44,
                        }}
                      >
                        🗑️ Excluir
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL EDITAR */}
      {editingOrder && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 style={{ marginTop: 0, marginBottom: 4 }}>Editar OS</h3>
            <p style={{ marginBottom: 20, fontSize: 12 }}>
              #{editingOrder.id.slice(0, 8)}
            </p>

            <div className="field">
              <span>Tipo</span>
              <select
                className="input"
                value={editTipo}
                onChange={(e) => setEditTipo(e.target.value as OrderTipo)}
              >
                <option value="INSTALACAO">Instalação</option>
                <option value="MANUTENCAO">Manutenção</option>
                <option value="LIMPEZA">Limpeza</option>
                <option value="RETIRADA">Retirada</option>
              </select>
            </div>

            <div className="field">
              <span>Data do serviço</span>
              <input
                type="date"
                className="input"
                value={editScheduledFor}
                onChange={(e) => setEditScheduledFor(e.target.value)}
              />
            </div>

            <div className="field">
              <span>Valor (R$)</span>
              <input
                className="input"
                inputMode="decimal"
                placeholder="0,00"
                value={editValor}
                onChange={(e) =>
                  setEditValor(e.target.value.replace(/[^0-9.,]/g, ""))
                }
              />
            </div>

            <div className="field">
              <span>Descrição</span>
              <textarea
                className="input"
                rows={3}
                value={editDescricao}
                onChange={(e) => setEditDescricao(e.target.value)}
              />
            </div>

            <div className="field" style={{ marginBottom: 20 }}>
              <span>Observações</span>
              <textarea
                className="input"
                rows={2}
                value={editObs}
                onChange={(e) => setEditObs(e.target.value)}
              />
            </div>

            <div
              style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}
            >
              <button
                onClick={() => setEditingOrder(null)}
                disabled={savingEdit}
                style={{
                  padding: "10px 16px",
                  borderRadius: 8,
                  cursor: "pointer",
                  minHeight: 44,
                  border: "1px solid var(--border)",
                  background: "var(--surface2)",
                  color: "var(--muted)",
                }}
              >
                Cancelar
              </button>
              <button
                className="button"
                onClick={handleSaveEdit}
                disabled={savingEdit}
              >
                {savingEdit ? "Salvando..." : "Salvar alterações"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
