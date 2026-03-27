import React, { useEffect, useMemo, useState } from "react";
import {
  getOrders,
  type Order,
  getRevenueByMonth,
  getMostUsedServices,
} from "../services/orderService";
import { getClients } from "../services/clientService";
import { generateOrderPdf } from "../utils/orderPdf";
import toast from "react-hot-toast";

type ClientLite = {
  id: string;
  nome: string;
  telefone?: string;
  endereco?: string;
};

type OrderStatusFilter = "ALL" | "ABERTA" | "ANDAMENTO" | "FINALIZADA";

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

export default function Reports() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<ClientLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>("ALL");
  const [clientFilter, setClientFilter] = useState<string>("");

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [revenue, setRevenue] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const [ordersRes, clientsRes, revenueRes, servicesRes] =
          await Promise.all([
            getOrders(),
            getClients(),
            getRevenueByMonth(),
            getMostUsedServices(),
          ]);

        setOrders(Array.isArray(ordersRes) ? ordersRes : []);
        setClients(clientsRes as ClientLite[]);
        setRevenue(revenueRes || []);
        setServices(servicesRes || []);
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
        const orderDate = new Date(order.createdAt).getTime();
        const start = new Date(startDate + "T00:00:00").getTime();

        if (orderDate < start) return false;
      }

      if (endDate) {
        const orderDate = new Date(order.createdAt).getTime();
        const end = new Date(endDate + "T23:59:59").getTime();

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

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Cliente</th>
            <th style={thStyle}>Tipo</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Valor</th>
            <th style={thStyle}>Criada em</th>
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
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
