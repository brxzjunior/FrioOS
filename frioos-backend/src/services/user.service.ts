import { db } from "../database/connection";
import { randomUUID } from "crypto";

// 🔍 Buscar usuário por email
export async function findUserByEmail(email: string) {
  return new Promise<any>((resolve, reject) => {
    db.get(
      "SELECT * FROM users WHERE email = ?",
      [email],
      (err: any, row: any) => {
        if (err) return reject(err);
        resolve(row);
      },
    );
  });
}

// ➕ Criar usuário (Google ou normal)
export async function createUser({
  name,
  email,
  googleId,
}: {
  name: string;
  email: string;
  googleId?: string;
}) {
  return new Promise<any>((resolve, reject) => {
    const id = randomUUID();
    const createdAt = new Date().toISOString();

    db.run(
      `
      INSERT INTO users (id, name, email, googleId, createdAt)
      VALUES (?, ?, ?, ?, ?)
      `,
      [id, name, email, googleId || null, createdAt],
      function (err: any) {
        if (err) return reject(err);

        resolve({
          id,
          name,
          email,
          googleId: googleId || null,
          createdAt,
        });
      },
    );
  });
}
