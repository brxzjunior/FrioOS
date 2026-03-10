import { Request, Response } from "express";
import * as orderService from "../services/order.service";

const allowedStatus = ["ABERTA", "ANDAMENTO", "FINALIZADA"] as const;

function getUserId(req: Request) {
  const userId = (req as any).userId as string | undefined;

  if (!userId) {
    throw new Error("Usuário não autenticado.");
  }

  return userId;
}

// garante que o id sempre será string
function getParamId(req: Request) {
  const id = req.params.id;
  return Array.isArray(id) ? id[0] : id;
}

// 📋 LISTAR ORDENS
export async function listOrders(req: Request, res: Response) {
  try {
    const userId = getUserId(req);

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const status = req.query.status as
      | "ABERTA"
      | "ANDAMENTO"
      | "FINALIZADA"
      | undefined;

    if (status && !allowedStatus.includes(status)) {
      return res.status(400).json({
        message: "Status inválido. Use: ABERTA, ANDAMENTO ou FINALIZADA.",
      });
    }

    const orders = await orderService.list(userId, {
      page,
      limit,
      status,
    });

    console.log("GET /orders ->", JSON.stringify(orders, null, 2)); // <= ADD

    return res.json(orders);
  } catch (err: any) {
    return res.status(401).json({
      message: err.message ?? "Não autorizado",
    });
  }
}

// ➕ CRIAR ORDEM
export async function createOrder(req: Request, res: Response) {
  try {
    const userId = getUserId(req);

    const created = await orderService.create(userId, req.body);

    return res.status(201).json(created);
  } catch (err: any) {
    return res.status(400).json({
      message: err.message ?? "Dados inválidos",
    });
  }
}

// 🔎 BUSCAR ORDEM POR ID
export async function getOrderById(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    const id = getParamId(req);

    const order = await orderService.getById(userId, id);

    if (!order) {
      return res.status(404).json({
        message: "Ordem não encontrada",
      });
    }

    return res.json(order);
  } catch (err: any) {
    return res.status(400).json({
      message: err.message ?? "Erro ao buscar ordem",
    });
  }
}

// 🔄 ATUALIZAR STATUS
export async function updateOrderStatus(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    const id = getParamId(req);

    const { status } = req.body as { status?: string };

    if (!status || !allowedStatus.includes(status as any)) {
      return res.status(400).json({
        message: "Status inválido. Use: ABERTA, ANDAMENTO ou FINALIZADA.",
      });
    }

    const updated = await orderService.updateStatus(userId, id, status as any);

    return res.json(updated);
  } catch (err: any) {
    return res.status(400).json({
      message: err.message ?? "Erro ao atualizar status",
    });
  }
}

// 📊 ESTATÍSTICAS
export async function getOrderStats(req: Request, res: Response) {
  try {
    const userId = getUserId(req);

    const stats = await orderService.stats(userId);

    return res.json(stats);
  } catch (err: any) {
    return res.status(400).json({
      message: err.message ?? "Erro ao buscar estatísticas",
    });
  }
}

// ✏️ EDITAR ORDEM
export async function updateOrder(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    const id = getParamId(req);

    const updated = await orderService.update(userId, id, req.body);

    return res.json(updated);
  } catch (err: any) {
    return res.status(400).json({
      message: err.message ?? "Erro ao atualizar ordem",
    });
  }
}

// 🗑️ DELETAR ORDEM
export async function deleteOrder(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    const id = getParamId(req);

    const removed = await orderService.remove(userId, id);

    return res.json(removed);
  } catch (err: any) {
    return res.status(400).json({
      message: err.message ?? "Erro ao deletar ordem",
    });
  }
}
