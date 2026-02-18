import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { get, run } from "../database/db";

function signToken(user: { id: string; email: string }) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET não definido");

  return jwt.sign({ email: user.email }, secret, {
    subject: user.id,
    expiresIn: "7d",
  });
}

export async function signup(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body ?? {};

    if (!name || String(name).trim().length < 2) {
      return res.status(400).json({ message: "Nome inválido" });
    }
    if (!email || !String(email).includes("@")) {
      return res.status(400).json({ message: "Email inválido" });
    }
    if (!password || String(password).length < 6) {
      return res.status(400).json({ message: "Senha mínimo 6 caracteres" });
    }

    const existing = await get<{ id: string }>(
      `SELECT id FROM users WHERE email = ?`,
      [String(email).toLowerCase().trim()],
    );
    if (existing) {
      return res.status(409).json({ message: "Email já cadastrado" });
    }

    const user = {
      id: crypto.randomUUID(),
      name: String(name).trim(),
      email: String(email).toLowerCase().trim(),
      passwordHash: await bcrypt.hash(String(password), 10),
      createdAt: new Date().toISOString(),
    };

    await run(
      `INSERT INTO users (id, name, email, passwordHash, createdAt)
       VALUES (?, ?, ?, ?, ?)`,
      [user.id, user.name, user.email, user.passwordHash, user.createdAt],
    );

    const token = signToken({ id: user.id, email: user.email });

    return res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message ?? "Erro interno" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({ message: "Email e senha obrigatórios" });
    }

    const user = await get<{
      id: string;
      name: string;
      email: string;
      passwordHash: string;
    }>(`SELECT id, name, email, passwordHash FROM users WHERE email = ?`, [
      String(email).toLowerCase().trim(),
    ]);

    if (!user)
      return res.status(401).json({ message: "Credenciais inválidas" });

    const ok = await bcrypt.compare(String(password), user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Credenciais inválidas" });

    const token = signToken({ id: user.id, email: user.email });

    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message ?? "Erro interno" });
  }
}
