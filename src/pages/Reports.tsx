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
};

type OrderStatusFilter = "ALL" | "ABERTA" | "ANDAMENTO" | "FINALIZADA";

export default function Reports() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<ClientLite[]>([]);
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
        const [ordersRes, clientsRes] = await Promise.all([
          getOrders(),
          getClients(),
        ]);

        setOrders(Array.isArray(ordersRes) ? ordersRes : []);
        setClients(clientsRes as ClientLite[]);
      } catch {
        toast.error("Erro ao carregar relatórios.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter !== "ALL" && order.status !== statusFilter) return false;

      if (clientFilter && order.clientId !== clientFilter) return false;

      if (startDate) {
        if (new Date(order.createdAt) < new Date(startDate)) return false;
      }

      if (endDate) {
        if (new Date(order.createdAt) > new Date(endDate)) return false;
      }

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

  if (loading) {
    return <div className="main">Carregando...</div>;
  }

  return (
    <div className="main">
      <h1>Relatórios</h1>
      <p style={{ color: "#666", marginBottom: 20 }}>
        Filtre e visualize suas ordens
      </p>

      {/* FILTROS */}
      <div className="card" style={{ display: "grid", gap: 10 }}>
        <h3>Filtros</h3>

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
        <h3>Resultados</h3>

        {paginatedOrders.length === 0 ? (
          <p>Nenhuma OS encontrada.</p>
        ) : (
          <table style={{ width: "100%", marginTop: 10 }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Tipo</th>
                <th>Status</th>
                <th>Valor</th>
                <th>Data</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {paginatedOrders.map((o) => {
                const client = clients.find((c) => c.id === o.clientId);

                return (
                  <tr key={o.id}>
                    <td>{o.id.slice(0, 6)}</td>
                    <td>{client?.nome}</td>
                    <td>{o.tipo}</td>
                    <td>{o.status}</td>
                    <td>R$ {o.valor}</td>
                    <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td>
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
        )}
      </div>

      {/* PAGINAÇÃO */}
      <div style={{ marginTop: 15, display: "flex", gap: 10 }}>
        <button onClick={() => setPage(page - 1)}>Anterior</button>
        <span>
          Página {page} de {totalPages}
        </span>
        <button onClick={() => setPage(page + 1)}>Próxima</button>
      </div>
    </div>
  );
}

function handleGeneratePdf(order: Order) {
  try {
    generateOrderPdf(order);
    toast.success("PDF gerado.");
  } catch {
    toast.error("Erro ao gerar PDF.");
  }
}
