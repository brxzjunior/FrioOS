// src/database/schema.ts
import { run } from "../database/db";

export async function initDb() {
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE,
      passwordHash TEXT,
      avatarUrl TEXT,
      createdAt TEXT,
      resetToken TEXT,
      resetTokenExpiresAt TEXT
    )
  `);

  // garante colunas mesmo se já existir tabela antiga
  try {
    await run(`ALTER TABLE users ADD COLUMN resetToken TEXT`);
  } catch {}

  try {
    await run(`ALTER TABLE users ADD COLUMN resetTokenExpiresAt TEXT`);
  } catch {}

  try {
    await run(`ALTER TABLE users ADD COLUMN avatarUrl TEXT`);
  } catch {}

  // clients
  await run(`
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      nome TEXT NOT NULL,
      telefone TEXT,
      endereco TEXT,
      createdAt TEXT NOT NULL
    )
  `);

  // orders
  await run(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      clientId TEXT NOT NULL,
      tipo TEXT NOT NULL,
      descricao TEXT NOT NULL,
      obs TEXT,
      valor REAL NOT NULL,
      status TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      scheduledFor TEXT
    )
  `);

  // migrações simples para orders
  try {
    await run(`ALTER TABLE orders ADD COLUMN obs TEXT`);
  } catch {}

  try {
    await run(`ALTER TABLE orders ADD COLUMN scheduledFor TEXT`);
  } catch {}
}
