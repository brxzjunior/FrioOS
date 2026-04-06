import { Request, Response } from "express";
import * as clientService from "../services/client.service";

function getUserId(req: Request) {
  const userId = (req as any).userId as string | undefined;
  if (!userId) throw new Error("Usuário não autenticado.");
  return userId;
}

export async function listClients(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    const clients = await clientService.list(userId);
    return res.json(clients);
  } catch (err: any) {
    return res.status(401).json({ message: err.message ?? "Não autorizado" });
  }
}

export async function createClient(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    const created = await clientService.create(userId, req.body);
    return res.status(201).json(created);
  } catch (err: any) {
    return res.status(400).json({ message: err.message ?? "Dados inválidos" });
  }
}

export async function updateClient(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    const id = req.params["id"] as string;
    const updated = await clientService.update(userId, id, req.body);
    return res.json(updated);
  } catch (err: any) {
    return res
      .status(400)
      .json({ message: err.message ?? "Erro ao atualizar" });
  }
}

export async function deleteClient(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    const id = req.params["id"] as string;
    await clientService.remove(userId, id);
    return res.status(204).send();
  } catch (err: any) {
    return res.status(400).json({ message: err.message ?? "Erro ao excluir" });
  }
}
