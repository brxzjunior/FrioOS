import { useEffect, useMemo, useState } from "react";
import { getClients, type Client } from "../services/clientService";
import {
  getOrders,
  updateOrderStatus,
  deleteOrder,
  updateOrder,
  type Order,
  type OrderStatus,
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
      `${order.descricao}\n\nObs: ${(order as any).obs ?? "-"}`,
    );

    const baseDate = (order as any).scheduledFor
      ? new Date((order as any).scheduledFor)
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

    const dates = `${toGDate(start)}/${toGDate(end)}`;

    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${dates}`;

    window.open(url, "_blank");
  }

  function startEdit(order: Order) {
    setEditingOrder(order);
    setEditDescricao(order.descricao);
    setEditValor(String(order.valor));
    setEditObs((order as any).obs ?? "");
    setEditScheduledFor(
      (order as any).scheduledFor
        ? (order as any).scheduledFor.slice(0, 10)
        : "",
    );
  }

  async function handleSaveEdit() {
    if (!editingOrder) return;

    try {
      setSavingEdit(true);

      const updated = await updateOrder(editingOrder.id, {
        descricao: editDescricao,
        valor: Number(editValor),
        obs: editObs,
        scheduledFor: editScheduledFor || null,
      });

      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));

      toast.success("Atualizado.");
      setEditingOrder(null);
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
              <h3>
                {o.tipo} — {o.status}
              </h3>

              <p>
                <strong>Cliente:</strong> {client?.nome}
              </p>
              <p>
                <strong>Descrição:</strong> {o.descricao}
              </p>

              <p>
                <strong>Data:</strong>{" "}
                {(o as any).scheduledFor
                  ? new Date((o as any).scheduledFor).toLocaleDateString()
                  : "Não definida"}
              </p>

              <p>
                <strong>Valor:</strong> {formatBRL(o.valor)}
              </p>

              {/* AÇÕES */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <select
                  className="input"
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
                  Lembrete Google
                </button>
              </div>
            </div>
          );
        })
      )}

      {/* MODAL */}
      {editingOrder && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div className="card" style={{ width: 400 }}>
            <h3>Editar OS</h3>

            <textarea
              className="input"
              value={editDescricao}
              onChange={(e) => setEditDescricao(e.target.value)}
            />

            <input
              type="date"
              className="input"
              value={editScheduledFor}
              onChange={(e) => setEditScheduledFor(e.target.value)}
            />

            <textarea
              className="input"
              value={editObs}
              onChange={(e) => setEditObs(e.target.value)}
            />

            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <button onClick={() => setEditingOrder(null)}>Cancelar</button>
              <button className="button" onClick={handleSaveEdit}>
                {savingEdit ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
