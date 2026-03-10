import { all, get, run } from "../database/db";
import crypto from "crypto";

export type OrderStatus = "ABERTA" | "ANDAMENTO" | "FINALIZADA";
export type OrderTipo = "INSTALACAO" | "MANUTENCAO" | "CONSERTO";

export type Order = {
  id: string;
  userId: string;
  clientId: string;
  tipo: OrderTipo;
  descricao: string;
  obs: string;
  valor: number;
  status: OrderStatus;
  createdAt: string;

  // dados do cliente (join)
  clientNome?: string;
  clientTelefone?: string;
};

type CreateOrderInput = {
  clientId: string;
  tipo: OrderTipo;
  descricao: string;
  obs?: string;
  valor: number;
};

export async function list(userId: string): Promise<Order[]> {
  if (!userId) throw new Error("userId é obrigatório.");

  return all<Order>(
    `
    SELECT 
      orders.id,
      orders.userId,
      orders.clientId,
      orders.tipo,
      orders.descricao,
      orders.obs,
      orders.valor,
      orders.status,
      orders.createdAt,
      clients.nome as clientNome,
      clients.telefone as clientTelefone
    FROM orders
    JOIN clients ON clients.id = orders.clientId
    WHERE orders.userId = ?
    ORDER BY datetime(orders.createdAt) DESC
    `,
    [userId],
  );
}

export async function getById(
  userId: string,
  id: string,
): Promise<Order | null> {
  if (!userId) throw new Error("userId é obrigatório.");
  if (!id) throw new Error("id é obrigatório.");

  const order = await get<Order>(
    `
    SELECT 
      orders.id,
      orders.userId,
      orders.clientId,
      orders.tipo,
      orders.descricao,
      orders.obs,
      orders.valor,
      orders.status,
      orders.createdAt,
      clients.nome as clientNome,
      clients.telefone as clientTelefone
    FROM orders
    JOIN clients ON clients.id = orders.clientId
    WHERE orders.id = ? AND orders.userId = ?
    `,
    [id, userId],
  );

  return order ?? null;
}

export async function create(
  userId: string,
  input: CreateOrderInput,
): Promise<Order> {
  if (!userId) throw new Error("userId é obrigatório.");

  const clientId = input?.clientId?.trim() ?? "";
  const tipo = input?.tipo;
  const descricao = input?.descricao?.trim() ?? "";
  const obs = input?.obs?.trim() ?? "";
  const valorNumber = Number(input?.valor);

  if (!clientId) throw new Error("clientId é obrigatório.");
  if (!tipo) throw new Error("tipo é obrigatório.");
  if (descricao.length < 3)
    throw new Error("descricao é obrigatória (mín. 3 caracteres).");
  if (Number.isNaN(valorNumber) || valorNumber < 0)
    throw new Error("valor inválido.");

  // segurança: garante que o cliente pertence ao usuário
  const client = await get<{ id: string }>(
    `SELECT id FROM clients WHERE id = ? AND userId = ?`,
    [clientId, userId],
  );

  if (!client) {
    throw new Error("Cliente inválido ou não pertence a este usuário.");
  }

  const order: Order = {
    id: crypto.randomUUID(),
    userId,
    clientId,
    tipo,
    descricao,
    obs,
    valor: valorNumber,
    status: "ABERTA",
    createdAt: new Date().toISOString(),
  };

  await run(
    `
    INSERT INTO orders 
    (id, userId, clientId, tipo, descricao, obs, valor, status, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      order.id,
      order.userId,
      order.clientId,
      order.tipo,
      order.descricao,
      order.obs,
      order.valor,
      order.status,
      order.createdAt,
    ],
  );

  return order;
}

export async function updateStatus(
  userId: string,
  id: string,
  status: OrderStatus,
): Promise<{ id: string; status: OrderStatus }> {
  if (!userId) throw new Error("userId é obrigatório.");

  const orderId = id?.trim() ?? "";
  if (!orderId) throw new Error("id é obrigatório.");

  const exists = await get<{ id: string }>(
    `SELECT id FROM orders WHERE id = ? AND userId = ?`,
    [orderId, userId],
  );

  if (!exists) {
    throw new Error("OS não encontrada ou não pertence a este usuário.");
  }

  await run(`UPDATE orders SET status = ? WHERE id = ? AND userId = ?`, [
    status,
    orderId,
    userId,
  ]);

  return { id: orderId, status };
}

export async function stats(userId: string) {
  if (!userId) throw new Error("userId é obrigatório.");

  const rows = await all<{ status: OrderStatus; total: number }>(
    `
    SELECT status, COUNT(*) as total
    FROM orders
    WHERE userId = ?
    GROUP BY status
    `,
    [userId],
  );

  const stats = {
    abertas: 0,
    andamento: 0,
    finalizadas: 0,
    total: 0,
  };

  for (const row of rows) {
    if (row.status === "ABERTA") stats.abertas = row.total;
    if (row.status === "ANDAMENTO") stats.andamento = row.total;
    if (row.status === "FINALIZADA") stats.finalizadas = row.total;

    stats.total += row.total;
  }

  return stats;
}
