import { all, run } from "../database/db";
import type { Client } from "../models/client.model";

type CreateClientInput = {
  nome: string;
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
  if (nome.length < 2) {
    throw new Error("Nome é obrigatório e deve ter pelo menos 2 caracteres.");
  }

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
