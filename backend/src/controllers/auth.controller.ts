import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { get, run } from "../database/db";
import { sendEmail } from "../utils/sendEmail";
import { isValidEmail, isBlockedEmail } from "../utils/validators";
import { generateResetToken } from "../utils/generateResetToken";
import { saveResetToken, getUserByResetToken } from "../services/user.service";

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
    const { name, email, password } = req.body;

    if (!name || name.trim().length < 2)
      return res.status(400).json({ message: "Nome inválido" });

    const normalizedEmail = email?.toLowerCase().trim();

    if (!normalizedEmail || !isValidEmail(normalizedEmail))
      return res.status(400).json({ message: "Email inválido" });

    if (isBlockedEmail(normalizedEmail))
      return res.status(400).json({ message: "Email não permitido" });

    if (!password || password.length < 6)
      return res.status(400).json({ message: "Senha mínimo 6 caracteres" });

    const existing = await get<{ id: string }>(
      `SELECT id FROM users WHERE email = $1`,
      [normalizedEmail],
    );

    if (existing)
      return res.status(409).json({ message: "Email já cadastrado" });

    const user = {
      id: randomUUID(),
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: await bcrypt.hash(password, 10),
      avatarUrl: null,
      createdAt: new Date().toISOString(),
    };

    await run(
      `INSERT INTO users (id, name, email, "passwordHash", "avatarUrl", "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        user.id,
        user.name,
        user.email,
        user.passwordHash,
        user.avatarUrl,
        user.createdAt,
      ],
    );

    const token = signToken({ id: user.id, email: user.email });

    return res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || "Erro interno" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email e senha obrigatórios" });

    const normalizedEmail = email.toLowerCase().trim();

    if (!isValidEmail(normalizedEmail))
      return res.status(400).json({ message: "Email inválido" });

    const user = await get<{
      id: string;
      name: string;
      email: string;
      passwordHash: string;
      avatarUrl?: string;
    }>(
      `SELECT id, name, email, "passwordHash", "avatarUrl" FROM users WHERE email = $1`,
      [normalizedEmail],
    );

    if (!user)
      return res.status(401).json({ message: "Credenciais inválidas" });

    const validPassword = await bcrypt.compare(password, user.passwordHash);

    if (!validPassword)
      return res.status(401).json({ message: "Credenciais inválidas" });

    const token = signToken({ id: user.id, email: user.email });

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || "Erro interno" });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;

    const user = await get(`SELECT * FROM users WHERE email = $1`, [email]);

    if (!user) return res.json({ message: "Se existir, enviaremos o email." });

    const token = generateResetToken();
    const expires = new Date(Date.now() + 1000 * 60 * 15).toISOString();

    await saveResetToken(user.id, token, expires);

    const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
    const link = `${FRONTEND_URL}/reset-password?token=${token}`;

    await sendEmail(
      email,
      "Recuperação de senha - FrioOS",
      `
      <div style="font-family:sans-serif">
        <h2>Recuperação de senha</h2>
        <p>Clique no botão abaixo para redefinir sua senha:</p>
        <a href="${link}" 
           style="display:inline-block;padding:10px 20px;
           background:#2dd4bf;color:#000;text-decoration:none;border-radius:6px">
           Resetar senha
        </a>
        <p>Esse link expira em 15 minutos.</p>
      </div>
      `,
    );

    return res.json({ message: "Email enviado!" });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword)
      return res
        .status(400)
        .json({ message: "Token e nova senha são obrigatórios" });

    if (newPassword.length < 6)
      return res
        .status(400)
        .json({ message: "Senha deve ter pelo menos 6 caracteres" });

    const user = await getUserByResetToken(token);

    if (!user) return res.status(400).json({ message: "Token inválido" });

    if (!user.resetTokenExpiresAt)
      return res.status(400).json({ message: "Token inválido" });

    if (new Date(user.resetTokenExpiresAt) < new Date())
      return res.status(400).json({ message: "Token expirado" });

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await run(
      `UPDATE users 
       SET "passwordHash" = $1, "resetToken" = NULL, "resetTokenExpiresAt" = NULL
       WHERE id = $2`,
      [passwordHash, user.id],
    );

    return res.json({ ok: true });
  } catch (err: any) {
    return res
      .status(500)
      .json({ message: err.message || "Erro ao resetar senha" });
  }
}
