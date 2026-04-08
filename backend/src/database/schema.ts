import { run } from "./db";

export async function initDb() {
  // ── USERS ──────────────────────────────────────────────────
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id                  TEXT PRIMARY KEY,
      name                TEXT,
      email               TEXT UNIQUE,
      "passwordHash"      TEXT,
      "avatarUrl"         TEXT,
      "createdAt"         TEXT,
      "resetToken"        TEXT,
      "resetTokenExpiresAt" TEXT
    )
  `);

  await run(`ALTER TABLE users ADD COLUMN IF NOT EXISTS "resetToken" TEXT`);
  await run(
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS "resetTokenExpiresAt" TEXT`,
  );
  await run(`ALTER TABLE users ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT`);

  // ── CLIENTS ────────────────────────────────────────────────
  await run(`
    CREATE TABLE IF NOT EXISTS clients (
      id        TEXT PRIMARY KEY,
      "userId"  TEXT NOT NULL,
      nome      TEXT NOT NULL,
      telefone  TEXT,
      endereco  TEXT,
      "createdAt" TEXT NOT NULL
    )
  `);

  // ── ORDERS ─────────────────────────────────────────────────
  await run(`
    CREATE TABLE IF NOT EXISTS orders (
      id            TEXT PRIMARY KEY,
      "userId"      TEXT NOT NULL,
      "clientId"    TEXT NOT NULL,
      tipo          TEXT NOT NULL,
      descricao     TEXT NOT NULL,
      obs           TEXT,
      valor         REAL NOT NULL,
      status        TEXT NOT NULL,
      "createdAt"   TEXT NOT NULL,
      "scheduledFor" TEXT,
      pago          INTEGER NOT NULL DEFAULT 0
    )
  `);

  await run(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS obs TEXT`);
  await run(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS "scheduledFor" TEXT`);
  await run(
    `ALTER TABLE orders ADD COLUMN IF NOT EXISTS pago INTEGER NOT NULL DEFAULT 0`,
  );
}
