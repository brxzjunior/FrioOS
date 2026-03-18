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
  obs: string | null;
  valor: number;
  status: OrderStatus;
  createdAt: string;
  scheduledFor?: string | null;

  clientNome?: string;
  clientTelefone?: string;
};

type CreateOrderInput = {
  clientId: string;
  tipo: OrderTipo;
  descricao: string;
  obs?: string;
  valor: number;
  scheduledFor?: string;
};

type ListParams = {
  page?: number;
  limit?: number;
  status?: OrderStatus;
};

export async function list(userId: string, params?: ListParams) {
  if (!userId) throw new Error("userId é obrigatório.");

  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;
  const status = params?.status;

  const offset = (page - 1) * limit;

  let where = `WHERE orders.userId = ?`;
  const values: any[] = [userId];

  if (status) {
    where += ` AND orders.status = ?`;
    values.push(status);
  }

  const orders = await all<Order>(
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
    orders.scheduledFor,
    clients.nome as clientNome,
    clients.telefone as clientTelefone
  FROM orders
  JOIN clients ON clients.id = orders.clientId
  ${where}
  ORDER BY datetime(orders.createdAt) DESC
  LIMIT ? OFFSET ?
  `,
    [...values, limit, offset],
  );

  const totalRow = await get<{ total: number }>(
    `
    SELECT COUNT(*) as total
    FROM orders
    ${where}
    `,
    values,
  );

  const total = totalRow?.total ?? 0;

  return {
    data: orders,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
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
    orders.scheduledFor,
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
  const scheduledFor = input?.scheduledFor ?? null;

  if (!clientId) throw new Error("clientId é obrigatório.");
  if (!tipo) throw new Error("tipo é obrigatório.");
  if (descricao.length < 3)
    throw new Error("descricao é obrigatória (mín. 3 caracteres).");
  if (Number.isNaN(valorNumber) || valorNumber < 0)
    throw new Error("valor inválido.");

  const client = await get<{ id: string }>(
    `SELECT id FROM clients WHERE id = ? AND userId = ?`,
    [clientId, userId],
  );

  if (!client) {
    throw new Error("Cliente inválido ou não pertence a este usuário.");
  }

  const orderId = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  await run(
    `
INSERT INTO orders (
  id, userId, clientId, tipo, descricao, obs, valor, status, createdAt, scheduledFor
)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
    [
      orderId,
      userId,
      clientId,
      tipo,
      descricao,
      obs,
      valorNumber,
      "ABERTA",
      createdAt,
      scheduledFor, // 👈 AQUI
    ],
  );

  // retorna com join, igual getById
  const order = await getById(userId, orderId);
  if (!order) throw new Error("Erro ao criar OS.");

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

export async function update(
  userId: string,
  id: string,
  data: {
    descricao?: string;
    obs?: string | null;
    valor?: number;
    tipo?: OrderTipo;
    scheduledFor?: string | null;
  },
): Promise<Order> {
  if (!userId) throw new Error("userId é obrigatório.");
  if (!id) throw new Error("id é obrigatório.");

  const exists = await get<{ id: string }>(
    `SELECT id FROM orders WHERE id = ? AND userId = ?`,
    [id, userId],
  );

  if (!exists) {
    throw new Error("Ordem não encontrada.");
  }

  await run(
    `
    UPDATE orders
    SET
      descricao = COALESCE(?, descricao),
      obs       = COALESCE(?, obs),
      valor     = COALESCE(?, valor),
      tipo      = COALESCE(?, tipo),
      scheduledFor  = COALESCE(?, scheduledFor)
    WHERE id = ? AND userId = ?
    `,
    [
      data.descricao ?? null,
      data.obs ?? null,
      data.valor ?? null,
      data.tipo ?? null,
      data.scheduledFor ?? null, // 👈 AQUI
      id,
      userId,
    ],
  );

  const updated = await getById(userId, id);
  if (!updated) throw new Error("Erro ao atualizar ordem.");

  return updated;
}

export async function remove(userId: string, id: string) {
  if (!userId) throw new Error("userId é obrigatório.");
  if (!id) throw new Error("id é obrigatório.");

  const order = await get<{ id: string }>(
    `SELECT id FROM orders WHERE id = ? AND userId = ?`,
    [id, userId],
  );

  if (!order) {
    throw new Error("Ordem não encontrada.");
  }

  await run(`DELETE FROM orders WHERE id = ? AND userId = ?`, [id, userId]);

  return { id };
}

export async function revenueByMonth(userId: string) {
  return await all(
    `
    SELECT 
      strftime('%Y-%m', createdAt) as mes,
      SUM(valor) as total
    FROM orders
    WHERE userId = ? AND status = 'FINALIZADA'
    GROUP BY mes
    ORDER BY mes DESC
    `,
    [userId],
  );
}
export async function mostUsedService(userId: string) {
  if (!userId) throw new Error("userId é obrigatório.");

  return await all(
    `
    SELECT 
      tipo,
      COUNT(*) as total
    FROM orders
    WHERE userId = ?
    GROUP BY tipo
    ORDER BY total DESC
    `,
    [userId],
  );
}
