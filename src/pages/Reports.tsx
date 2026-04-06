import React, { useEffect, useMemo, useState } from "react";
import {
  getOrders,
  type Order,
  type OrderStatus,
  getRevenueByMonth,
  getMostUsedServices,
} from "../services/orderService";
import { getClients, type Client } from "../services/clientService";
import { generateOrderPdf } from "../utils/orderPdf";
import jsPDF from "jspdf";
import toast from "react-hot-toast";

// ── Tipos ─────────────────────────────────────────────────
type OrderStatusFilter = "ALL" | OrderStatus;

// ── Constantes ────────────────────────────────────────────
const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  ABERTA: {
    label: "Aberta",
    color: "#f87171",
    bg: "rgba(248,113,113,0.1)",
    border: "rgba(248,113,113,0.3)",
  },
  ANDAMENTO: {
    label: "Andamento",
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.1)",
    border: "rgba(251,191,36,0.3)",
  },
  FINALIZADA: {
    label: "Finalizada",
    color: "#2dd4bf",
    bg: "rgba(45,212,191,0.1)",
    border: "rgba(45,212,191,0.3)",
  },
};

const TIPO_LABELS: Record<string, string> = {
  INSTALACAO: "Instalação",
  MANUTENCAO: "Manutenção",
  LIMPEZA: "Limpeza",
  RETIRADA: "Retirada",
};

// ── Helpers ───────────────────────────────────────────────
function formatBRL(v: number) {
  return Number(v).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDateBR(s?: string | null) {
  if (!s) return "-";
  const [y, m, d] = s.split("-");
  return `${d}/${m}/${y}`;
}

function formatMonth(mes: string) {
  const [y, m] = mes.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("pt-BR", {
    month: "short",
    year: "2-digit",
  });
}

// ── Mini componentes ──────────────────────────────────────
function KpiCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <div
      className="card"
      style={{ marginBottom: 0, borderLeft: `3px solid ${color}` }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 11,
          color: "var(--muted)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </p>
      <h2 style={{ margin: "6px 0 2px", fontSize: 24, color }}>{value}</h2>
      {sub && <p style={{ margin: 0, fontSize: 12 }}>{sub}</p>}
    </div>
  );
}

