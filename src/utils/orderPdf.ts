import jsPDF from "jspdf";
import type { Order } from "../services/orderService";
import type { Client } from "../services/clientService";

const BRAND = "FrioOS";
const PRIMARY = [0, 80, 160] as [number, number, number]; // azul escuro
const ACCENT = [0, 160, 230] as [number, number, number]; // azul claro
const DARK = [30, 30, 30] as [number, number, number];
const GRAY = [100, 100, 100] as [number, number, number];
const LIGHT = [240, 245, 250] as [number, number, number];
const WHITE = [255, 255, 255] as [number, number, number];
const GREEN = [30, 160, 100] as [number, number, number];
const YELLOW = [200, 140, 0] as [number, number, number];
const RED = [200, 50, 50] as [number, number, number];

function statusColor(status: string): [number, number, number] {
  if (status === "FINALIZADA") return GREEN;
  if (status === "ANDAMENTO") return YELLOW;
  return RED;
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    ABERTA: "Aberta",
    ANDAMENTO: "Em Andamento",
    FINALIZADA: "Finalizada",
  };
  return map[status] ?? status;
}

function tipoLabel(tipo: string): string {
  const map: Record<string, string> = {
    INSTALACAO: "Instalação",
    MANUTENCAO: "Manutenção",
    LIMPEZA: "Limpeza",
    RETIRADA: "Retirada",
  };
  return map[tipo] ?? tipo;
}

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("pt-BR");
}

function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleString("pt-BR");
}

export function generateOrderPdf(order: Order, client?: Client) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  const margin = 14;
  const innerW = W - margin * 2;

  // ─── CABEÇALHO ────────────────────────────────────────────────
  // fundo azul escuro
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, W, 38, "F");

  // nome da empresa
  doc.setTextColor(...WHITE);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(BRAND, margin, 17);

  // subtítulo
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Ordem de Serviço", margin, 24);

  // ID da OS (canto direito)
  doc.setFontSize(8);
  doc.setTextColor(...ACCENT);
  doc.text(`Nº ${order.id.toUpperCase()}`, W - margin, 17, { align: "right" });

  // data de emissão (canto direito)
  doc.setTextColor(...WHITE);
  doc.text(
    `Emitido em: ${new Date().toLocaleString("pt-BR")}`,
    W - margin,
    24,
    { align: "right" },
  );

  // faixa azul claro de destaque
  doc.setFillColor(...ACCENT);
  doc.rect(0, 38, W, 4, "F");

  let y = 52;

  // ─── SEÇÃO CLIENTE ────────────────────────────────────────────
  // fundo cinza claro
  doc.setFillColor(...LIGHT);
  doc.roundedRect(margin, y - 6, innerW, 36, 2, 2, "F");

  doc.setTextColor(...PRIMARY);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("DADOS DO CLIENTE", margin + 4, y);

  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...DARK);

  const colLeft = margin + 4;
  const colRight = W / 2 + 4;

  // linha 1
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...GRAY);
  doc.text("Nome", colLeft, y);
  doc.text("Telefone", colRight, y);

  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...DARK);
  doc.text(client?.nome ?? "(não informado)", colLeft, y);
  doc.text(client?.telefone ?? "-", colRight, y);

  y += 7;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...GRAY);
  doc.text("Endereço", colLeft, y);

  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...DARK);
  const enderecoLines = doc.splitTextToSize(
    client?.endereco ?? "-",
    innerW - 8,
  );
  doc.text(enderecoLines, colLeft, y);

  y += enderecoLines.length * 5 + 8;

  // ─── SEÇÃO DETALHES DA OS ─────────────────────────────────────
  doc.setFillColor(...LIGHT);
  doc.roundedRect(margin, y - 6, innerW, 46, 2, 2, "F");

  doc.setTextColor(...PRIMARY);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("DETALHES DA ORDEM", margin + 4, y);

  y += 7;
  doc.setFontSize(9);

  // linha 1 — Tipo | Status
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...GRAY);
  doc.text("Tipo", colLeft, y);
  doc.text("Status", colRight, y);

  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...DARK);
  doc.text(tipoLabel(order.tipo), colLeft, y);

  // badge colorido de status
  const sc = statusColor(order.status);
  doc.setFillColor(...sc);
  doc.roundedRect(colRight - 1, y - 4, 28, 5.5, 1, 1, "F");
  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "bold");
  doc.text(statusLabel(order.status), colRight + 13, y, { align: "center" });

  y += 8;

  // linha 2 — Valor | Criada em
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...GRAY);
  doc.text("Valor", colLeft, y);
  doc.text("Criada em", colRight, y);

  y += 5;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...PRIMARY);
  doc.text(formatCurrency(Number(order.valor)), colLeft, y);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...DARK);
  doc.text(formatDateTime(order.createdAt), colRight, y);

  y += 8;

  // linha 3 — Data agendada
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...GRAY);
  doc.text("Data do serviço", colLeft, y);

  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...DARK);
  doc.text(formatDate(order.scheduledFor), colLeft, y);

  y += 12;

  // ─── DESCRIÇÃO ────────────────────────────────────────────────
  doc.setFillColor(...LIGHT);
  const descLines = doc.splitTextToSize(order.descricao || "-", innerW - 8);
  const descHeight = descLines.length * 5 + 14;
  doc.roundedRect(margin, y - 6, innerW, descHeight, 2, 2, "F");

  doc.setTextColor(...PRIMARY);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("DESCRIÇÃO", margin + 4, y);

  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  doc.text(descLines, colLeft, y);

  y += descLines.length * 5 + 8;

  // ─── OBSERVAÇÕES ──────────────────────────────────────────────
  const obsText = (order as any).obs;
  const obsLines = doc.splitTextToSize(obsText || "-", innerW - 8);
  const obsHeight = obsLines.length * 5 + 14;
  doc.setFillColor(...LIGHT);
  doc.roundedRect(margin, y - 6, innerW, obsHeight, 2, 2, "F");

  doc.setTextColor(...PRIMARY);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("OBSERVAÇÕES", margin + 4, y);

  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  doc.text(obsLines, colLeft, y);

  y += obsLines.length * 5 + 10;

  // ─── ASSINATURA ───────────────────────────────────────────────
  const signY = Math.max(y + 10, 245);

  doc.setDrawColor(...GRAY);
  doc.setLineWidth(0.3);
  doc.line(margin, signY, margin + 70, signY);
  doc.line(W - margin - 70, signY, W - margin, signY);

  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.setFont("helvetica", "normal");
  doc.text("Assinatura do Técnico", margin + 35, signY + 4, {
    align: "center",
  });
  doc.text("Assinatura do Cliente", W - margin - 35, signY + 4, {
    align: "center",
  });

  // ─── RODAPÉ ───────────────────────────────────────────────────
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 285, W, 12, "F");

  doc.setTextColor(...WHITE);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.text(`${BRAND} • Documento gerado automaticamente`, W / 2, 292, {
    align: "center",
  });

  // salvar
  const filename = `OS_${order.id.slice(0, 8)}.pdf`;
  doc.save(filename);
}
