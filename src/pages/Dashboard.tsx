import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOrderStats, type OrderStats } from "../services/statsService.ts";
import {
  getRevenueByMonth,
  getMostUsedServices,
} from "../services/orderService";

export default function Dashboard() {
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revenue, setRevenue] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);

        const statsData = await getOrderStats();
        const revenueData = await getRevenueByMonth();
        const servicesData = await getMostUsedServices();

        setStats(statsData);
        setRevenue(revenueData);
        setServices(servicesData);
      } catch (err) {
        setError("Erro ao carregar estatísticas.");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return <div className="main">Carregando dashboard...</div>;
  }

  if (error) {
    return <div className="main">{error}</div>;
  }

  if (!stats) {
    return <div className="main">Sem dados.</div>;
  }

  return (
    <div className="main">
      <h1 style={{ marginBottom: 5 }}>Dashboard</h1>
      <p style={{ color: "#666", marginBottom: 20 }}>Visão geral do sistema</p>

      {/* STATS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 15,
          marginBottom: 20,
        }}
      >
        <StatCard title="Total" value={stats.total} />
        <StatCard title="Abertas" value={stats.abertas} />
        <StatCard title="Andamento" value={stats.andamento} />
        <StatCard title="Finalizadas" value={stats.finalizadas} />
      </div>

      {/* GRÁFICOS SIMPLES */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 15,
          marginBottom: 20,
        }}
      >
        <div className="card">
          <h3>Faturamento por mês</h3>

          {revenue.length === 0 ? (
            <p>Sem dados</p>
          ) : (
            revenue.map((r: any) => (
              <div key={r.mes}>
                {new Date(r.mes + "-01").toLocaleDateString("pt-BR", {
                  month: "long",
                  year: "numeric",
                })}{" "}
                → <strong>R$ {r.total}</strong>
              </div>
            ))
          )}
        </div>

        <div className="card">
          <h3>Serviços mais realizados</h3>

          {services.length === 0 ? (
            <p>Sem dados</p>
          ) : (
            services.map((s: any) => (
              <div key={s.tipo}>
                {s.tipo} → <strong>{s.total}</strong>
              </div>
            ))
          )}
        </div>
      </div>

      {/* NAVEGAÇÃO */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 15,
        }}
      >
        <NavCard to="/orders" title="Ordens" desc="Gerenciar OS" />
        <NavCard to="/new-order" title="Nova OS" desc="Criar ordem" />
        <NavCard to="/clients" title="Clientes" desc="Gerenciar clientes" />
        <NavCard to="/reports" title="Relatórios" desc="Ver relatórios" />
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="card">
      <p style={{ color: "#777", fontSize: 14 }}>{title}</p>
      <h2 style={{ margin: 0 }}>{value}</h2>
    </div>
  );
}

function NavCard({
  to,
  title,
  desc,
}: {
  to: string;
  title: string;
  desc: string;
}) {
  const navigate = useNavigate();

  return (
    <div
      className="card"
      style={{ cursor: "pointer" }}
      onClick={() => navigate(to)}
    >
      <h3>{title}</h3>
      <p style={{ color: "#666" }}>{desc}</p>
    </div>
  );
}
