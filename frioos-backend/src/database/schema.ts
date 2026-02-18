import { db } from "./connection";

export function initDb() {
  db.serialize(() => {
    // ✅ clients
    db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    passwordHash TEXT NOT NULL,
    createdAt TEXT NOT NULL
  )
`);

    // ✅ orders (agora com obs)
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
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (clientId) REFERENCES clients(id)
  )
`);

    // 🟣 Migração simples: se a tabela já existia sem obs, adiciona a coluna
    db.all(`PRAGMA table_info(orders)`, (err, rows: any[]) => {
      if (err) return;

      const hasObs = rows.some((r) => r.name === "obs");
      if (!hasObs) {
        db.run(`ALTER TABLE orders ADD COLUMN obs TEXT`);
      }
    });
  });
}
