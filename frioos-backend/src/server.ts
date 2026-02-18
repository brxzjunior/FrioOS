import express from "express";
import cors from "cors";
import routes from "./routes";
import { initDb } from "./database/schema";
import "dotenv/config";

const app = express(); // ✅ primeiro cria o app

initDb(); // 🟣 depois prepara o banco

app.use(cors());
app.use(express.json());

// ✅ depois registra rotas
app.use("/api", routes);

// opcional (rota raiz)
app.get("/", (req, res) => {
  res.send("API FrioOS online ✅");
});

app.listen(3333, () => {
  console.log("✅ API rodando em http://localhost:3333");
});
