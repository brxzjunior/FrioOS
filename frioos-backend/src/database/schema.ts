import { db } from "./connection";

export function initDb() {
  db.serialize(() => {
    // ✅ users
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        passwordHash TEXT,
        googleId TEXT,
        createdAt TEXT NOT NULL
      )
    `);

    // 🔥 MIGRAÇÃO googleId (caso já exista tabela)
    db.all(`PRAGMA table_info(users)`, (err, rows: any[]) => {
      if (err) return;

      const hasGoogleId = rows.some((r) => r.name === "googleId");
      if (!hasGoogleId) {
        db.run(`ALTER TABLE users ADD COLUMN googleId TEXT`);
      }

      const hasPasswordHash = rows.some((r) => r.name === "passwordHash");
      // (já existe, mas deixei aqui como padrão de migração)
    });

    // ✅ clients
    db.run(`
      CREATE TABLE IF NOT EXISTS clients (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        nome TEXT NOT NULL,
        telefone TEXT,
        endereco TEXT,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);

    // ✅ orders
    db.run(`
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
        scheduledFor TEXT,
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (clientId) REFERENCES clients(id)
      )
    `);

    // 🔥 MIGRAÇÕES orders
    db.all(`PRAGMA table_info(orders)`, (err, rows: any[]) => {
      if (err) return;

      const hasObs = rows.some((r) => r.name === "obs");
      if (!hasObs) {
        db.run(`ALTER TABLE orders ADD COLUMN obs TEXT`);
      }

      const hasScheduledFor = rows.some((r) => r.name === "scheduledFor");
      if (!hasScheduledFor) {
        db.run(`ALTER TABLE orders ADD COLUMN scheduledFor TEXT`);
      }
    });
  });
}
