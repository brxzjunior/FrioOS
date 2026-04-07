import sqlite3 from "sqlite3";
import path from "path";

const dbPath =
  process.env.DB_PATH || path.resolve(process.cwd(), "database.sqlite");

export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Erro ao conectar no SQLite:", err.message);
  } else {
    console.log("🟣 SQLite conectado:", dbPath);
  }
});
