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
};

export async function getOrders(): Promise<Order[]> {
  const res = await api.get<Order[]>("/orders");
  return res.data;
}

export async function createOrder(data: {
  clientId: string;
  tipo: OrderTipo;
  descricao: string;
  valor: number;
}): Promise<Order> {
  const res = await api.post<Order>("/orders", data);
  return res.data;
}

export async function updateOrderStatus(
  id: string,
  status: "ABERTA" | "ANDAMENTO" | "FINALIZADA",
) {
  const res = await api.patch(`/orders/${id}/status`, { status });
  return res.data;
}