function BarChart({
  data,
  maxVal,
  colorFn,
}: {
  data: { label: string; value: number; sub?: string }[];
  maxVal: number;
  colorFn: (i: number) => string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {data.map((d, i) => (
        <div key={d.label}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 12,
              marginBottom: 4,
            }}
          >
            <span
              style={{ color: "var(--muted)", textTransform: "capitalize" }}
            >
              {d.label}
            </span>
            <strong style={{ color: colorFn(i) }}>{d.sub ?? d.value}</strong>
          </div>
          <div
            style={{
              height: 7,
              background: "var(--surface2)",
              borderRadius: 99,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${maxVal > 0 ? (d.value / maxVal) * 100 : 0}%`,
                background: colorFn(i),
                borderRadius: 99,
                transition: "width 0.5s ease",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Página principal ──────────────────────────────────────
export default function Reports() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [revenue, setRevenue] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // filtros
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>("ALL");
  const [clientFilter, setClientFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // tab ativa
  const [tab, setTab] = useState<"tabela" | "resumo" | "graficos">("tabela");

  useEffect(() => {
    async function load() {
      try {
        const [o, c, r, s] = await Promise.all([
          getOrders(),
          getClients(),
          getRevenueByMonth(),
          getMostUsedServices(),
        ]);
        setOrders(Array.isArray(o) ? o : []);
        setClients(c);
        setRevenue(Array.isArray(r) ? r : []);
        setServices(Array.isArray(s) ? s : []);
      } catch {
        toast.error("Erro ao carregar relatórios.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const clientMap = useMemo(() => {
    const m = new Map<string, Client>();
    clients.forEach((c) => m.set(c.id, c));
    return m;
  }, [clients]);

  // ── Filtragem ────────────────────────────────────────────
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== "ALL" && o.status !== statusFilter) return false;
      if (clientFilter && o.clientId !== clientFilter) return false;
      const d = o.scheduledFor ?? "";
      if (startDate && d && d < startDate) return false;
      if (endDate && d && d > endDate) return false;
      return true;
    });
  }, [orders, statusFilter, clientFilter, startDate, endDate]);

  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const paginatedOrders = filteredOrders.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  // ── KPIs do filtro atual ──────────────────────────────────
  const kpis = useMemo(() => {
    const total = filteredOrders.length;
    const faturamento = filteredOrders
      .filter((o) => o.status === "FINALIZADA")
      .reduce((s, o) => s + Number(o.valor), 0);
    const abertas = filteredOrders.filter((o) => o.status === "ABERTA").length;
    const finalizadas = filteredOrders.filter(
      (o) => o.status === "FINALIZADA",
    ).length;
    const ticketMedio = finalizadas > 0 ? faturamento / finalizadas : 0;
    return { total, faturamento, abertas, finalizadas, ticketMedio };
  }, [filteredOrders]);

  function handleClear() {
    setStatusFilter("ALL");
    setClientFilter("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  }

  // ── Exportar CSV ──────────────────────────────────────────
  function exportCSV() {
    const header = [
      "ID",
      "Cliente",
      "Tipo",
      "Status",
      "Valor",
      "Data Serviço",
      "Criado em",
      "Descrição",
      "Observações",
    ];
    const rows = filteredOrders.map((o) => {
      const c = clientMap.get(o.clientId);
      return [
        o.id,
        c?.nome ?? "-",
        TIPO_LABELS[o.tipo] ?? o.tipo,
        o.status,
        Number(o.valor).toFixed(2).replace(".", ","),
        formatDateBR(o.scheduledFor),
        formatDateBR(o.createdAt),
        `"${(o.descricao ?? "").replace(/"/g, '""')}"`,
        `"${(o.obs ?? "").replace(/"/g, '""')}"`,
      ].join(";");
    });

    const csv = [header.join(";"), ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }); // BOM para Excel
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `FrioOS_Relatorio_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Planilha exportada.");
  }

  // ── Exportar PDF do relatório consolidado ─────────────────
  function exportRelatorioPDF() {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const W = 210;
    const ml = 14;
    const iW = W - ml * 2;
    const P = [0, 80, 160] as [number, number, number];
    const AC = [0, 160, 230] as [number, number, number];
    const WH = [255, 255, 255] as [number, number, number];
    const GR = [100, 100, 100] as [number, number, number];
    const DK = [30, 30, 30] as [number, number, number];
    const LT = [240, 245, 250] as [number, number, number];

    // header
    doc.setFillColor(...P);
    doc.rect(0, 0, W, 34, "F");
    doc.setFillColor(...AC);
    doc.rect(0, 34, W, 3, "F");

    doc.setTextColor(...WH);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("FrioOS — Relatório Consolidado", ml, 15);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, ml, 22);
    if (startDate || endDate)
      doc.text(
        `Período: ${startDate ? formatDateBR(startDate) : "início"} até ${endDate ? formatDateBR(endDate) : "hoje"}`,
        ml,
        28,
      );

    let y = 46;

    // KPIs
    doc.setFillColor(...LT);
    doc.roundedRect(ml, y, iW, 28, 2, 2, "F");

    const cols = [
      ml + 4,
      ml + iW / 4 + 4,
      ml + iW / 2 + 4,
      ml + (iW * 3) / 4 + 4,
    ];
    const kpiData = [
      { l: "Total OS", v: String(kpis.total) },
      { l: "Faturamento", v: formatBRL(kpis.faturamento) },
      { l: "Abertas", v: String(kpis.abertas) },
      { l: "Ticket Médio", v: formatBRL(kpis.ticketMedio) },
    ];

    kpiData.forEach((k, i) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(...GR);
      doc.text(k.l.toUpperCase(), cols[i], y + 8);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...P);
      doc.text(k.v, cols[i], y + 18);
    });

    y += 36;

    // faturamento por mês
    if (revenue.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...P);
      doc.text("FATURAMENTO POR MÊS", ml, y);
      y += 4;

      const maxR = Math.max(...revenue.map((r) => Number(r.total)));
      const barW = iW / Math.min(revenue.length, 8);
      const barMaxH = 20;

      [...revenue]
        .reverse()
        .slice(0, 8)
        .forEach((r, i) => {
          const h = maxR > 0 ? (Number(r.total) / maxR) * barMaxH : 1;
          const bx = ml + i * barW + 2;
          doc.setFillColor(...AC);
          doc.rect(bx, y + barMaxH - h, barW - 4, h, "F");
          doc.setFontSize(6);
          doc.setTextColor(...GR);
          doc.text(formatMonth(r.mes), bx + (barW - 4) / 2, y + barMaxH + 4, {
            align: "center",
          });
        });

      y += barMaxH + 10;
    }

    // tabela de OS
    y += 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...P);
    doc.text("ORDENS DE SERVIÇO", ml, y);
    y += 5;

    // cabeçalho tabela
    doc.setFillColor(...P);
    doc.rect(ml, y, iW, 6, "F");
    doc.setTextColor(...WH);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    const cols2 = [
      ml + 1,
      ml + 14,
      ml + 50,
      ml + 82,
      ml + 110,
      ml + 135,
      ml + 158,
    ];
    const headers = [
      "ID",
      "Cliente",
      "Tipo",
      "Status",
      "Valor",
      "Data",
      "Criado",
    ];
    headers.forEach((h, i) => doc.text(h, cols2[i], y + 4));
    y += 7;

    filteredOrders.slice(0, 40).forEach((o, idx) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      const bg =
        idx % 2 === 0 ? LT : ([255, 255, 255] as [number, number, number]);
      doc.setFillColor(...bg);
      doc.rect(ml, y - 1, iW, 6, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(...DK);
      const cl = clientMap.get(o.clientId);
      const row = [
        o.id.slice(0, 6),
        (cl?.nome ?? "-").slice(0, 18),
        (TIPO_LABELS[o.tipo] ?? o.tipo).slice(0, 12),
        o.status,
        formatBRL(Number(o.valor)),
        formatDateBR(o.scheduledFor),
        formatDateBR(o.createdAt),
      ];
      row.forEach((v, i) => doc.text(v, cols2[i], y + 3));
      y += 6;
    });

    if (filteredOrders.length > 40) {
      doc.setFontSize(7);
      doc.setTextColor(...GR);
      doc.text(
        `... e mais ${filteredOrders.length - 40} registros. Exporte o CSV para ver todos.`,
        ml,
        y + 4,
      );
    }

    // rodapé
    doc.setFillColor(...P);
    doc.rect(0, 285, W, 12, "F");
    doc.setTextColor(...WH);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text("FrioOS • Relatório gerado automaticamente", W / 2, 292, {
      align: "center",
    });

    doc.save(`FrioOS_Relatorio_${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success("PDF do relatório exportado.");
  }

  if (loading) return <div className="main">Carregando...</div>;

  const revenueChartData = [...revenue]
    .reverse()
    .slice(-6)
    .map((r) => ({
      label: formatMonth(r.mes),
      value: Number(r.total),
      sub: formatBRL(r.total),
    }));
  const maxRevenue = Math.max(...revenueChartData.map((d) => d.value), 1);

  const servicesChartData = services.map((s) => ({
    label: TIPO_LABELS[s.tipo] ?? s.tipo,
    value: Number(s.total),
  }));
  const maxServices = Math.max(...servicesChartData.map((d) => d.value), 1);
  const COLORS = ["#2dd4bf", "#60a5fa", "#fbbf24", "#f87171"];

  return (
    <div className="main">
      {/* CABEÇALHO */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Relatórios</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13 }}>
            {filteredOrders.length} OS no período selecionado
          </p>
        </div>

        {/* botões de exportação */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={exportCSV}
            style={{
              padding: "9px 16px",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 13,
              border: "1px solid rgba(96,165,250,0.35)",
              background: "rgba(96,165,250,0.08)",
              color: "#60a5fa",
              minHeight: 40,
              fontWeight: 500,
            }}
          >
            📊 Exportar CSV
          </button>
          <button
            onClick={exportRelatorioPDF}
            style={{
              padding: "9px 16px",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 13,
              border: "1px solid rgba(45,212,191,0.35)",
              background: "rgba(45,212,191,0.08)",
              color: "var(--accent)",
              minHeight: 40,
              fontWeight: 500,
            }}
          >
            📄 Exportar PDF
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 10,
          marginBottom: 20,
        }}
      >
        <KpiCard
          label="Total OS"
          value={String(kpis.total)}
          color="var(--accent)"
        />
        <KpiCard
          label="Faturamento"
          value={formatBRL(kpis.faturamento)}
          color="var(--accent2)"
          sub="OS finalizadas"
        />
        <KpiCard
          label="Em Aberto"
          value={String(kpis.abertas)}
          color="var(--danger)"
        />
        <KpiCard
          label="Ticket Médio"
          value={formatBRL(kpis.ticketMedio)}
          color="var(--warn)"
        />
      </div>

      {/* FILTROS */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <h3 style={{ margin: 0, fontSize: 14 }}>🔍 Filtros</h3>
          <button
            onClick={handleClear}
            style={{
              fontSize: 12,
              color: "var(--muted)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            Limpar tudo
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
            gap: 10,
          }}
        >
          {/* status pills */}
          <div>
            <span
              style={{
                fontSize: 11,
                color: "var(--muted)",
                display: "block",
                marginBottom: 6,
              }}
            >
              STATUS
            </span>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {(["ALL", "ABERTA", "ANDAMENTO", "FINALIZADA"] as const).map(
                (f) => {
                  const active = statusFilter === f;
                  const sc = f !== "ALL" ? STATUS_CONFIG[f] : null;
                  return (
                    <button
                      key={f}
                      onClick={() => {
                        setStatusFilter(f);
                        setPage(1);
                      }}
                      style={{
                        padding: "4px 10px",
                        borderRadius: 99,
                        fontSize: 12,
                        cursor: "pointer",
                        border: active
                          ? `1px solid ${sc?.border ?? "var(--accent)"}`
                          : "1px solid var(--border)",
                        background: active
                          ? (sc?.bg ?? "rgba(45,212,191,0.1)")
                          : "var(--surface2)",
                        color: active
                          ? (sc?.color ?? "var(--accent)")
                          : "var(--muted)",
                      }}
                    >
                      {f === "ALL" ? "Todas" : STATUS_CONFIG[f].label}
                    </button>
                  );
                },
              )}
            </div>
          </div>

          {/* cliente */}
          <div className="field" style={{ marginBottom: 0 }}>
            <span>CLIENTE</span>
            <select
              className="input"
              style={{ marginTop: 4 }}
              value={clientFilter}
              onChange={(e) => {
                setClientFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Todos os clientes</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>

          {/* datas */}
          <div className="field" style={{ marginBottom: 0 }}>
            <span>DATA INICIAL</span>
            <input
              type="date"
              className="input"
              style={{ marginTop: 4 }}
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <span>DATA FINAL</span>
            <input
              type="date"
              className="input"
              style={{ marginTop: 4 }}
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* TABS */}
      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 16,
          borderBottom: "1px solid var(--border)",
          paddingBottom: 0,
        }}
      >
        {(
          [
            { key: "tabela", label: "📋 Tabela" },
            { key: "graficos", label: "📊 Gráficos" },
            { key: "resumo", label: "📝 Resumo" },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: "8px 16px",
              borderRadius: "8px 8px 0 0",
              fontSize: 13,
              cursor: "pointer",
              border: "1px solid var(--border)",
              borderBottom:
                tab === t.key
                  ? "1px solid var(--bg)"
                  : "1px solid var(--border)",
              background: tab === t.key ? "var(--surface)" : "var(--surface2)",
              color: tab === t.key ? "var(--accent)" : "var(--muted)",
              fontWeight: tab === t.key ? 600 : 400,
              marginBottom: -1,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB: TABELA ─────────────────────────────────── */}
      {tab === "tabela" && (
        <>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            {filteredOrders.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center" }}>
                <p style={{ fontSize: 32, margin: "0 0 8px" }}>📋</p>
                <p style={{ margin: 0 }}>
                  Nenhuma OS encontrada para os filtros selecionados.
                </p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    minWidth: 620,
                  }}
                >
                  <thead>
                    <tr style={{ background: "var(--surface2)" }}>
                      {[
                        "ID",
                        "Cliente",
                        "Tipo",
                        "Status",
                        "Valor",
                        "Data",
                        "PDF",
                      ].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "10px 12px",
                            fontSize: 11,
                            color: "var(--muted)",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            textAlign: "left",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedOrders.map((o, i) => {
                      const cl = clientMap.get(o.clientId);
                      const sc = STATUS_CONFIG[o.status];
                      return (
                        <tr
                          key={o.id}
                          style={{
                            borderTop: "1px solid var(--border)",
                            transition: "background 0.1s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              "var(--surface2)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                          }
                        >
                          <td
                            style={{
                              padding: "10px 12px",
                              fontSize: 12,
                              color: "var(--muted)",
                              fontFamily: "monospace",
                            }}
                          >
                            {o.id.slice(0, 7)}
                          </td>
                          <td
                            style={{
                              padding: "10px 12px",
                              fontSize: 13,
                              color: "var(--text)",
                              maxWidth: 140,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {cl?.nome ?? "-"}
                          </td>
                          <td
                            style={{
                              padding: "10px 12px",
                              fontSize: 13,
                              color: "var(--text)",
                            }}
                          >
                            {TIPO_LABELS[o.tipo] ?? o.tipo}
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            <span
                              style={{
                                padding: "3px 9px",
                                borderRadius: 99,
                                fontSize: 11,
                                fontWeight: 600,
                                whiteSpace: "nowrap",
                                background: sc.bg,
                                color: sc.color,
                                border: `1px solid ${sc.border}`,
                              }}
                            >
                              {sc.label}
                            </span>
                          </td>
                          <td
                            style={{
                              padding: "10px 12px",
                              fontSize: 13,
                              color: "var(--accent2)",
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {formatBRL(Number(o.valor))}
                          </td>
                          <td
                            style={{
                              padding: "10px 12px",
                              fontSize: 13,
                              color: "var(--muted)",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {formatDateBR(o.scheduledFor)}
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            <button
                              onClick={() => {
                                const c = clientMap.get(o.clientId);
                                generateOrderPdf(o, c);
                                toast.success("PDF gerado.");
                              }}
                              style={{
                                padding: "5px 10px",
                                borderRadius: 6,
                                cursor: "pointer",
                                fontSize: 11,
                                border: "1px solid rgba(45,212,191,0.3)",
                                background: "rgba(45,212,191,0.07)",
                                color: "var(--accent)",
                                minHeight: 30,
                              }}
                            >
                              📄 PDF
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

          {/* paginação */}
          {totalPages > 1 && (
            <div className="pagination" style={{ marginTop: 12 }}>
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                ← Anterior
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => Math.abs(p - page) <= 2)
                .map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      cursor: "pointer",
                      minHeight: 36,
                      border:
                        p === page
                          ? "1px solid var(--accent)"
                          : "1px solid var(--border)",
                      background:
                        p === page ? "rgba(45,212,191,0.1)" : "var(--surface2)",
                      color: p === page ? "var(--accent)" : "var(--muted)",
                      fontWeight: p === page ? 700 : 400,
                    }}
                  >
                    {p}
                  </button>
                ))}
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                Próxima →
              </button>
            </div>
          )}
        </>
      )}

      {/* ── TAB: GRÁFICOS ────────────────────────────────── */}
      {tab === "graficos" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 14,
          }}
        >
          {/* faturamento mensal */}
          <div className="card" style={{ marginBottom: 0 }}>
            <h3 style={{ margin: "0 0 4px", fontSize: 14 }}>
              Faturamento por Mês
            </h3>
            <p style={{ margin: "0 0 16px", fontSize: 12 }}>
              Últimos 6 meses (OS finalizadas)
            </p>
            {revenueChartData.length === 0 ? (
              <p>Sem dados.</p>
            ) : (
              <BarChart
                data={revenueChartData}
                maxVal={maxRevenue}
                colorFn={() => "var(--accent)"}
              />
            )}
          </div>

          {/* serviços */}
          <div className="card" style={{ marginBottom: 0 }}>
            <h3 style={{ margin: "0 0 4px", fontSize: 14 }}>
              Serviços Realizados
            </h3>
            <p style={{ margin: "0 0 16px", fontSize: 12 }}>
              Por tipo de atendimento
            </p>
            {servicesChartData.length === 0 ? (
              <p>Sem dados.</p>
            ) : (
              <BarChart
                data={servicesChartData}
                maxVal={maxServices}
                colorFn={(i) => COLORS[i % COLORS.length]}
              />
            )}
          </div>

          {/* status donut */}
          <div className="card" style={{ marginBottom: 0 }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 14 }}>
              Distribuição de Status
            </h3>
            {(() => {
              const segs = [
                { label: "Abertas", value: kpis.abertas, color: "#f87171" },
                {
                  label: "Andamento",
                  value: filteredOrders.filter((o) => o.status === "ANDAMENTO")
                    .length,
                  color: "#fbbf24",
                },
                {
                  label: "Finalizadas",
                  value: kpis.finalizadas,
                  color: "#2dd4bf",
                },
              ];
              const tot = segs.reduce((s, x) => s + x.value, 0) || 1;
              const r = 52,
                cx = 68,
                cy = 68,
                sw = 18;
              let cum = 0;
              const slices = segs.map((s) => {
                const pct = s.value / tot;
                const a1 = cum * 2 * Math.PI - Math.PI / 2;
                cum += pct;
                const a2 = cum * 2 * Math.PI - Math.PI / 2;
                const x1 = cx + r * Math.cos(a1),
                  y1 = cy + r * Math.sin(a1);
                const x2 = cx + r * Math.cos(a2),
                  y2 = cy + r * Math.sin(a2);
                return {
                  ...s,
                  pct,
                  d: `M ${x1} ${y1} A ${r} ${r} 0 ${pct > 0.5 ? 1 : 0} 1 ${x2} ${y2}`,
                };
              });
              return (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 20,
                    flexWrap: "wrap",
                  }}
                >
                  <svg width={136} height={136} viewBox="0 0 136 136">
                    <circle
                      cx={cx}
                      cy={cy}
                      r={r}
                      fill="none"
                      stroke="var(--border)"
                      strokeWidth={sw}
                    />
                    {slices.map(
                      (s, i) =>
                        s.pct > 0.005 && (
                          <path
                            key={i}
                            d={s.d}
                            fill="none"
                            stroke={s.color}
                            strokeWidth={sw}
                          />
                        ),
                    )}
                    <text
                      x={cx}
                      y={cy - 7}
                      textAnchor="middle"
                      fontSize={10}
                      fill="var(--muted)"
                    >
                      Total
                    </text>
                    <text
                      x={cx}
                      y={cy + 10}
                      textAnchor="middle"
                      fontSize={22}
                      fontWeight="700"
                      fill="var(--text)"
                    >
                      {kpis.total}
                    </text>
                  </svg>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {segs.map((s) => (
                      <div
                        key={s.label}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: s.color,
                          }}
                        />
                        <span
                          style={{
                            fontSize: 13,
                            color: "var(--muted)",
                            flex: 1,
                          }}
                        >
                          {s.label}
                        </span>
                        <strong style={{ color: s.color }}>{s.value}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* top clientes */}
          <div className="card" style={{ marginBottom: 0 }}>
            <h3 style={{ margin: "0 0 4px", fontSize: 14 }}>Top Clientes</h3>
            <p style={{ margin: "0 0 16px", fontSize: 12 }}>
              Por quantidade de OS
            </p>
            {(() => {
              const count = new Map<string, number>();
              filteredOrders.forEach((o) =>
                count.set(o.clientId, (count.get(o.clientId) ?? 0) + 1),
              );
              const top = [...count.entries()]
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([id, v]) => ({
                  label: clientMap.get(id)?.nome ?? "—",
                  value: v,
                }));
              const maxTop = Math.max(...top.map((t) => t.value), 1);
              return top.length === 0 ? (
                <p>Sem dados.</p>
              ) : (
                <BarChart
                  data={top}
                  maxVal={maxTop}
                  colorFn={(i) => COLORS[i % COLORS.length]}
                />
              );
            })()}
          </div>
        </div>
      )}

      {/* ── TAB: RESUMO ──────────────────────────────────── */}
      {tab === "resumo" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* resumo financeiro */}
          <div className="card" style={{ marginBottom: 0 }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 14 }}>
              💰 Resumo Financeiro
            </h3>
            {[
              {
                l: "Faturamento total (finalizadas)",
                v: formatBRL(kpis.faturamento),
                color: "var(--accent2)",
              },
              {
                l: "Ticket médio por OS",
                v: formatBRL(kpis.ticketMedio),
                color: "var(--accent)",
              },
              {
                l: "Valor em aberto (abertas + andamento)",
                v: formatBRL(
                  filteredOrders
                    .filter((o) => o.status !== "FINALIZADA")
                    .reduce((s, o) => s + Number(o.valor), 0),
                ),
                color: "var(--warn)",
              },
            ].map((row) => (
              <div
                key={row.l}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 0",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <span style={{ fontSize: 13, color: "var(--muted)" }}>
                  {row.l}
                </span>
                <strong style={{ color: row.color }}>{row.v}</strong>
              </div>
            ))}
          </div>

          {/* resumo por status */}
          <div className="card" style={{ marginBottom: 0 }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 14 }}>
              📋 OS por Status
            </h3>
            {(["ABERTA", "ANDAMENTO", "FINALIZADA"] as const).map((s) => {
              const cnt = filteredOrders.filter((o) => o.status === s).length;
              const pct =
                kpis.total > 0 ? Math.round((cnt / kpis.total) * 100) : 0;
              const sc = STATUS_CONFIG[s];
              return (
                <div
                  key={s}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "8px 0",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <span
                    style={{
                      padding: "2px 10px",
                      borderRadius: 99,
                      fontSize: 11,
                      fontWeight: 600,
                      background: sc.bg,
                      color: sc.color,
                      border: `1px solid ${sc.border}`,
                      flexShrink: 0,
                    }}
                  >
                    {sc.label}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 6,
                      background: "var(--surface2)",
                      borderRadius: 99,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: sc.color,
                        borderRadius: 99,
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: 13,
                      color: "var(--text)",
                      width: 40,
                      textAlign: "right",
                    }}
                  >
                    {cnt}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--muted)",
                      width: 36,
                      textAlign: "right",
                    }}
                  >
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>

          {/* resumo por tipo */}
          <div className="card" style={{ marginBottom: 0 }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 14 }}>🔧 OS por Tipo</h3>
            {Object.keys(TIPO_LABELS).map((tipo, i) => {
              const cnt = filteredOrders.filter((o) => o.tipo === tipo).length;
              const val = filteredOrders
                .filter((o) => o.tipo === tipo && o.status === "FINALIZADA")
                .reduce((s, o) => s + Number(o.valor), 0);
              const pct =
                kpis.total > 0 ? Math.round((cnt / kpis.total) * 100) : 0;
              return (
                <div
                  key={tipo}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "8px 0",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      color: "var(--text)",
                      width: 90,
                      flexShrink: 0,
                    }}
                  >
                    {TIPO_LABELS[tipo]}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 6,
                      background: "var(--surface2)",
                      borderRadius: 99,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: COLORS[i % COLORS.length],
                        borderRadius: 99,
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: 13,
                      color: "var(--text)",
                      width: 24,
                      textAlign: "right",
                    }}
                  >
                    {cnt}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--accent2)",
                      width: 80,
                      textAlign: "right",
                    }}
                  >
                    {formatBRL(val)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
