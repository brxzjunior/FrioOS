import { Router } from "express";

import {
  signup,
  login,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller";
import { auth } from "../middlewares/auth";

import { listClients, createClient } from "../controllers/client.controller";

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

// =============================
// 🌐 ROTAS PÚBLICAS (SEM TOKEN)
// =============================
router.post("/auth/signup", signup);
router.post("/auth/login", login);
router.post("/auth/forgot-password", forgotPassword);
router.post("/auth/reset-password", resetPassword);

// =============================
// 🔒 ROTAS PROTEGIDAS (COM TOKEN)
// =============================
router.use(auth);

// 👤 USUÁRIO (perfil)
router.get("/me", me);
router.put("/me", updateProfile);
router.put("/user/profile", updateProfile);

// 👥 CLIENTES
router.get("/clients", listClients);
router.post("/clients", createClient);

// 📦 ORDENS
router.get("/orders", listOrders);

// 📊 ESTATÍSTICAS (ANTES DO :id)
router.get("/orders/stats", getOrderStats);

// 💰 FATURAMENTO POR MÊS
router.get("/orders/revenue/month", getRevenueByMonth);

// 🔧 SERVIÇOS MAIS FEITOS
router.get("/orders/stats/services", getMostUsedServices);

// 🔎 BUSCAR POR ID
router.get("/orders/:id", getOrderById);

// ➕ CRIAR ORDEM
router.post("/orders", createOrder);

// 🔄 ATUALIZAR STATUS
router.patch("/orders/:id/status", updateOrderStatus);

// ✏️ EDITAR ORDEM
router.put("/orders/:id", updateOrder);

// 🗑️ DELETAR ORDEM
router.delete("/orders/:id", deleteOrder);

export default router;
