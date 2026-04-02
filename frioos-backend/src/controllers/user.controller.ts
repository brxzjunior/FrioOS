// src/controllers/user.controller.ts
import { Request, Response } from "express";
import { getUserById, updateUserProfile } from "../services/user.service";

export async function me(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    const user = await getUserById(userId);

    return res.json(user);
  } catch (err: any) {
    return res.status(500).json({
      message: err.message || "Erro ao buscar usuário",
    });
  }
}

export async function updateProfile(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    const { name, avatarUrl } = req.body;

    const user = await updateUserProfile(userId, {
      name,
      avatarUrl,
    });

    return res.json(user);
  } catch (err: any) {
    return res.status(500).json({
      message: err.message || "Erro ao atualizar perfil",
    });
  }
}
