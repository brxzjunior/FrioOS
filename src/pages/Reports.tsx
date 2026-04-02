import React, { useEffect, useMemo, useState } from "react";
import {
  getOrders,
  type Order,
  getRevenueByMonth,
  getMostUsedServices,
} from "../services/orderService";
import { getClients, type Client } from "../services/clientService";
import { generateOrderPdf } from "../utils/orderPdf";
import toast from "react-hot-toast";

type OrderStatusFilter = "ALL" | "ABERTA" | "ANDAMENTO" | "FINALIZADA";

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  ABERTA: { bg: "#fee2e2", color: "#b91c1c" },
  ANDAMENTO: { bg: "#fef9c3", color: "#92400e" },
  FINALIZADA: { bg: "#dcfce7", color: "#15803d" },
};

// ✅ helper padrão (ESSENCIAL)
function formatDateBR(date: string) {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

export default function Reports() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [revenue, setRevenue] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>("ALL");
  const [clientFilter, setClientFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    async function fetchData() {
      try {
        const [ordersRes, clientsRes, revenueRes, servicesRes] =
          await Promise.all([
            getOrders(),
            getClients(),
            getRevenueByMonth(),
            getMostUsedServices(),
          ]);
        setOrders(Array.isArray(ordersRes) ? ordersRes : []);
        setClients(clientsRes);
        setRevenue(Array.isArray(revenueRes) ? revenueRes : []);
        setServices(Array.isArray(servicesRes) ? servicesRes : []);
      } catch {
        toast.error("Erro ao carregar relatórios.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // ✅ FILTRO CORRIGIDO (SEM Date / SEM timezone)
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter !== "ALL" && order.status !== statusFilter) return false;
      if (clientFilter && order.clientId !== clientFilter) return false;

      if (!order.scheduledFor) return true;

      // comparação segura por string (YYYY-MM-DD)
      if (startDate && order.scheduledFor < startDate) return false;
      if (endDate && order.scheduledFor > endDate) return false;

      return true;
    });
  }, [orders, statusFilter, clientFilter, startDate, endDate]);

  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const paginatedOrders = filteredOrders.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  function handleClear() {
    setStatusFilter("ALL");
    setClientFilter("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  }

  function handleGeneratePdf(order: Order) {
    try {
      const client = clients.find((c) => c.id === order.clientId);
      generateOrderPdf(order, client);
      toast.success("PDF gerado.");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar PDF.");
    }
  }

  if (loading) return <div className="main">Carregando...</div>;

  return (
    <div className="main">
      <h1>Relatórios</h1>
      <p style={{ color: "#666", marginBottom: 20 }}>
        Filtre e visualize suas ordens
      </p>

      {/* FILTROS */}
      <div className="card" style={{ display: "grid", gap: 10 }}>
        <h3 style={{ margin: 0 }}>Filtros</h3>

        <select
          className="input"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatusFilter)}
        >
          <option value="ALL">Todos</option>
          <option value="ABERTA">Abertas</option>
          <option value="ANDAMENTO">Andamento</option>
          <option value="FINALIZADA">Finalizadas</option>
        </select>

        <select
          className="input"
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
        >
          <option value="">Todos os clientes</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>

        <input
          type="date"
          className="input"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          className="input"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />

        <button className="button" onClick={handleClear}>
          Limpar filtros
        </button>
      </div>

      {/* TABELA */}
      <div className="card">
        <h3 style={{ margin: "0 0 12px" }}>Resultados</h3>

        {paginatedOrders.length === 0 ? (
          <p>Nenhuma OS encontrada.</p>
        ) : (
          <div className="table-wrapper">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Cliente</th>
                  <th style={thStyle}>Tipo</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Valor</th>
                  <th style={thStyle}>Data</th>
                  <th style={thStyle}></th>
                </tr>
              </thead>

              <tbody>
                {paginatedOrders.map((o) => {
                  const client = clients.find((c) => c.id === o.clientId);
                  const sc = STATUS_COLORS[o.status] ?? {
                    bg: "#f3f4f6",
                    color: "#333",
                  };
                  return (
                    <tr key={o.id}>
                      <td style={tdStyle}>{o.id.slice(0, 6)}</td>
                      <td style={tdStyle}>{client?.nome ?? "-"}</td>
                      <td style={tdStyle}>{o.tipo}</td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            padding: "2px 8px",
                            borderRadius: 99,
                            fontSize: 11,
                            fontWeight: 600,
                            background: sc.bg,
                            color: sc.color,
                          }}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        {Number(o.valor).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </td>
                      <td style={tdStyle}>
                        {o.scheduledFor ? formatDateBR(o.scheduledFor) : "-"}
                      </td>
                      <td style={tdStyle}>
                        <button
                          className="button"
                          onClick={() => handleGeneratePdf(o)}
                        >
                          PDF
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "8px",
  textAlign: "left",
  fontSize: 12,
};

const tdStyle: React.CSSProperties = {
  padding: "10px",
  fontSize: 13,
};
