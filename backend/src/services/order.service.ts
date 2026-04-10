import { all, get, run } from "../database/db";
import crypto from "crypto";

export type OrderStatus = "ABERTA" | "ANDAMENTO" | "FINALIZADA";
export type OrderTipo = "INSTALACAO" | "MANUTENCAO" | "LIMPEZA" | "RETIRADA";

export type Order = {
  id: string;
  userId: string;
  clientId: string;
  tipo: OrderTipo;
  descricao: string;
  obs: string | null;
  valor: number;
  status: OrderStatus;
  pago: boolean;
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

const ORDER_SELECT = `
  SELECT
    orders.id,
    orders."userId",
    orders."clientId",
    orders.tipo,
    orders.descricao,
    orders.obs,
    orders.valor,
    orders.status,
    orders.pago,
    orders."createdAt",
    orders."scheduledFor",
    clients.nome     AS "clientNome",
    clients.telefone AS "clientTelefone"
  FROM orders
  JOIN clients ON clients.id = orders."clientId"
`;

function toOrder(raw: any): Order {
  return { ...raw, pago: raw.pago === 1 || raw.pago === true };
}

export async function list(userId: string, params?: ListParams) {
  if (!userId) throw new Error("userId é obrigatório.");

  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;
  const status = params?.status;
  const offset = (page - 1) * limit;

  const values: any[] = [userId];
  let where = `WHERE orders."userId" = $1`;

  if (status) {
    values.push(status);
    where += ` AND orders.status = $${values.length}`;
  }

  values.push(limit);
  const limitIdx = values.length;
  values.push(offset);
  const offsetIdx = values.length;

  const rawOrders = await all<any>(
    `${ORDER_SELECT} ${where} ORDER BY orders."createdAt" DESC LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
    values,
  );

  const countValues = status ? [userId, status] : [userId];
  const totalRow = await get<{ total: string }>(
    `SELECT COUNT(*) as total FROM orders ${where}`,
    countValues,
  );

  const total = Number(totalRow?.total ?? 0);

  return {
    data: rawOrders.map(toOrder),
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

  const raw = await get<any>(
    `${ORDER_SELECT} WHERE orders.id = $1 AND orders."userId" = $2`,
    [id, userId],
  );

  return raw ? toOrder(raw) : null;
}

export async function create(
  userId: string,
  input: CreateOrderInput,
): Promise<Order> {
  if (!userId) throw new Error("userId é obrigatório.");

  const clientId = input?.clientId?.trim() ?? "";
  const tipo = input?.tipo;
  const descricao = input?.descricao?.trim() ?? "";
  const obs = input?.obs?.trim() || null; // ← corrigido: string vazia vira null
  const valorNumber = Number(input?.valor);
  const scheduledFor = input?.scheduledFor ?? null;

  if (!clientId) throw new Error("clientId é obrigatório.");
  if (!tipo) throw new Error("tipo é obrigatório.");
  if (descricao.length < 3)
    throw new Error("descricao é obrigatória (mín. 3 caracteres).");
  if (Number.isNaN(valorNumber) || valorNumber < 0)
    throw new Error("valor inválido.");

  const client = await get<{ id: string }>(
    `SELECT id FROM clients WHERE id = $1 AND "userId" = $2`,
    [clientId, userId],
  );
  if (!client)
    throw new Error("Cliente inválido ou não pertence a este usuário.");

  const orderId = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  await run(
    `INSERT INTO orders
      (id, "userId", "clientId", tipo, descricao, obs, valor, status, pago, "createdAt", "scheduledFor")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [
      orderId,
      userId,
      clientId,
      tipo,
      descricao,
      obs,
      valorNumber,
      "ABERTA",
      0, // ← corrigido: false → 0
      createdAt,
      scheduledFor,
    ],
  );

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
    `SELECT id FROM orders WHERE id = $1 AND "userId" = $2`,
    [orderId, userId],
  );
  if (!exists)
    throw new Error("OS não encontrada ou não pertence a este usuário.");

  await run(`UPDATE orders SET status = $1 WHERE id = $2 AND "userId" = $3`, [
    status,
    orderId,
    userId,
  ]);

  return { id: orderId, status };
}

