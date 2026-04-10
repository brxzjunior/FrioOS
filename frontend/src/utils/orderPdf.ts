import jsPDF from "jspdf";
import type { Order } from "../services/orderService";
import type { Client } from "../services/clientService";

// ── Paleta ────────────────────────────────────────────────────
const C = {
  primary: [15, 23, 42] as [number, number, number], // azul escuro
  accent: [45, 212, 191] as [number, number, number], // teal
  accentDark: [22, 163, 152] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  light: [241, 245, 249] as [number, number, number],
  muted: [100, 116, 139] as [number, number, number],
  dark: [15, 23, 42] as [number, number, number],
  green: [22, 163, 74] as [number, number, number],
  greenBg: [220, 252, 231] as [number, number, number],
  yellow: [161, 127, 0] as [number, number, number],
  yellowBg: [254, 249, 195] as [number, number, number],
  red: [185, 28, 28] as [number, number, number],
  redBg: [254, 226, 226] as [number, number, number],
  blue: [29, 78, 216] as [number, number, number],
  blueBg: [219, 234, 254] as [number, number, number],
  border: [226, 232, 240] as [number, number, number],
};

// ── Helpers ───────────────────────────────────────────────────
function statusInfo(status: string): {
  label: string;
  color: [number, number, number];
  bg: [number, number, number];
} {
  if (status === "FINALIZADA")
    return { label: "Finalizada", color: C.green, bg: C.greenBg };
  if (status === "ANDAMENTO")
    return { label: "Em Andamento", color: C.yellow, bg: C.yellowBg };
  return { label: "Aberta", color: C.red, bg: C.redBg };
}

function pagoInfo(pago: boolean): {
  label: string;
  color: [number, number, number];
  bg: [number, number, number];
} {
  return pago
    ? { label: "Pago", color: C.green, bg: C.greenBg }
    : { label: "Pendente", color: C.yellow, bg: C.yellowBg };
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

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  // Evita conversão de timezone: trata YYYY-MM-DD diretamente
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("pt-BR");
}

function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? "—" : d.toLocaleString("pt-BR");
}

// ── Primitivos de desenho ─────────────────────────────────────
function badge(
  doc: jsPDF,
  x: number,
  y: number,
  text: string,
  textColor: [number, number, number],
  bgColor: [number, number, number],
  w = 32,
) {
  doc.setFillColor(...bgColor);
  doc.roundedRect(x, y - 4.5, w, 6.5, 1.5, 1.5, "F");
  doc.setTextColor(...textColor);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text(text, x + w / 2, y, { align: "center" });
}

function sectionTitle(doc: jsPDF, label: string, x: number, y: number) {
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.accent);
  doc.text(label.toUpperCase(), x, y);
}

function labelValue(
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  maxW = 80,
) {
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.muted);
  doc.text(label, x, y);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.dark);
  const lines = doc.splitTextToSize(value, maxW);
  doc.text(lines, x, y + 4.5);
  return lines.length;
}

function divider(doc: jsPDF, y: number, margin: number, W: number) {
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.2);
  doc.line(margin, y, W - margin, y);
}

