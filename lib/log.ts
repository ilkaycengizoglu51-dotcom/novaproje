import { q } from './db';
export async function log(user: { id: number; name: string } | null, what: string) {
  try { await q('INSERT INTO activity (user_id, who, what) VALUES ($1,$2,$3)', [user?.id ?? null, user?.name ?? 'Sistem', what]); } catch (e) { console.error(e); }
}
