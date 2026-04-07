import { api } from "./api";

export type OrderStats = {
  total: number;
  abertas: number;
  andamento: number;
  finalizadas: number;
};

export async function getOrderStats(): Promise<OrderStats> {
  const res = await api.get<OrderStats>("/orders/stats");
  return res.data;
}
