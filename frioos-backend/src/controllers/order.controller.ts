import { Request, Response } from "express";
import * as orderService from "../services/order.service";

const allowedStatus = ["ABERTA", "ANDAMENTO", "FINALIZADA"] as const;

function getUserId(req: Request) {
  const userId = (req as any).userId as string | undefined;
  if (!userId) throw new Error("Usuário não autenticado.");
  return userId;
}

// 📋 LISTAR ORDENS
export async function listOrders(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    const orders = await orderService.list(userId);
    return res.json(orders);
  } catch (err: any) {
    return res.status(401).json({ message: err.message ?? "Não autorizado" });
  }
}

// ➕ CRIAR ORDEM
export async function createOrder(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    const created = await orderService.create(userId, req.body);
    return res.status(201).json(created);
  } catch (err: any) {
    return res.status(400).json({ message: err.message ?? "Dados inválidos" });
  }
}

// 🔎 BUSCAR ORDEM POR ID
export async function getOrderById(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    const order = await orderService.getById(userId, id);

    if (!order) {
      return res.status(404).json({ message: "Ordem não encontrada" });
    }

    return res.json(order);
  } catch (err: any) {
    return res
      .status(400)
      .json({ message: err.message ?? "Erro ao buscar ordem" });
  }
}

// 🔄 ATUALIZAR STATUS
export async function updateOrderStatus(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    const body = (req.body ?? {}) as { status?: string };
    const status = body.status;

    if (!status || !allowedStatus.includes(status as any)) {
      return res.status(400).json({
        message: "Status inválido. Use: ABERTA, ANDAMENTO ou FINALIZADA.",
      });
    }

    const updated = await orderService.updateStatus(userId, id, status as any);
    return res.json(updated);
  } catch (err: any) {
    return res
      .status(400)
      .json({ message: err.message ?? "Erro ao atualizar status" });
  }
}

// 📊 ESTATÍSTICAS DAS ORDENS
export async function getOrderStats(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    const stats = await orderService.stats(userId);
    return res.json(stats);
  } catch (err: any) {
    return res
      .status(400)
      .json({ message: err.message ?? "Erro ao buscar estatísticas" });
  }
}
