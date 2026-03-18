import { api } from "./api";

export type OrderStatus = "ABERTA" | "ANDAMENTO" | "FINALIZADA";
export type OrderTipo = "INSTALACAO" | "MANUTENCAO" | "CONSERTO";

export type Order = {
  id: string;
  clientId: string;
  tipo: OrderTipo;
  descricao: string;
  valor: number;
  status: OrderStatus;
  createdAt: string;
  scheduledFor?: string;
  obs?: string | null;
};

export async function getOrders(): Promise<Order[]> {
  const res = await api.get("/orders");
  const payload = res.data as Order[] | { data: Order[] };

  if (Array.isArray(payload)) {
    return payload;
  }

  return payload.data ?? [];
}

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

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<Order> {
  const res = await api.patch<Order>(`/orders/${id}/status`, { status });
  return res.data;
}

export async function deleteOrder(id: string): Promise<void> {
  await api.delete(`/orders/${id}`);
}

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
export async function getRevenueByMonth() {
  const res = await api.get("/orders/revenue/month");
  return res.data;
}

export async function getMostUsedServices() {
  const res = await api.get("/orders/stats/services");
  return res.data;
}
