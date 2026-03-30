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

export default function Orders() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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

  useEffect(() => {
    loadAll();
  }, []);

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

  function formatBRL(value: number) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
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
    const baseDate = order.scheduledFor
      ? new Date(order.scheduledFor)
      : new Date();
    const start = new Date(
      baseDate.getFullYear(),
      baseDate.getMonth(),
      baseDate.getDate(),
      8,
      0,
    );
    const end = new Date(
      baseDate.getFullYear(),
      baseDate.getMonth(),
      baseDate.getDate(),
      9,
      0,
    );
    const toGDate = (d: Date) =>
      d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${toGDate(start)}/${toGDate(end)}`;
    window.open(url, "_blank");
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
      toast.error("Preencha um valor válido.");
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

  return (
    <div className="main">
      <h1>Ordens de Serviço</h1>

      {/* FILTRO */}
      <div className="card">
        <label>Status</label>
        <select
          className="input"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as OrderStatus | "ALL")
          }
        >
          <option value="ALL">Todos</option>
          <option value="ABERTA">Abertas</option>
          <option value="ANDAMENTO">Andamento</option>
          <option value="FINALIZADA">Finalizadas</option>
        </select>
      </div>

      {/* LISTA */}
      {loading ? (
        <p>Carregando...</p>
      ) : visibleOrders.length === 0 ? (
        <p>Nenhuma OS encontrada.</p>
      ) : (
        visibleOrders.map((o) => {
          const client = clientMap.get(o.clientId);
          return (
            <div key={o.id} className="card">
              <h3 style={{ marginTop: 0 }}>
                {o.tipo} — {o.status}
              </h3>
              <p style={{ margin: "4px 0" }}>
                <strong>Cliente:</strong> {client?.nome}
              </p>
              <p style={{ margin: "4px 0" }}>
                <strong>Descrição:</strong> {o.descricao}
              </p>
              <p style={{ margin: "4px 0" }}>
                <strong>Data:</strong>{" "}
                {o.scheduledFor
                  ? new Date(o.scheduledFor).toLocaleDateString("pt-BR")
                  : "Não definida"}
              </p>
              <p style={{ margin: "4px 0 12px" }}>
                <strong>Valor:</strong> {formatBRL(o.valor)}
              </p>

              <div
                className="actions-row"
                style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
              >
                <select
                  className="input"
                  style={{ maxWidth: 160 }}
                  value={o.status}
                  onChange={(e) =>
                    handleStatusChange(o.id, e.target.value as OrderStatus)
                  }
                  disabled={updatingId === o.id}
                >
                  <option value="ABERTA">ABERTA</option>
                  <option value="ANDAMENTO">ANDAMENTO</option>
                  <option value="FINALIZADA">FINALIZADA</option>
                </select>
                <button className="button" onClick={() => startEdit(o)}>
                  Editar
                </button>
                <button className="button" onClick={() => handleGeneratePdf(o)}>
                  PDF
                </button>
                <button className="button" onClick={() => handleDelete(o.id)}>
                  Excluir
                </button>
                <button
                  className="button"
                  onClick={() => openGoogleReminder(o)}
                >
                  📅 Lembrete
                </button>
              </div>
            </div>
          );
        })
      )}

      {/* MODAL */}
      {editingOrder && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 style={{ marginTop: 0, marginBottom: 16 }}>Editar OS</h3>

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
                value={editValor}
                onChange={(e) =>
                  setEditValor(e.target.value.replace(/[^0-9.,]/g, ""))
                }
                placeholder="0,00"
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

            <div className="field" style={{ marginBottom: 16 }}>
              <span>Observações</span>
              <textarea
                className="input"
                rows={3}
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
                  border: "1px solid #ccc",
                  cursor: "pointer",
                  minHeight: 44,
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
