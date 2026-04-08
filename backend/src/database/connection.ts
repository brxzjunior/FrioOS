import { Pool } from "pg";

export const db = new Pool({
  host: "aws-1-us-east-1.pooler.supabase.com",
  port: 5432,
  user: "postgres.oegsevjwdlpdavnafdui",
  password: "Jwn10r13@@@",
  database: "postgres",
  ssl: { rejectUnauthorized: false },
});

db.connect()
  .then(() => console.log("🟣 PostgreSQL conectado"))
  .catch((err) => {
    console.error("❌ Erro ao conectar no PostgreSQL:", err.message);
    console.error("❌ Detalhes:", JSON.stringify(err, null, 2));
  });
