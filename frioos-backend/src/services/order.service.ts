// frioos-backend/src/services/order.service.ts
// ─────────────────────────────────────────────────────────────
// Camada de acesso ao banco para ordens de serviço.
// Todas as funções recebem userId para garantir isolamento
// de dados entre usuários (multi-tenant seguro).
// ─────────────────────────────────────────────────────────────
import { all, get, run } from "../database/db";
import crypto from "crypto";

// ── Tipos públicos ────────────────────────────────────────────
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
  pago: boolean; // ✅ campo de pagamento
  createdAt: string;
  scheduledFor?: string | null;
  clientNome?: string;
  clientTelefone?: string;
};

// ── Tipos internos ────────────────────────────────────────────
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

// ── SELECT padrão com JOIN ────────────────────────────────────
// Centralizado para evitar repetição em list e getById.
// O campo pago vem como INTEGER do SQLite (0/1) —
// convertemos para boolean no retorno via map.
const ORDER_SELECT = `
  SELECT
    orders.id,
    orders.userId,
    orders.clientId,
    orders.tipo,
    orders.descricao,
    orders.obs,
    orders.valor,
    orders.status,
    orders.pago,
    orders.createdAt,
    orders.scheduledFor,
    clients.nome      AS clientNome,
    clients.telefone  AS clientTelefone
  FROM orders
  JOIN clients ON clients.id = orders.clientId
`;

/** Converte o campo pago de INTEGER (SQLite) para boolean */
function toOrder(raw: any): Order {
  return { ...raw, pago: raw.pago === 1 || raw.pago === true };
}

// ── LIST ──────────────────────────────────────────────────────
/** Lista ordens do usuário com paginação e filtro de status */
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

  const rawOrders = await all<any>(
    `${ORDER_SELECT} ${where} ORDER BY datetime(orders.createdAt) DESC LIMIT ? OFFSET ?`,
    [...values, limit, offset],
  );

  const totalRow = await get<{ total: number }>(
    `SELECT COUNT(*) as total FROM orders ${where}`,
    values,
  );

  return {
    data: rawOrders.map(toOrder),
    page,
    limit,
    total: totalRow?.total ?? 0,
    totalPages: Math.ceil((totalRow?.total ?? 0) / limit),
  };
}

// ── GET BY ID ─────────────────────────────────────────────────
/** Busca uma OS específica do usuário */
export async function getById(
  userId: string,
  id: string,
): Promise<Order | null> {
  if (!userId) throw new Error("userId é obrigatório.");
  if (!id) throw new Error("id é obrigatório.");

  const raw = await get<any>(
    `${ORDER_SELECT} WHERE orders.id = ? AND orders.userId = ?`,
    [id, userId],
  );

  return raw ? toOrder(raw) : null;
}

