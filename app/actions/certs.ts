'use server';
import { revalidatePath } from 'next/cache';
import { getUser, requireAdmin } from '@/lib/auth';
import { one, q } from '@/lib/db';
import { saveFile } from '@/lib/files';
import { log } from '@/lib/log';
import { adminMail, sendMail, siteUrl } from '@/lib/mail';

const s = (f: FormData, k: string, max = 300) => String(f.get(k) ?? '').trim().slice(0, max);
const re = () => { revalidatePath('/panel', 'layout'); revalidatePath('/yonetim', 'layout'); revalidatePath('/portfoy', 'layout'); };
export type CertState = { error?: string; ok?: string; t?: number };

/** A client uploads their own certificate; a portfolio manager may upload for one of their clients. */
export async function uploadCert(_: CertState, f: FormData): Promise<CertState> {
  const u = await getUser(); if (!u) return { error: 'Oturumunuz kapanmış. Yeniden giriş yapın.' };
  let cid = u.id;
  if (u.role === 'manager') { cid = Number(f.get('client')); if (!(await one(`SELECT 1 FROM users WHERE id = $1 AND manager_id = $2 AND role = 'client'`, [cid, u.id]))) return { error: 'Danışan seçin.' }; }
  else if (u.role !== 'client') return { error: 'Bu işlem danışanlar içindir.' };
  const title = s(f, 'title', 200), issuer = s(f, 'issuer', 200), hours = s(f, 'hours', 40), date = s(f, 'issued_at', 10);
  if (title.length < 3) return { error: 'Eğitimin / sertifikanın adını yazın.' };
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: 'Tarih geçerli değil.' };
  const file = f.get('file') as File | null; if (!file || typeof file === 'string' || !file.size) return { error: 'Sertifika dosyasını seçin (PDF veya fotoğraf).' };
  let fid: string | null = null;
  try { fid = await saveFile(file, { clientId: cid, uploadedBy: u.id }); } catch (e: any) { return { error: e.message }; }
  await q('INSERT INTO certificates (client_id, title, issuer, issued_at, hours, file_id, uploaded_by) VALUES ($1,$2,$3,$4,$5,$6,$7)', [cid, title, issuer || null, date || null, hours || null, fid, u.id]);
  const c = await one('SELECT name FROM users WHERE id = $1', [cid]);
  await log(u, `Sertifika yükledi: ${title}${u.role === 'manager' ? ` (${c?.name} adına)` : ''}`);
  await sendMail(adminMail(), `Yeni sertifika: ${c?.name}`, `${c?.name} için “${title}” sertifikası yüklendi.\nİnceleme: ${siteUrl()}/yonetim/sertifikalar`);
  re(); return { ok: `“${title}” yüklendi. NOVAPROJE inceledikten sonra onaylanacak.`, t: Date.now() };
}
export async function deleteCert(f: FormData) {
  const u = await getUser(); if (!u) return; const id = Number(f.get('id'));
  const c = await one('SELECT * FROM certificates WHERE id = $1', [id]); if (!c) return;
  const ok = u.role === 'admin' || (c.client_id === u.id && c.status !== 'onaylandi'); if (!ok) return;
  await q('DELETE FROM certificates WHERE id = $1', [id]); if (c.file_id) await q('DELETE FROM files WHERE id = $1', [c.file_id]);
  await log(u, `Sertifika sildi: ${c.title}`); re();
}
export async function reviewCert(f: FormData) {
  const a = await requireAdmin(); const id = Number(f.get('id')), act = s(f, 'act', 10);
  const c = await one('SELECT c.*, u.name, u.email FROM certificates c JOIN users u ON u.id = c.client_id WHERE c.id = $1', [id]); if (!c) return;
  if (act === 'ok') { await q(`UPDATE certificates SET status = 'onaylandi', reason = NULL WHERE id = $1`, [id]); await log(a, `Sertifikayı onayladı: ${c.title} · ${c.name}`); }
  if (act === 'no') { const why = s(f, 'reason', 400) || 'Belge okunaklı değil veya eksik; lütfen yeniden yükleyin.'; await q(`UPDATE certificates SET status = 'reddedildi', reason = $2 WHERE id = $1`, [id, why]);
    await sendMail(c.email, `Sertifikanız iade edildi: ${c.title}`, `Sayın ${c.name},\n\n“${c.title}” sertifikanız şu nedenle iade edildi: ${why}\nPanelden yeniden yükleyebilirsiniz: ${siteUrl()}/panel/sertifikalar\n\nNOVAPROJE`); await log(a, `Sertifikayı iade etti: ${c.title} · ${c.name}`); }
  if (act === 'reopen') await q(`UPDATE certificates SET status = 'inceleniyor', reason = NULL WHERE id = $1`, [id]);
  re();
}
