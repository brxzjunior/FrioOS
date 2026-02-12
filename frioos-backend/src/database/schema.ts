// 🟣 importa a conexão com o banco
import { db } from "./connection";

export function initDb() {
  db.serialize(() => {
    db.run(
      `
      CREATE TABLE IF NOT EXISTS clients (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        telefone TEXT,
        endereco TEXT,
        createdAt TEXT NOT NULL
      )
    `,
      (err) => {
        if (err) {
          console.error("❌ Erro ao criar tabela clients:", err.message);
        } else {
          console.log("🟣 Tabela clients pronta");
        }
      },
    );
  });
}
