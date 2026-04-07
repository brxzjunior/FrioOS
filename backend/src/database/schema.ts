// src/database/schema.ts
// ─────────────────────────────────────────────────────────────
// Inicialização e migrações do banco SQLite.
// Cada bloco try/catch de ALTER TABLE é uma migração segura:
// falha silenciosamente se a coluna já existir.
// ─────────────────────────────────────────────────────────────
import { run } from "./db";

export async function initDb() {
  // ── USERS ──────────────────────────────────────────────────
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id                  TEXT PRIMARY KEY,
      name                TEXT,
      email               TEXT UNIQUE,
      passwordHash        TEXT,
      avatarUrl           TEXT,
      createdAt           TEXT,
      resetToken          TEXT,
      resetTokenExpiresAt TEXT
    )
  `);

  // Migrações de colunas opcionais na tabela users
  try {
    await run(`ALTER TABLE users ADD COLUMN resetToken TEXT`);
  } catch {}
  try {
    await run(`ALTER TABLE users ADD COLUMN resetTokenExpiresAt TEXT`);
  } catch {}
  try {
    await run(`ALTER TABLE users ADD COLUMN avatarUrl TEXT`);
  } catch {}

  // ── CLIENTS ────────────────────────────────────────────────
  await run(`
    CREATE TABLE IF NOT EXISTS clients (
      id        TEXT PRIMARY KEY,
      userId    TEXT NOT NULL,
      nome      TEXT NOT NULL,
      telefone  TEXT,
      endereco  TEXT,
      createdAt TEXT NOT NULL
    )
  `);

  // ── ORDERS ─────────────────────────────────────────────────
  await run(`
    CREATE TABLE IF NOT EXISTS orders (
      id           TEXT PRIMARY KEY,
      userId       TEXT NOT NULL,
      clientId     TEXT NOT NULL,
      tipo         TEXT NOT NULL,
      descricao    TEXT NOT NULL,
      obs          TEXT,
      valor        REAL NOT NULL,
      status       TEXT NOT NULL,
      createdAt    TEXT NOT NULL,
      scheduledFor TEXT,
      pago         INTEGER NOT NULL DEFAULT 0
    )
  `);

  // Migrações de colunas opcionais na tabela orders
  try {
    await run(`ALTER TABLE orders ADD COLUMN obs TEXT`);
  } catch {}
  try {
    await run(`ALTER TABLE orders ADD COLUMN scheduledFor TEXT`);
  } catch {}

  // ✅ NOVA MIGRAÇÃO: campo de pagamento
  // INTEGER usado como boolean: 0 = não pago, 1 = pago
  // DEFAULT 0 garante que OS antigas não quebrem
  try {
    await run(`ALTER TABLE orders ADD COLUMN pago INTEGER NOT NULL DEFAULT 0`);
  } catch {}
}
