import { Pool } from "pg";

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

db.connect()
  .then(() => console.log("🟣 PostgreSQL conectado"))
  .catch((err) => {
    console.error("❌ Erro ao conectar no PostgreSQL:", err.message);
    console.error("❌ Detalhes:", JSON.stringify(err, null, 2));
  });
