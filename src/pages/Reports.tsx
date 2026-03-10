import { useEffect, useMemo, useState } from "react";
import { getOrders, type Order } from "../services/orderService.ts";
import { getClients } from "../services/clientService.ts";
import { generateOrderPdf } from "../utils/orderPdf";
import toast from "react-hot-toast";

type ClientLite = {
  id: string;
  nome: string;
  telefone?: string;
  endereco?: string;
};

type OrderStatusFilter = "ALL" | "ABERTA" | "ANDAMENTO" | "FINALIZADA";

export default function Reports() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<ClientLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>("ALL");
  const [clientFilter, setClientFilter] = useState<string>("");

  const [startDate, setStartDate] = useState<string>(""); // yyyy-mm-dd
  const [endDate, setEndDate] = useState<string>("");

  // Paginação em memória
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const [ordersRes, clientsRes] = await Promise.all([
          getOrders(),
          getClients(),
        ]);

        setOrders(Array.isArray(ordersRes) ? ordersRes : []);
        setClients(clientsRes as ClientLite[]);
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar relatórios.");
        toast.error("Erro ao carregar relatórios.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter !== "ALL" && order.status !== statusFilter) {
        return false;
      }

      if (clientFilter && order.clientId !== clientFilter) {
        return false;
      }

      if (startDate) {
        const orderDate = new Date(order.createdAt);
        const start = new Date(startDate + "T00:00:00");
        if (orderDate < start) return false;
      }

      if (endDate) {
        const orderDate = new Date(order.createdAt);
        const end = new Date(endDate + "T23:59:59");
        if (orderDate > end) return false;
      }

      return true;
    });
  }, [orders, statusFilter, clientFilter, startDate, endDate]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));

  const paginatedOrders = useMemo(() => {
    const startIdx = (page - 1) * pageSize;
    return filteredOrders.slice(startIdx, startIdx + pageSize);
  }, [filteredOrders, page]);

  function handleGeneratePdf(order: Order) {
    try {
      const client = clients.find((c) => c.id === order.clientId);
      generateOrderPdf(order, client as any);
      toast.success("PDF gerado com sucesso.");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao gerar PDF.");
    }
  }

  function handleChangePage(newPage: number) {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  }

  function handleClearFilters() {
    setStatusFilter("ALL");
    setClientFilter("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  }

  if (loading) {
    return (
      <div style={{ padding: "1.5rem" }}>
        <h2>Relatórios</h2>
        <p>Carregando dados...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "1.5rem" }}>
        <h2>Relatórios</h2>
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div style={{ padding: "1.5rem" }}>
        <h2>Relatórios</h2>
        <p>Nenhuma ordem encontrada.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "1.5rem" }}>
      <h2 style={{ marginBottom: "1rem" }}>Relatórios</h2>

      {/* Filtros */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          marginBottom: "1rem",
          alignItems: "flex-end",
        }}
      >
        <div>
          <label
            htmlFor="statusFilter"
            style={{ display: "block", fontSize: "0.75rem", marginBottom: 4 }}
          >
            Status
          </label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as OrderStatusFilter)
            }
            style={{
              padding: "0.25rem 0.5rem",
              fontSize: "0.875rem",
              borderRadius: "0.375rem",
              border: "1px solid #d1d5db",
            }}
          >
            <option value="ALL">Todos</option>
            <option value="ABERTA">Abertas</option>
            <option value="ANDAMENTO">Em andamento</option>
            <option value="FINALIZADA">Finalizadas</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="clientFilter"
            style={{ display: "block", fontSize: "0.75rem", marginBottom: 4 }}
          >
            Cliente
          </label>
          <select
            id="clientFilter"
            value={clientFilter}
            onChange={(e) => {
              setClientFilter(e.target.value);
              setPage(1);
            }}
            style={{
              minWidth: 180,
              padding: "0.25rem 0.5rem",
              fontSize: "0.875rem",
              borderRadius: "0.375rem",
              border: "1px solid #d1d5db",
            }}
          >
            <option value="">Todos</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="startDate"
            style={{ display: "block", fontSize: "0.75rem", marginBottom: 4 }}
          >
            Data inicial
          </label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            style={{
              padding: "0.25rem 0.5rem",
              fontSize: "0.875rem",
              borderRadius: "0.375rem",
              border: "1px solid #d1d5db",
            }}
          />
        </div>

        <div>
          <label
            htmlFor="endDate"
            style={{ display: "block", fontSize: "0.75rem", marginBottom: 4 }}
          >
            Data final
          </label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            style={{
              padding: "0.25rem 0.5rem",
              fontSize: "0.875rem",
              borderRadius: "0.375rem",
              border: "1px solid #d1d5db",
            }}
          />
        </div>

        <button
          type="button"
          onClick={handleClearFilters}
          style={{
            padding: "0.35rem 0.75rem",
            fontSize: "0.75rem",
            borderRadius: "0.375rem",
            border: "1px solid #9ca3af",
            backgroundColor: "#f3f4f6",
            cursor: "pointer",
          }}
        >
          Limpar filtros
        </button>
      </div>

      {/* Tabela */}
      {paginatedOrders.length === 0 ? (
        <p>Nenhuma ordem encontrada com os filtros selecionados.</p>
      ) : (
        <>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.875rem",
            }}
          >
            <thead>
              <tr>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Cliente</th>
                <th style={thStyle}>Tipo</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Valor</th>
                <th style={thStyle}>Criada em</th>
                <th style={thStyle}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order) => {
                const client = clients.find((c) => c.id === order.clientId);

                return (
                  <tr key={order.id}>
                    <td style={tdStyle}>{order.id.slice(0, 8)}</td>
                    <td style={tdStyle}>{client?.nome ?? "—"}</td>
                    <td style={tdStyle}>{order.tipo}</td>
                    <td style={tdStyle}>{order.status}</td>
                    <td style={tdStyle}>
                      R$ {Number(order.valor).toFixed(2).replace(".", ",")}
                    </td>
                    <td style={tdStyle}>
                      {new Date(order.createdAt).toLocaleString("pt-BR")}
                    </td>
                    <td style={tdStyle}>
                      <button
                        type="button"
                        onClick={() => handleGeneratePdf(order)}
                        style={{
                          padding: "0.25rem 0.5rem",
                          fontSize: "0.75rem",
                          borderRadius: "0.375rem",
                          border: "1px solid #d1d5db",
                          backgroundColor: "#f9fafb",
                          cursor: "pointer",
                        }}
                      >
                        Gerar PDF
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Paginação */}
          <div
            style={{
              marginTop: "0.75rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.875rem",
            }}
          >
            <span>
              Página {page} de {totalPages} ({filteredOrders.length} ordens
              filtradas)
            </span>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                type="button"
                onClick={() => handleChangePage(page - 1)}
                disabled={page === 1}
                style={{
                  padding: "0.25rem 0.5rem",
                  borderRadius: "0.375rem",
                  border: "1px solid #d1d5db",
                  backgroundColor: page === 1 ? "#e5e7eb" : "#f9fafb",
                  cursor: page === 1 ? "not-allowed" : "pointer",
                }}
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={() => handleChangePage(page + 1)}
                disabled={page === totalPages}
                style={{
                  padding: "0.25rem 0.5rem",
                  borderRadius: "0.375rem",
                  border: "1px solid #d1d5db",
                  backgroundColor: page === totalPages ? "#e5e7eb" : "#f9fafb",
                  cursor: page === totalPages ? "not-allowed" : "pointer",
                }}
              >
                Próxima
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "0.5rem",
  borderBottom: "1px solid #e5e7eb",
  backgroundColor: "#f9fafb",
};

const tdStyle: React.CSSProperties = {
  padding: "0.5rem",
  borderBottom: "1px solid #e5e7eb",
};
