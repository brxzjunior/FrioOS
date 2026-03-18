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
  const [editScheduledFor, setEditScheduledFor] = useState(""); // yyyy-mm-dd
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
    } catch (err) {
      console.error("Erro ao carregar ordens/clientes:", err);
      toast.error("Erro ao carregar ordens de serviço.");
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
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      toast.error("Erro ao atualizar status.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta OS?")) return;

    try {
      await deleteOrder(id);
      setOrders((prev) => prev.filter((o) => o.id !== id));
      toast.success("OS excluída.");
    } catch (err) {
      console.error("Erro ao excluir OS:", err);
      toast.error("Erro ao excluir OS.");
    }
  }

  function formatBRL(value: number) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function handleGeneratePdf(order: Order) {
    try {
      const client = clientMap.get(order.clientId);
      generateOrderPdf(order, client);
      toast.success("PDF gerado.");
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      toast.error("Erro ao gerar PDF.");
    }
  }

  function startEdit(order: Order) {
    setEditingOrder(order);
    setEditDescricao(order.descricao);
    setEditValor(String(order.valor).replace(".", ","));
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
        descricao: editDescricao.trim(),
        valor: Number(editValor.replace(",", ".")),
        obs: editObs.trim() || null,
        scheduledFor: editScheduledFor || null,
      });

      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));

      toast.success("OS atualizada.");
      setEditingOrder(null);
    } catch (err) {
      console.error("Erro ao atualizar OS:", err);
      toast.error("Erro ao atualizar OS.");
    } finally {
      setSavingEdit(false);
    }
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
      ? new Date((order as any).scheduledFor as string)
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

  // 🔹 aplica filtro de status aqui, fora do JSX
  const visibleOrders =
    statusFilter === "ALL"
      ? orders
      : orders.filter((o) => o.status === statusFilter);

  return (
    <div style={{ padding: 20 }}>
      <h2>Ordens de Serviço</h2>

      <div style={{ marginBottom: 12 }}>
        <label>
          Status:{" "}
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as OrderStatus | "ALL")
            }
          >
            <option value="ALL">Todos</option>
            <option value="ABERTA">Abertas</option>
            <option value="ANDAMENTO">Em andamento</option>
            <option value="FINALIZADA">Finalizadas</option>
          </select>
        </label>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : visibleOrders.length === 0 ? (
        <p>Nenhuma OS cadastrada ainda.</p>
      ) : (
        visibleOrders.map((o) => {
          const client = clientMap.get(o.clientId);

          return (
            <div
              key={o.id}
              style={{
                border: "1px solid #ddd",
                padding: 12,
                marginBottom: 8,
                borderRadius: 8,
                display: "grid",
                gap: 6,
              }}
            >
              <div>
                <strong>{o.tipo}</strong>{" "}
                <span style={{ opacity: 0.7 }}>({o.status})</span>
              </div>

              <div>
                <strong>Cliente:</strong>{" "}
                {client?.nome ?? "Cliente não encontrado"}
              </div>

              <div>
                <strong>Descrição:</strong> {o.descricao}
              </div>

              {"obs" in o && (o as any).obs ? (
                <div>
                  <strong>Obs:</strong> {(o as any).obs}
                </div>
              ) : null}

              <div>
                <strong>Data do serviço:</strong>{" "}
                {(o as any).scheduledFor
                  ? new Date((o as any).scheduledFor).toLocaleDateString(
                      "pt-BR",
                    )
                  : "Não agendada"}
              </div>

              <div>
                <strong>Valor:</strong> {formatBRL(Number(o.valor))}
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                <label>
                  Status:{" "}
                  <select
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
                </label>

                <button type="button" onClick={() => handleGeneratePdf(o)}>
                  Gerar PDF
                </button>

                <button
                  type="button"
                  onClick={() => startEdit(o)}
                  style={{
                    padding: "0.25rem 0.5rem",
                    borderRadius: "0.375rem",
                    border: "1px solid #d1d5db",
                    backgroundColor: "#f3f4f6",
                    cursor: "pointer",
                  }}
                >
                  Editar
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(o.id)}
                  style={{
                    padding: "0.25rem 0.5rem",
                    borderRadius: "0.375rem",
                    border: "1px solid #ef4444",
                    backgroundColor: "#fee2e2",
                    color: "#b91c1c",
                    cursor: "pointer",
                  }}
                >
                  Excluir
                </button>

                <button
                  type="button"
                  onClick={() => openGoogleReminder(o)}
                  style={{
                    padding: "0.25rem 0.5rem",
                    borderRadius: "0.375rem",
                    border: "1px solid #3b82f6",
                    backgroundColor: "#eff6ff",
                    color: "#1d4ed8",
                    cursor: "pointer",
                  }}
                >
                  Lembrete Google
                </button>
              </div>
            </div>
          );
        })
      )}

      {editingOrder && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: 16,
              borderRadius: 8,
              maxWidth: 480,
              width: "100%",
              display: "grid",
              gap: 8,
            }}
          >
            <h3>Editar OS</h3>

            <label>
              Descrição
              <textarea
                value={editDescricao}
                onChange={(e) => setEditDescricao(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSaveEdit();
                  }
                }}
              />
            </label>

            <label>
              Data do serviço
              <input
                type="date"
                value={editScheduledFor}
                onChange={(e) => setEditScheduledFor(e.target.value)}
              />
            </label>

            <label>
              Observações
              <textarea
                value={editObs}
                onChange={(e) => setEditObs(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSaveEdit();
                  }
                }}
              />
            </label>

            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "flex-end",
                marginTop: 8,
              }}
            >
              <button
                type="button"
                onClick={() => setEditingOrder(null)}
                disabled={savingEdit}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={savingEdit}
              >
                {savingEdit ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
