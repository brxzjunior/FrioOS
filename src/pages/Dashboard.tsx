import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOrderStats, type OrderStats } from "../services/statsService.ts";

export default function Dashboard() {
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);
        const data = await getOrderStats();
        setStats(data);
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar estatísticas.");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "1.5rem" }}>
        <h2>Dashboard FrioOS</h2>
        <p>Carregando dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "1.5rem" }}>
        <h2>Dashboard FrioOS</h2>
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ padding: "1.5rem" }}>
        <h2>Dashboard FrioOS</h2>
        <p>Sem dados para exibir.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "1.5rem" }}>
      <h2 style={{ marginBottom: "1rem" }}>Dashboard FrioOS</h2>

      {/* Cards de estatísticas */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <Card title="Total de ordens" value={stats.total} />
        <Card title="Abertas" value={stats.abertas} />
        <Card title="Em andamento" value={stats.andamento} />
        <Card title="Finalizadas" value={stats.finalizadas} />
      </div>

      {/* Hub de navegação */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1rem",
        }}
      >
        <NavButton
          to="/orders"
          label="Ver ordens"
          description="Listar, editar, concluir e gerar PDF das OS."
        />
        <NavButton
          to="/new-order"
          label="Nova OS"
          description="Cadastrar uma nova ordem rapidamente."
        />
        <NavButton
          to="/clients"
          label="Clientes"
          description="Ver e cadastrar clientes."
        />
        <NavButton
          to="/reports"
          label="Relatórios"
          description="Filtrar ordens e gerar relatórios em PDF."
        />
      </div>
    </div>
  );
}

type CardProps = {
  title: string;
  value: number;
};

function Card({ title, value }: CardProps) {
  return (
    <div
      style={{
        borderRadius: "0.5rem",
        border: "1px solid #e5e7eb",
        padding: "1rem",
        backgroundColor: "#ffffff",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
      }}
    >
      <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>{title}</p>
      <p style={{ fontSize: "1.5rem", fontWeight: 600 }}>{value}</p>
    </div>
  );
}

function NavButton(props: { to: string; label: string; description: string }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(props.to)}
      style={{
        textAlign: "left",
        borderRadius: "0.75rem",
        border: "1px solid #e5e7eb",
        padding: "0.75rem 1rem",
        backgroundColor: "#f9fafb",
        cursor: "pointer",
        display: "grid",
        gap: 4,
      }}
    >
      <span style={{ fontWeight: 600 }}>{props.label}</span>
      <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>
        {props.description}
      </span>
    </button>
  );
}
