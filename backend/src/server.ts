import express from "express";
import cors from "cors";
import routes from "./routes";
import { initDb } from "./database/schema";
import "dotenv/config";
import passport from "passport";
import "./config/googleAuth";
import { generateToken } from "./utils/generateToken";
import uploadRoutes from "./routes/upload.routes";

const app = express();
const PORT = process.env.PORT || 3333;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${PORT}`;

// 🔥 INIT DB
initDb();

// 🔥 MIDDLEWARES
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Upload fotos
app.use("/upload", uploadRoutes);
app.use("/uploads", express.static("uploads"));

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
    failureRedirect: `${FRONTEND_URL}/login`,
  }),
  (req, res) => {
    console.log("🔥 CALLBACK GOOGLE");

    const user = req.user;

    if (!user) {
      console.log("❌ Usuário não encontrado no callback");
      return res.redirect(`${FRONTEND_URL}/login`);
    }

    const token = generateToken(user);

    console.log("✅ TOKEN GERADO");

    res.redirect(`${FRONTEND_URL}/login/success?token=${token}`);
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
