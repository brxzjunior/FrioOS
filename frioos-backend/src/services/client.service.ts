import { all, get, run } from "../database/db";
import type { Client } from "../models/client.model";

type CreateClientInput = {
  nome: string;
  telefone?: string;
  endereco?: string;
};

type UpdateClientInput = {
  nome?: string;
  telefone?: string;
  endereco?: string;
};

export async function list(userId: string): Promise<Client[]> {
  return all<Client>(
    `SELECT id, userId, nome, telefone, endereco, createdAt
     FROM clients
     WHERE userId = ?
     ORDER BY datetime(createdAt) DESC`,
    [userId],
  );
}

export async function create(
  userId: string,
  input: CreateClientInput,
): Promise<Client> {
  const nome = input?.nome?.trim() ?? "";
  const telefone = input?.telefone?.trim() ?? "";
  const endereco = input?.endereco?.trim() ?? "";

  if (!userId) throw new Error("userId é obrigatório.");
  if (nome.length < 2)
    throw new Error("Nome deve ter pelo menos 2 caracteres.");

  const client: Client = {
    id: crypto.randomUUID(),
    userId,
    nome,
    telefone,
    endereco,
    createdAt: new Date().toISOString(),
  };

  await run(
    `INSERT INTO clients (id, userId, nome, telefone, endereco, createdAt)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      client.id,
      client.userId,
      client.nome,
      client.telefone,
      client.endereco,
      client.createdAt,
    ],
  );

  return client;
}

export async function update(
  userId: string,
  id: string,
  input: UpdateClientInput,
): Promise<Client> {
  if (!userId) throw new Error("userId é obrigatório.");
  if (!id) throw new Error("id é obrigatório.");

  const exists = await get<{ id: string }>(
    `SELECT id FROM clients WHERE id = ? AND userId = ?`,
    [id, userId],
  );

  if (!exists) throw new Error("Cliente não encontrado.");

  const nome = input.nome?.trim();
  const telefone = input.telefone?.trim();
  const endereco = input.endereco?.trim();

  if (nome !== undefined && nome.length < 2)
    throw new Error("Nome deve ter pelo menos 2 caracteres.");

  await run(
    `UPDATE clients
     SET
       nome     = COALESCE(?, nome),
       telefone = COALESCE(?, telefone),
       endereco = COALESCE(?, endereco)
     WHERE id = ? AND userId = ?`,
    [nome ?? null, telefone ?? null, endereco ?? null, id, userId],
  );

  const updated = await get<Client>(
    `SELECT id, userId, nome, telefone, endereco, createdAt
     FROM clients WHERE id = ?`,
    [id],
  );

  if (!updated) throw new Error("Erro ao buscar cliente atualizado.");
  return updated;
}

export async function remove(userId: string, id: string): Promise<void> {
  if (!userId) throw new Error("userId é obrigatório.");
  if (!id) throw new Error("id é obrigatório.");

  const exists = await get<{ id: string }>(
    `SELECT id FROM clients WHERE id = ? AND userId = ?`,
    [id, userId],
  );

  if (!exists) throw new Error("Cliente não encontrado.");

  await run(`DELETE FROM clients WHERE id = ? AND userId = ?`, [id, userId]);
}
