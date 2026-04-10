// src/services/orderService.ts
// ─────────────────────────────────────────────────────────────
// Funções de acesso à API de ordens de serviço.
// Cada função corresponde a um endpoint do backend.
// ─────────────────────────────────────────────────────────────
import { api } from "./api";

// ── Tipos ─────────────────────────────────────────────────────
export type OrderStatus = "ABERTA" | "ANDAMENTO" | "FINALIZADA";
export type OrderTipo = "INSTALACAO" | "MANUTENCAO" | "LIMPEZA" | "RETIRADA";

export type Order = {
  id: string;
  clientId: string;
  tipo: OrderTipo;
  descricao: string;
  valor: number;
  status: OrderStatus;
  pago: boolean;
  createdAt: string;
  scheduledFor?: string | null;
  obs?: string | null;
  clientNome?: string; // ← adicionado
  clientTelefone?: string; // ← adicionado
};

// ── Listar ────────────────────────────────────────────────────

/** Retorna todas as OS do usuário autenticado */
export async function getOrders(): Promise<Order[]> {
  const res = await api.get("/orders");
  const payload = res.data as Order[] | { data: Order[] };

  // O backend pode retornar array direto ou paginado { data: [] }
  return Array.isArray(payload) ? payload : (payload.data ?? []);
}

// ── Criar ─────────────────────────────────────────────────────

/** Cria uma nova OS. pago começa como false no backend */
export async function createOrder(data: {
  clientId: string;
  tipo: OrderTipo;
  descricao: string;
  valor: number;
  obs?: string;
  scheduledFor?: string;
}): Promise<Order> {
  const res = await api.post<Order>("/orders", data);
  return res.data;
}

// ── Atualizar status ──────────────────────────────────────────

/** Altera o progresso do serviço (ABERTA → ANDAMENTO → FINALIZADA) */
export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<Order> {
  const res = await api.patch<Order>(`/orders/${id}/status`, { status });
  return res.data;
}

// ── Atualizar pagamento ───────────────────────────────────────

/**
 * Marca ou desmarca a OS como paga.
 * Independente do status — uma OS pode estar em andamento
 * e já ter sido paga, ou ter o pagamento revertido.
 */
export async function updateOrderPago(
  id: string,
  pago: boolean,
): Promise<Order> {
  const res = await api.patch<Order>(`/orders/${id}/pago`, { pago });
  return res.data;
}

// ── Editar ────────────────────────────────────────────────────

/** Edita campos descritivos da OS */
export async function updateOrder(
  id: string,
  data: {
    tipo?: OrderTipo;
    descricao?: string;
    valor?: number;
    obs?: string | null;
    scheduledFor?: string | null;
  },
): Promise<Order> {
  const res = await api.put<Order>(`/orders/${id}`, data);
  return res.data;
}

// ── Deletar ───────────────────────────────────────────────────

/** Remove uma OS permanentemente */
export async function deleteOrder(id: string): Promise<void> {
  await api.delete(`/orders/${id}`);
}

// ── Relatórios ────────────────────────────────────────────────

/** Faturamento agrupado por mês (OS finalizadas) */
export async function getRevenueByMonth() {
  const res = await api.get("/orders/revenue/month");
  return res.data;
}

/** Contagem de OS por tipo de serviço */
export async function getMostUsedServices() {
  const res = await api.get("/orders/stats/services");
  return res.data;
}
