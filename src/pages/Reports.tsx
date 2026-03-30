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

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter !== "ALL" && order.status !== statusFilter) return false;

      if (clientFilter && order.clientId !== clientFilter) return false;

      const orderDate = order.scheduledFor
        ? new Date(order.scheduledFor).getTime()
        : 0;

      if (!orderDate) return true;

      if (startDate) {
        const start = new Date(startDate + "T00:00:00").getTime();
        if (orderDate < start) return false;
      }

      if (endDate) {
        const end = new Date(endDate + "T23:59:59").getTime();
        if (orderDate > end) return false;
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
                    <td>
                      {o.scheduledFor
                        ? new Date(o.scheduledFor).toLocaleDateString("pt-BR")
                        : "-"}
                    </td>
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
        <button onClick={() => setPage(Math.max(1, page - 1))}>Anterior</button>
        <span>
          Página {page} de {totalPages}
        </span>
        <button onClick={() => setPage(Math.min(totalPages, page + 1))}>
          Próxima
        </button>
      </div>

      {/* FATURAMENTO POR MÊS */}
      <div className="card">
        <h3>Faturamento por mês</h3>

        {revenue.length === 0 ? (
          <p>Sem dados de faturamento.</p>
        ) : (
          revenue.map((r: any) => {
            const [year, month] = r.mes.split("-");
            const label = new Date(
              Number(year),
              Number(month) - 1,
              1,
            ).toLocaleDateString("pt-BR", {
              month: "long",
              year: "numeric",
            });
            const valor = Number(r.total).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            });
            return (
              <div
                key={r.mes}
                style={{ padding: "6px 0", borderBottom: "1px solid #eee" }}
              >
                <span style={{ textTransform: "capitalize" }}>{label}</span>
                {" → "}
                <strong>{valor}</strong>
              </div>
            );
          })
        )}
      </div>

      {/* SERVIÇOS MAIS REALIZADOS */}
      <div className="card">
        <h3>Serviços mais realizados</h3>

        {services.length === 0 ? (
          <p>Sem dados de serviços.</p>
        ) : (
          services.map((s: any) => (
            <div
              key={s.tipo}
              style={{ padding: "6px 0", borderBottom: "1px solid #eee" }}
            >
              {s.tipo} → <strong>{s.total}</strong>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
