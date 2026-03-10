import { Router } from "express";
import { signup, login } from "../controllers/auth.controller";
import { auth } from "../middlewares/auth";

import { listClients, createClient } from "../controllers/client.controller";

import {
  listOrders,
  createOrder,
  updateOrderStatus,
  getOrderById,
  getOrderStats,
} from "../controllers/order.controller";

const router = Router();

// =============================
// 🌐 ROTAS PÚBLICAS (SEM TOKEN)
// =============================
router.post("/auth/signup", signup);
router.post("/auth/login", login);

// =============================
// 🔒 ROTAS PROTEGIDAS (COM TOKEN)
// =============================
router.use(auth);

// 👥 CLIENTES
router.get("/clients", listClients);
router.post("/clients", createClient);

// 📦 ORDENS
router.get("/orders", listOrders);

// 📊 ESTATÍSTICAS (ANTES DO :id)
router.get("/orders/stats", getOrderStats);

// 🔎 BUSCAR POR ID
router.get("/orders/:id", getOrderById);

// ➕ CRIAR ORDEM
router.post("/orders", createOrder);

// 🔄 ATUALIZAR STATUS
router.patch("/orders/:id/status", updateOrderStatus);

export default router;
