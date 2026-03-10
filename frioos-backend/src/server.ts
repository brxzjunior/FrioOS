import express from "express";
import cors from "cors";
import routes from "./routes";
import { initDb } from "./database/schema";
import "dotenv/config";

const app = express();

initDb();

app.use(cors());
app.use(express.json());

// ⬇️ IMPORTANTE: apenas isso
app.use("/api", routes);

app.get("/", (req, res) => {
  res.send("API FrioOS online ✅");
});

app.listen(3333, () => {
  console.log("✅ API rodando em http://localhost:3333");
});