// ── Export principal ──────────────────────────────────────────
export function generateOrderPdf(order: Order, client?: Client) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  const margin = 16;
  const innerW = W - margin * 2;
  const col2 = W / 2 + 2;
  const col2W = W / 2 - margin - 2;

  // ══════════════════════════════════════════════════════════
  // HEADER
  // ══════════════════════════════════════════════════════════
  doc.setFillColor(...C.primary);
  doc.rect(0, 0, W, 42, "F");

  // Barra teal
  doc.setFillColor(...C.accent);
  doc.rect(0, 38, W, 4, "F");

  // Logo / nome
  doc.setTextColor(...C.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("FrioOS", margin, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...C.accent);
  doc.text("Ordem de Serviço", margin, 25);

  // Número & data no canto direito
  doc.setTextColor(...C.white);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.text(`Nº ${order.id.slice(0, 8).toUpperCase()}`, W - margin, 15, {
    align: "right",
  });

  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 220, 255);
  doc.text(`Emitido: ${new Date().toLocaleString("pt-BR")}`, W - margin, 21, {
    align: "right",
  });

  // ══════════════════════════════════════════════════════════
  // BADGES de STATUS & PAGAMENTO (logo abaixo do header)
  // ══════════════════════════════════════════════════════════
  let y = 55;

  const st = statusInfo(order.status);
  const pg = pagoInfo(order.pago);

  badge(doc, margin, y, st.label, st.color, st.bg, 36);
  badge(doc, margin + 40, y, pg.label, pg.color, pg.bg, 36);

  // Valor em destaque no canto direito
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...C.primary);
  doc.text(formatBRL(Number(order.valor)), W - margin, y, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...C.muted);
  doc.text("Valor total", W - margin, y + 5, { align: "right" });

  y += 14;
  divider(doc, y, margin, W);
  y += 8;

  // ══════════════════════════════════════════════════════════
  // DADOS DO CLIENTE
  // ══════════════════════════════════════════════════════════
  sectionTitle(doc, "Dados do Cliente", margin, y);
  y += 6;

  // linha 1: Nome | Telefone
  const nomeLines = labelValue(
    doc,
    "Nome",
    client?.nome ?? "—",
    margin,
    y,
    innerW / 2 - 4,
  );
  const telLines = labelValue(
    doc,
    "Telefone",
    client?.telefone ?? "—",
    col2,
    y,
    col2W,
  );
  y += Math.max(nomeLines, telLines) * 4.5 + 10;

  // linha 2: Endereço
  const endLines = labelValue(
    doc,
    "Endereço",
    client?.endereco ?? "—",
    margin,
    y,
    innerW,
  );
  y += endLines * 4.5 + 10;

  divider(doc, y, margin, W);
  y += 8;

  // ══════════════════════════════════════════════════════════
  // DETALHES DA OS
  // ══════════════════════════════════════════════════════════
  sectionTitle(doc, "Detalhes da Ordem", margin, y);
  y += 6;

  // linha 1: Tipo | Data criação
  labelValue(
    doc,
    "Tipo de Serviço",
    tipoLabel(order.tipo),
    margin,
    y,
    innerW / 2 - 4,
  );
  labelValue(doc, "Criada em", formatDateTime(order.createdAt), col2, y, col2W);
  y += 10;

  // linha 2: Data do serviço | Status
  labelValue(
    doc,
    "Data do Serviço",
    formatDate(order.scheduledFor),
    margin,
    y,
    innerW / 2 - 4,
  );
  labelValue(
    doc,
    "Pagamento",
    pg.label.replace(/[✓⏳]\s?/g, ""),
    col2,
    y,
    col2W,
  );
  y += 10;

  divider(doc, y, margin, W);
  y += 8;

  // ══════════════════════════════════════════════════════════
  // DESCRIÇÃO
  // ══════════════════════════════════════════════════════════
  sectionTitle(doc, "Descrição do Serviço", margin, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...C.dark);
  const descLines = doc.splitTextToSize(order.descricao || "—", innerW);
  doc.text(descLines, margin, y);
  y += descLines.length * 5 + 8;

  divider(doc, y, margin, W);
  y += 8;

  // ══════════════════════════════════════════════════════════
  // OBSERVAÇÕES
  // ══════════════════════════════════════════════════════════
  const obsText = (order as any).obs;
  if (obsText && obsText.trim()) {
    sectionTitle(doc, "Observações", margin, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.dark);
    const obsLines = doc.splitTextToSize(obsText, innerW);
    doc.text(obsLines, margin, y);
    y += obsLines.length * 5 + 8;

    divider(doc, y, margin, W);
    y += 8;
  }

  // ══════════════════════════════════════════════════════════
  // RESUMO FINANCEIRO (caixa destacada)
  // ══════════════════════════════════════════════════════════
  const boxY = Math.max(y + 4, 210);
  doc.setFillColor(...C.light);
  doc.roundedRect(margin, boxY, innerW, 24, 2, 2, "F");
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, boxY, innerW, 24, 2, 2, "S");

  // Valor
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...C.muted);
  doc.text("VALOR TOTAL", margin + 6, boxY + 8);
  doc.setFontSize(14);
  doc.setTextColor(...C.primary);
  doc.text(formatBRL(Number(order.valor)), margin + 6, boxY + 18);

  // Status pagamento
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...C.muted);
  doc.text("SITUAÇÃO", W / 2, boxY + 8);
  doc.setFontSize(12);
  doc.setTextColor(...pg.color);
  doc.text(order.pago ? "Pago" : "Pendente", W / 2, boxY + 18);

  // Status OS
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...C.muted);
  doc.text("STATUS OS", W - margin - 50, boxY + 8);
  doc.setFontSize(12);
  doc.setTextColor(...st.color);
  doc.text(st.label, W - margin - 50, boxY + 18);

  // ══════════════════════════════════════════════════════════
  // ASSINATURA
  // ══════════════════════════════════════════════════════════
  const signY = 255;
  doc.setDrawColor(...C.muted);
  doc.setLineWidth(0.3);
  doc.line(margin, signY, margin + 70, signY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...C.muted);
  doc.text("Assinatura do Técnico", margin, signY + 4.5);

  doc.line(W - margin - 70, signY, W - margin, signY);
  doc.text("Assinatura do Cliente", W - margin - 70, signY + 4.5);

  // ══════════════════════════════════════════════════════════
  // RODAPÉ
  // ══════════════════════════════════════════════════════════
  doc.setFillColor(...C.primary);
  doc.rect(0, 282, W, 15, "F");

  doc.setFillColor(...C.accent);
  doc.rect(0, 282, W, 2, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...C.white);
  doc.text(
    "FrioOS • Documento gerado automaticamente • Confidencial",
    W / 2,
    290,
    { align: "center" },
  );
  doc.setTextColor(120, 180, 220);
  doc.text(`OS: ${order.id.toUpperCase()}`, W / 2, 294, { align: "center" });

  // ══════════════════════════════════════════════════════════
  // SALVAR
  // ══════════════════════════════════════════════════════════
  doc.save(`OS_${order.id.slice(0, 8).toUpperCase()}.pdf`);
}
