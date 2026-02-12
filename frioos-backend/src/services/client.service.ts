import { all, run } from "../database/db";
import type { Client } from "../models/client.model";

type CreateClientInput = {
  nome: string;
  telefone?: string;
  endereco?: string;
};

export async function list(): Promise<Client[]> {
  // 🟣 SELECT no banco
  return all<Client>(
    `SELECT id, nome, telefone, endereco, createdAt
     FROM clients
     ORDER BY createdAt DESC`,
  );
}

export async function create(input: CreateClientInput): Promise<Client> {
  // 🔵 regra de negócio (validação)
  if (!input?.nome || input.nome.trim().length < 2) {
    throw new Error("Nome é obrigatório e deve ter pelo menos 2 caracteres.");
  }

  const client: Client = {
    id: crypto.randomUUID(),
    nome: input.nome.trim(),
    telefone: input.telefone?.trim() ?? "",
    endereco: input.endereco?.trim() ?? "",
    createdAt: new Date().toISOString(),
  };

  // 🟣 INSERT no banco (prepared statement via params)
  await run(
    `INSERT INTO clients (id, nome, telefone, endereco, createdAt)
     VALUES (?, ?, ?, ?, ?)`,
    [
      client.id,
      client.nome,
      client.telefone,
      client.endereco,
      client.createdAt,
    ],
  );

  return client;
}
