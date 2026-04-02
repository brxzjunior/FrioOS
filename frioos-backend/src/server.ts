import express from "express";
import cors from "cors";
import routes from "./routes";
import { initDb } from "./database/schema";
import "dotenv/config";
import passport from "passport";
import "./config/googleAuth";
import { generateToken } from "./utils/generateToken";

const app = express();
const PORT = 3333;

// 🔥 INIT DB
initDb();

// 🔥 MIDDLEWARES
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// =============================
// 🔓 ROTAS PÚBLICAS (FORA DO /api)
// =============================

// teste
app.get("/auth/test", (req, res) => {
  console.log("✅ /auth/test funcionando");
  res.send("AUTH OK");
});

// GOOGLE LOGIN
app.get(
  "/auth/google",
  (req, res, next) => {
    console.log("🔥 /auth/google chamada");
    next();
  },
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
);

// CALLBACK GOOGLE
app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "http://localhost:5173/login",
  }),
  (req, res) => {
    console.log("🔥 CALLBACK GOOGLE");

    const user = req.user;

    if (!user) {
      console.log("❌ Usuário não encontrado no callback");
      return res.redirect("http://localhost:5173/login");
    }

    const token = generateToken(user);

    console.log("✅ TOKEN GERADO");

    res.redirect(`http://localhost:5173/login/success?token=${token}`);
  },
);

// =============================
// 🔐 API (TUDO COM /api)
// =============================
app.use("/api", routes);

// =============================
// ROOT
// =============================
app.get("/", (req, res) => {
  res.send("API FrioOS online ✅");
});

// =============================
// START
// =============================
app.listen(PORT, () => {
  console.log(`✅ API rodando em http://localhost:${PORT}`);
});
