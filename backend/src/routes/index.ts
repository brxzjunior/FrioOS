// frioos-backend/src/routes/index.ts
import { Router } from "express";
import uploadRoutes from "./upload.routes";

// Controllers de autenticação
import {
  signup,
  login,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller";

// Middleware de autenticação JWT
import { auth } from "../middlewares/auth";

// Controllers de clientes
import {
  listClients,
  createClient,
  updateClient,
  deleteClient,
} from "../controllers/client.controller";

// Controllers de ordens
import {
  listOrders,
  createOrder,
  updateOrderStatus,
  updateOrderPago,
  getOrderById,
  getOrderStats,
  updateOrder,
  deleteOrder,
  getRevenueByMonth,
  getMostUsedServices,
} from "../controllers/order.controller";

// Controllers de usuário
import { me, updateProfile } from "../controllers/user.controller";

const router = Router();

// ─────────────────────────────────────────────────────────────
// 🌐 ROTAS PÚBLICAS — não requerem token
// ─────────────────────────────────────────────────────────────

// ✅ HEALTH CHECK (IMPORTANTE)
router.get("/health", (req, res) => {
  res.status(200).send("OK");
});

router.post("/auth/signup", signup);
router.post("/auth/login", login);
router.post("/auth/forgot-password", forgotPassword);
router.post("/auth/reset-password", resetPassword);

// ─────────────────────────────────────────────────────────────
// 🔒 ROTAS PROTEGIDAS — requerem token JWT válido
// ─────────────────────────────────────────────────────────────
router.use(auth);

// ── Usuário (perfil) ──────────────────────────────────────────
router.get("/me", me);
router.put("/me", updateProfile);
router.put("/user/profile", updateProfile);

// ── Clientes ──────────────────────────────────────────────────
router.get("/clients", listClients);
router.post("/clients", createClient);
router.put("/clients/:id", updateClient);
router.delete("/clients/:id", deleteClient);

// ── Ordens — rotas estáticas
router.get("/orders", listOrders);
router.get("/orders/stats", getOrderStats);
router.get("/orders/revenue/month", getRevenueByMonth);
router.get("/orders/stats/services", getMostUsedServices);

// ── Ordens — rotas dinâmicas
router.get("/orders/:id", getOrderById);
router.post("/orders", createOrder);
router.patch("/orders/:id/status", updateOrderStatus);
router.patch("/orders/:id/pago", updateOrderPago);
router.put("/orders/:id", updateOrder);
router.delete("/orders/:id", deleteOrder);

// ── Upload
router.use("/upload", uploadRoutes);

export default router;