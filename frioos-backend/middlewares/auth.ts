import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

type JwtPayload = { sub: string; email: string };

export function auth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token ausente" });
  }

  const token = header.replace("Bearer ", "");
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET não definido");

    const payload = jwt.verify(token, secret) as JwtPayload;

    // anexar userId na request
    (req as any).userId = payload.sub;

    return next();
  } catch {
    return res.status(401).json({ message: "Token inválido" });
  }
}