export async function updatePago(
  userId: string,
  id: string,
  pago: boolean,
): Promise<Order> {
  if (!userId) throw new Error("userId é obrigatório.");
  if (!id) throw new Error("id é obrigatório.");

  const exists = await get<{ id: string }>(
    `SELECT id FROM orders WHERE id = $1 AND "userId" = $2`,
    [id, userId],
  );
  if (!exists) throw new Error("OS não encontrada.");

  await run(`UPDATE orders SET pago = $1 WHERE id = $2 AND "userId" = $3`, [
    pago ? 1 : 0, // ← corrigido: boolean → integer
    id,
    userId,
  ]);

  const updated = await getById(userId, id);
  if (!updated) throw new Error("Erro ao atualizar pagamento.");
  return updated;
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
    `SELECT id FROM orders WHERE id = $1 AND "userId" = $2`,
    [id, userId],
  );
  if (!exists) throw new Error("Ordem não encontrada.");

  await run(
    `UPDATE orders
     SET
       descricao      = COALESCE($1, descricao),
       obs            = COALESCE($2, obs),
       valor          = COALESCE($3, valor),
       tipo           = COALESCE($4, tipo),
       "scheduledFor" = COALESCE($5, "scheduledFor")
     WHERE id = $6 AND "userId" = $7`,
    [
      data.descricao ?? null,
      data.obs ?? null,
      data.valor ?? null,
      data.tipo ?? null,
      data.scheduledFor ?? null,
      id,
      userId,
    ],
  );

  const updated = await getById(userId, id);
  if (!updated) throw new Error("Erro ao atualizar ordem.");
  return updated;
}

export async function stats(userId: string) {
  if (!userId) throw new Error("userId é obrigatório.");

  const rows = await all<{ status: OrderStatus; total: string }>(
    `SELECT orders.status, COUNT(*) as total
     FROM orders
     INNER JOIN clients ON clients.id = orders."clientId"
     WHERE orders."userId" = $1
     GROUP BY orders.status`,
    [userId],
  );

  const result = { abertas: 0, andamento: 0, finalizadas: 0, total: 0 };

  for (const row of rows) {
    if (row.status === "ABERTA") result.abertas = Number(row.total);
    if (row.status === "ANDAMENTO") result.andamento = Number(row.total);
    if (row.status === "FINALIZADA") result.finalizadas = Number(row.total);
    result.total += Number(row.total);
  }

  return result;
}

export async function remove(userId: string, id: string) {
  if (!userId) throw new Error("userId é obrigatório.");
  if (!id) throw new Error("id é obrigatório.");

  const order = await get<{ id: string }>(
    `SELECT id FROM orders WHERE id = $1 AND "userId" = $2`,
    [id, userId],
  );
  if (!order) throw new Error("Ordem não encontrada.");

  await run(`DELETE FROM orders WHERE id = $1 AND "userId" = $2`, [id, userId]);
  return { id };
}

export async function revenueByMonth(userId: string) {
  return await all(
    `SELECT
       TO_CHAR(CAST("scheduledFor" AS timestamp), 'YYYY-MM') AS mes,
       SUM(valor) AS total
     FROM orders
     WHERE "userId" = $1 AND status = 'FINALIZADA' AND "scheduledFor" IS NOT NULL
     GROUP BY mes
     ORDER BY mes DESC`,
    [userId],
  );
}

export async function mostUsedService(userId: string) {
  if (!userId) throw new Error("userId é obrigatório.");

  return await all(
    `SELECT tipo, COUNT(*) AS total
     FROM orders
     WHERE "userId" = $1
     GROUP BY tipo
     ORDER BY total DESC`,
    [userId],
  );
}
