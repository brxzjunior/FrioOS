import { get, run } from "../database/db";

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
