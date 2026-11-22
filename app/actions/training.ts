'use server';
import { revalidatePath } from 'next/cache';
import { getUser } from '@/lib/auth';
import { q } from '@/lib/db';
import { log } from '@/lib/log';
import { PACKAGES, itemsOf, pkgByKey } from '@/lib/training';

const valid = (item: string) => PACKAGES.some((p) => itemsOf(p).includes(item));
export async function toggleItem(f: FormData) {
  const u = await getUser(); if (!u || u.role !== 'client') return;
  const item = String(f.get('item') || ''), on = f.get('on') === '1'; if (!valid(item)) return;
  if (on) await q('INSERT INTO training_progress (user_id, item) VALUES ($1,$2) ON CONFLICT DO NOTHING', [u.id, item]);
  else await q('DELETE FROM training_progress WHERE user_id = $1 AND item = $2', [u.id, item]);
  const key = item.split(':')[0], p = pkgByKey(key);
  if (on && p) { const r = await q('SELECT count(*)::int AS n FROM training_progress WHERE user_id = $1 AND item = ANY($2::text[])', [u.id, itemsOf(p)]); if (r[0].n === itemsOf(p).length) await log(u, `Eğitim paketini tamamladı: ${p.title}`); }
  revalidatePath('/panel/egitimler', 'layout'); revalidatePath('/panel');
}
/** Called by the player when the video reaches its end. */
export async function videoWatched(key: string) {
  const u = await getUser(); if (!u || u.role !== 'client' || !pkgByKey(key)) return;
  await q('INSERT INTO training_progress (user_id, item) VALUES ($1,$2) ON CONFLICT DO NOTHING', [u.id, `${key}:video`]);
  revalidatePath('/panel/egitimler', 'layout');
}
