import { get, run } from "../database/db";

export async function getUserByEmail(email: string) {
  return get(`SELECT * FROM users WHERE email = ?`, [email]);
}

export async function createUser(data: {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
}) {
  await run(
    `INSERT INTO users (id, name, email, avatarUrl)
     VALUES (?, ?, ?, ?)`,
    [data.id, data.name, data.email, data.avatarUrl || null],
  );

  return getUserByEmail(data.email);
}

export async function saveResetToken(
  userId: string,
  token: string,
  expiresAt: string,
) {
  await run(
    `UPDATE users
     SET resetToken = ?, resetTokenExpiresAt = ?
     WHERE id = ?`,
    [token, expiresAt, userId],
  );
}

export async function getUserByResetToken(token: string) {
  return get(`SELECT * FROM users WHERE resetToken = ?`, [token]);
}

export async function clearResetToken(userId: string) {
  await run(
    `UPDATE users
     SET resetToken = NULL, resetTokenExpiresAt = NULL
     WHERE id = ?`,
    [userId],
  );
}

export async function getUserById(id: string) {
  return get(
    `SELECT id, name, email, avatarUrl 
     FROM users 
     WHERE id = ?`,
    [id],
  );
}

export async function updateUserProfile(
  userId: string,
  data: { name?: string; avatarUrl?: string },
) {
  await run(
    `UPDATE users 
     SET name = ?, avatarUrl = ?
     WHERE id = ?`,
    [data.name, data.avatarUrl, userId],
  );

  return getUserById(userId);
}