// ── CREATE ────────────────────────────────────────────────────
/** Cria uma nova OS. pago começa sempre como false */
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
  if (!client)
    throw new Error("Cliente inválido ou não pertence a este usuário.");

  const orderId = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  await run(
    `INSERT INTO orders
      (id, userId, clientId, tipo, descricao, obs, valor, status, pago, createdAt, scheduledFor)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      orderId,
      userId,
      clientId,
      tipo,
      descricao,
      obs,
      valorNumber,
      "ABERTA",
      0,
      createdAt,
      scheduledFor,
    ],
  );

  const order = await getById(userId, orderId);
  if (!order) throw new Error("Erro ao criar OS.");
  return order;
}

// ── UPDATE STATUS ─────────────────────────────────────────────
/** Atualiza apenas o status da OS (progresso do serviço) */
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
  if (!exists)
    throw new Error("OS não encontrada ou não pertence a este usuário.");

  await run(`UPDATE orders SET status = ? WHERE id = ? AND userId = ?`, [
    status,
    orderId,
    userId,
  ]);

  return { id: orderId, status };
}

// ── UPDATE PAGO ───────────────────────────────────────────────
/**
 * Marca/desmarca uma OS como paga.
 * Independente do status do serviço — uma OS pode estar
 * "Em Andamento" e já ter sido paga antecipadamente.
 */
export async function updatePago(
  userId: string,
  id: string,
  pago: boolean,
): Promise<Order> {
  if (!userId) throw new Error("userId é obrigatório.");
  if (!id) throw new Error("id é obrigatório.");

  const exists = await get<{ id: string }>(
    `SELECT id FROM orders WHERE id = ? AND userId = ?`,
    [id, userId],
  );
  if (!exists) throw new Error("OS não encontrada.");

  // Converte boolean para INTEGER (SQLite não tem tipo boolean nativo)
  await run(`UPDATE orders SET pago = ? WHERE id = ? AND userId = ?`, [
    pago ? 1 : 0,
    id,
    userId,
  ]);

  const updated = await getById(userId, id);
  if (!updated) throw new Error("Erro ao atualizar pagamento.");
  return updated;
}

// ── UPDATE ────────────────────────────────────────────────────
/** Edita campos descritivos da OS (não altera status nem pago) */
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
  if (!exists) throw new Error("Ordem não encontrada.");

  await run(
    `UPDATE orders
     SET
       descricao    = COALESCE(?, descricao),
       obs          = COALESCE(?, obs),
       valor        = COALESCE(?, valor),
       tipo         = COALESCE(?, tipo),
       scheduledFor = COALESCE(?, scheduledFor)
     WHERE id = ? AND userId = ?`,
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

// ── STATS ─────────────────────────────────────────────────────
/** Contagens por status para o dashboard */
export async function stats(userId: string) {
  if (!userId) throw new Error("userId é obrigatório.");

  const rows = await all<{ status: OrderStatus; total: number }>(
    `SELECT status, COUNT(*) as total FROM orders WHERE userId = ? GROUP BY status`,
    [userId],
  );

  const result = { abertas: 0, andamento: 0, finalizadas: 0, total: 0 };

  for (const row of rows) {
    if (row.status === "ABERTA") result.abertas = row.total;
    if (row.status === "ANDAMENTO") result.andamento = row.total;
    if (row.status === "FINALIZADA") result.finalizadas = row.total;
    result.total += row.total;
  }

  return result;
}

// ── REMOVE ────────────────────────────────────────────────────
/** Remove uma OS permanentemente */
export async function remove(userId: string, id: string) {
  if (!userId) throw new Error("userId é obrigatório.");
  if (!id) throw new Error("id é obrigatório.");

  const order = await get<{ id: string }>(
    `SELECT id FROM orders WHERE id = ? AND userId = ?`,
    [id, userId],
  );
  if (!order) throw new Error("Ordem não encontrada.");

  await run(`DELETE FROM orders WHERE id = ? AND userId = ?`, [id, userId]);
  return { id };
}

// ── REVENUE BY MONTH ──────────────────────────────────────────
/**
 * Faturamento mensal de OS FINALIZADAS.
 * Usa scheduledFor com ajuste de +3h para compensar UTC→BRT,
 * evitando que datas de março apareçam como fevereiro.
 */
export async function revenueByMonth(userId: string) {
  return await all(
    `SELECT
       strftime('%Y-%m', scheduledFor, '+3 hours') AS mes,
       SUM(valor) AS total
     FROM orders
     WHERE userId = ? AND status = 'FINALIZADA' AND scheduledFor IS NOT NULL
     GROUP BY mes
     ORDER BY mes DESC`,
    [userId],
  );
}

// ── MOST USED SERVICE ─────────────────────────────────────────
/** Contagem de OS por tipo de serviço */
export async function mostUsedService(userId: string) {
  if (!userId) throw new Error("userId é obrigatório.");

  return await all(
    `SELECT tipo, COUNT(*) AS total
     FROM orders
     WHERE userId = ?
     GROUP BY tipo
     ORDER BY total DESC`,
    [userId],
  );
}
