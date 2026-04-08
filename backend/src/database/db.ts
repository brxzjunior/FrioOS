import { db } from "./connection";

// INSERT / UPDATE / DELETE
export async function run(sql: string, params: any[] = []) {
  // PostgreSQL usa $1, $2... em vez de ?
  await db.query(sql, params);
}

// SELECT múltiplos registros
export async function all<T = any>(
  sql: string,
  params: any[] = [],
): Promise<T[]> {
  const result = await db.query(sql, params);
  return result.rows as T[];
}

// SELECT único registro
export async function get<T = any>(
  sql: string,
  params: any[] = [],
): Promise<T | undefined> {
  const result = await db.query(sql, params);
  return result.rows[0] as T | undefined;
}
