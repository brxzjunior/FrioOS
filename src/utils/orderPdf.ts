import jsPDF from "jspdf";
import type { Order } from "../services/orderService";
import type { Client } from "../services/clientService";

export function generateOrderPdf(order: Order, client?: Client) {
  const doc = new jsPDF();

  // Helpers
  const line = (y: number) => doc.line(10, y, 200, y);
  const text = (t: string, x: number, y: number) =>
    doc.text(String(t ?? ""), x, y);

  // Cabeçalho
  doc.setFontSize(16);
  text("FrioOS - Ordem de Serviço", 10, 15);
  doc.setFontSize(10);
  text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 10, 22);
  line(25);

  // Cliente
  doc.setFontSize(12);
  text("Cliente", 10, 33);
  doc.setFontSize(10);
  text(`Nome: ${client?.nome ?? "(não informado)"}`, 10, 40);
  text(`Telefone: ${client?.telefone ?? "-"}`, 10, 46);
  text(`Endereço: ${client?.endereco ?? "-"}`, 10, 52);

  line(58);

  // OS
  doc.setFontSize(12);
  text("Ordem", 10, 66);
  doc.setFontSize(10);

  text(`ID: ${order.id}`, 10, 73);
  text(`Tipo: ${order.tipo}`, 10, 79);
  text(`Status: ${order.status}`, 10, 85);
  text(`Valor: R$ ${Number(order.valor).toFixed(2).replace(".", ",")}`, 10, 91);
  text(
    `Criada em: ${new Date(order.createdAt).toLocaleString("pt-BR")}`,
    10,
    97,
  );

  line(103);

  // Descrição
  doc.setFontSize(12);
  text("Descrição", 10, 111);
  doc.setFontSize(10);
  const desc = doc.splitTextToSize(order.descricao || "-", 180);
  doc.text(desc, 10, 118);

  // Observações (obs)
  const lastY = 118 + desc.length * 5 + 6;
  doc.setFontSize(12);
  text("Observações", 10, lastY);
  doc.setFontSize(10);
  const obs = doc.splitTextToSize((order as any).obs || "-", 180);
  doc.text(obs, 10, lastY + 7);

  // Salvar
  const filename = `OS_${order.id.slice(0, 8)}.pdf`;
  doc.save(filename);
}
