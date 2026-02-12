import { Request, Response } from "express";
import * as clientService from "../services/client.service";

export async function listClients(req: Request, res: Response) {
  try {
    const clients = await clientService.list();
    return res.json(clients); // 🟢 resposta pro front
  } catch (err: any) {
    return res.status(500).json({ message: err.message ?? "Erro interno" });
  }
}

export async function createClient(req: Request, res: Response) {
  try {
    const created = await clientService.create(req.body);
    return res.status(201).json(created); // 🟢 resposta pro front
  } catch (err: any) {
    return res.status(400).json({ message: err.message ?? "Dados inválidos" });
  }
}
