// frioos-backend/src/controllers/order.controller.ts
// ─────────────────────────────────────────────────────────────
// Controller HTTP para ordens de serviço.
// Cada função extrai userId do token (via middleware auth),
// delega para o service e trata erros com status adequado.
// ─────────────────────────────────────────────────────────────
import { Request, Response } from "express";
import * as orderService from "../services/order.service";

const allowedStatus = ["ABERTA", "ANDAMENTO", "FINALIZADA"] as const;

// ── Helpers ───────────────────────────────────────────────────

/** Extrai userId injetado pelo middleware de autenticação */
function getUserId(req: Request): string {
  const userId = (req as any).userId as string | undefined;
  if (!userId) throw new Error("Usuário não autenticado.");
  return userId;
}

/** Garante que req.params.id seja string (Express pode retornar string[]) */
function getParamId(req: Request): string {
  const id = req.params.id;
  return Array.isArray(id) ? id[0] : id;
}

// ── FATURAMENTO & SERVIÇOS ────────────────────────────────────

/** GET /orders/revenue/month — faturamento agrupado por mês */
export async function getRevenueByMonth(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    const data = await orderService.revenueByMonth(userId);
    return res.json(data);
  } catch (err: any) {
    return res
      .status(500)
      .json({ message: err.message ?? "Erro ao buscar faturamento" });
  }
}

/** GET /orders/stats/services — tipos de serviço mais realizados */
export async function getMostUsedServices(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    const data = await orderService.mostUsedService(userId);
    return res.json(data);
  } catch (err: any) {
    return res
      .status(500)
      .json({ message: err.message ?? "Erro ao buscar serviços" });
  }
}

// ── LISTAR ────────────────────────────────────────────────────

/** GET /orders — lista paginada com filtro opcional de status */
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
      return res.status(400).json({ message: "Status inválido." });
    }

    const orders = await orderService.list(userId, { page, limit, status });
    return res.json(orders);
  } catch (err: any) {
    return res.status(401).json({ message: err.message ?? "Não autorizado" });
  }
}

// ── CRIAR ─────────────────────────────────────────────────────

/** POST /orders — cria nova OS (pago começa como false) */
export async function createOrder(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    const created = await orderService.create(userId, req.body);
    return res.status(201).json(created);
  } catch (err: any) {
    return res.status(400).json({ message: err.message ?? "Dados inválidos" });
  }
}

// ── BUSCAR POR ID ─────────────────────────────────────────────

/** GET /orders/:id — retorna uma OS específica */
export async function getOrderById(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    const id = getParamId(req);
    const order = await orderService.getById(userId, id);

    if (!order)
      return res.status(404).json({ message: "Ordem não encontrada" });
    return res.json(order);
  } catch (err: any) {
    return res
      .status(400)
      .json({ message: err.message ?? "Erro ao buscar ordem" });
  }
}

// ── ATUALIZAR STATUS ──────────────────────────────────────────

/** PATCH /orders/:id/status — altera o progresso do serviço */
export async function updateOrderStatus(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    const id = getParamId(req);
    const { status } = req.body as { status?: string };

    if (!status || !allowedStatus.includes(status as any)) {
      return res.status(400).json({ message: "Status inválido." });
    }

    const updated = await orderService.updateStatus(userId, id, status as any);
    return res.json(updated);
  } catch (err: any) {
    return res
      .status(400)
      .json({ message: err.message ?? "Erro ao atualizar status" });
  }
}

// ── ATUALIZAR PAGAMENTO ───────────────────────────────────────

/**
 * PATCH /orders/:id/pago — marca ou desmarca a OS como paga.
 *
 * Body: { pago: boolean }
 *
 * Separado do status propositalmente: o pagamento é uma
 * dimensão financeira independente do progresso do serviço.
 * Uma OS pode ser paga antecipadamente ou ter o pagamento
 * estornado sem alterar seu status de execução.
 */
export async function updateOrderPago(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    const id = getParamId(req);
    const { pago } = req.body as { pago?: boolean };

    if (typeof pago !== "boolean") {
      return res
        .status(400)
        .json({ message: "Campo 'pago' deve ser boolean." });
    }

    const updated = await orderService.updatePago(userId, id, pago);
    return res.json(updated);
  } catch (err: any) {
    return res
      .status(400)
      .json({ message: err.message ?? "Erro ao atualizar pagamento" });
  }
}

// ── STATS ─────────────────────────────────────────────────────

/** GET /orders/stats — contagens por status para o dashboard */
export async function getOrderStats(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    const result = await orderService.stats(userId);
    return res.json(result);
  } catch (err: any) {
    if (err.message === "Usuário não autenticado.") {
      return res.status(401).json({ message: err.message });
    }
    return res
      .status(500)
      .json({ message: err.message ?? "Erro ao buscar estatísticas" });
  }
}

// ── EDITAR ────────────────────────────────────────────────────

/** PUT /orders/:id — edita campos descritivos da OS */
export async function updateOrder(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    const id = getParamId(req);
    const updated = await orderService.update(userId, id, req.body);
    return res.json(updated);
  } catch (err: any) {
    return res
      .status(400)
      .json({ message: err.message ?? "Erro ao atualizar ordem" });
  }
}

// ── DELETAR ───────────────────────────────────────────────────

/** DELETE /orders/:id — remove a OS permanentemente */
export async function deleteOrder(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    const id = getParamId(req);
    const removed = await orderService.remove(userId, id);
    return res.json(removed);
  } catch (err: any) {
    return res
      .status(400)
      .json({ message: err.message ?? "Erro ao deletar ordem" });
  }
}
