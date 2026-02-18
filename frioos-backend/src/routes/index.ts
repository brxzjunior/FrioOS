import { Router } from "express";
import { signup, login } from "../controllers/auth.controller";
import { auth } from "../middlewares/auth";

import { listClients, createClient } from "../controllers/client.controller";

import {
  listOrders,
  createOrder,
  updateOrderStatus,
} from "../controllers/order.controller";

const router = Router();

//
// 🟣 CLIENTS
//
router.get("/clients", listClients);
router.post("/clients", createClient);

//
// 🟣 ORDERS
//
router.get("/orders", listOrders);
router.post("/orders", createOrder);

// 🔵 ETAPA 3: atualizar status da OS
router.patch("/orders/:id/status", updateOrderStatus);

//ROTAS PUBLICAS
router.post("/auth/signup", signup);
router.post("/auth/login", login);

router.use(auth); // tudo abaixo precisa estar logado

router.get("/clients", listClients);
router.post("/clients", createClient);
router.get("/orders", listOrders);
router.post("/orders", createOrder);
router.patch("/orders/:id/status", updateOrderStatus);

export default router;
