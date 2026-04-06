import { Router } from "express";
import uploadRoutes from "./upload.routes";

import {
  signup,
  login,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller";
import { auth } from "../middlewares/auth";

import {
  listClients,
  createClient,
  updateClient,
  deleteClient,
} from "../controllers/client.controller";

import {
  listOrders,
  createOrder,
  updateOrderStatus,
  getOrderById,
  getOrderStats,
  updateOrder,
  deleteOrder,
  getRevenueByMonth,
  getMostUsedServices,
} from "../controllers/order.controller";

import { me, updateProfile } from "../controllers/user.controller";

const router = Router();

// ── PÚBLICAS ──────────────────────────────────────────────
router.post("/auth/signup", signup);
router.post("/auth/login", login);
router.post("/auth/forgot-password", forgotPassword);
router.post("/auth/reset-password", resetPassword);

// ── PROTEGIDAS ────────────────────────────────────────────
router.use(auth);

// 👤 USUÁRIO
router.get("/me", me);
router.put("/me", updateProfile);
router.put("/user/profile", updateProfile);

// 👥 CLIENTES
router.get("/clients", listClients);
router.post("/clients", createClient);
router.put("/clients/:id", updateClient);
router.delete("/clients/:id", deleteClient);

// 📦 ORDENS
router.get("/orders", listOrders);
router.get("/orders/stats", getOrderStats);
router.get("/orders/revenue/month", getRevenueByMonth);
router.get("/orders/stats/services", getMostUsedServices);
router.get("/orders/:id", getOrderById);
router.post("/orders", createOrder);
router.patch("/orders/:id/status", updateOrderStatus);
router.put("/orders/:id", updateOrder);
router.delete("/orders/:id", deleteOrder);

// 📎 UPLOAD
router.use("/upload", uploadRoutes);

export default router;
