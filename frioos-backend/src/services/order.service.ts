import { all, get, run } from "../database/db";

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
    `SELECT id, userId, clientId, tipo, descricao, obs, valor, status, createdAt
     FROM orders
     WHERE userId = ?
     ORDER BY datetime(createdAt) DESC`,
    [userId],
  );
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

  // 🔒 Segurança: garante que esse clientId é do usuário logado
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
    `INSERT INTO orders (id, userId, clientId, tipo, descricao, obs, valor, status, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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

  // 🔒 Segurança: só atualiza se a OS for do usuário
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
