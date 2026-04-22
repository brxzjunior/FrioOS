import "dotenv/config";
import express from "express";
import cors from "cors";
import routes from "./routes";
import { initDb } from "./database/schema";
import passport from "passport";
import "./config/googleAuth";
import uploadRoutes from "./routes/upload.routes";

const app = express();
const PORT = process.env.PORT || 3333;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// INIT DB
initDb();

// MIDDLEWARES
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Upload de arquivos
app.use("/upload", uploadRoutes);
app.use("/uploads", express.static("uploads"));

// ==============================
// ROTAS PÚBLICAS (fora do /api)
// ==============================

// Health check simples — sem inserção de dados
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// Google OAuth
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

// Callback do Google
app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${FRONTEND_URL}/login`,
  }),
  (req, res) => {
    const user = req.user as any;

    if (!user) {
      return res.redirect(`${FRONTEND_URL}/login`);
    }

    const jwt = require("jsonwebtoken");
    const secret = process.env.JWT_SECRET!;
    const token = jwt.sign({ email: user.email }, secret, {
      subject: user.id,
      expiresIn: "7d",
    });

    return res.redirect(`${FRONTEND_URL}/login/success?token=${token}`);
  },
);

// ==============================
// API (tudo com /api)
// ==============================
app.use("/api", routes);

// ==============================
// START
// ==============================
app.listen(PORT, () => {
  console.log(`✅ API rodando em http://localhost:${PORT}`);
});