import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  sub: string;
  email: string;
}

export function auth(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token ausente" });
    }

    const token = header.split(" ")[1];

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET não definido");
      return res.status(500).json({ message: "Erro interno" });
    }

    const payload = jwt.verify(token, secret) as JwtPayload;

    // 🔥 salva no request
    (req as any).userId = payload.sub;

    return next();
  } catch (error) {
    console.error("Erro auth:", error);
    return res.status(401).json({ message: "Token inválido" });
  }
}
