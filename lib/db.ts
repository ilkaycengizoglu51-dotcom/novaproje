import { Pool, type PoolClient } from 'pg';

const g = globalThis as unknown as { __npPool?: Pool };
export function pool() {
  if (!g.__npPool) {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL tanımlı değil.');
    g.__npPool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false }, max: 5 });
  }
  return g.__npPool;
}
export async function q<T = any>(text: string, params: unknown[] = []): Promise<T[]> {
  return (await pool().query(text, params)).rows as T[];
}
export async function one<T = any>(text: string, params: unknown[] = []): Promise<T | null> {
  return (await q<T>(text, params))[0] ?? null;
}
export async function tx<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
  const c = await pool().connect();
  try { await c.query('BEGIN'); const r = await fn(c); await c.query('COMMIT'); return r; }
  catch (e) { await c.query('ROLLBACK'); throw e; }
  finally { c.release(); }
}
