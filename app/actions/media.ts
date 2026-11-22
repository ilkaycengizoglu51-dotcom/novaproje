'use server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { one, q } from '@/lib/db';
import { saveFile } from '@/lib/files';
import { log } from '@/lib/log';
import { sendMail, siteUrl } from '@/lib/mail';

const re = (pid: number) => { revalidatePath(`/yonetim/projeler/${pid}`); revalidatePath('/panel', 'layout'); revalidatePath('/portfoy', 'layout'); };
export async function addMedia(f: FormData): Promise<{ error?: string; ok?: string }> {
  const a = await requireAdmin(); const pid = Number(f.get('project'));
  const p = await one('SELECT p.id, p.name, p.client_id, c.name AS cname, c.email AS cemail, m.name AS mname, m.email AS memail FROM projects p JOIN users c ON c.id = p.client_id LEFT JOIN users m ON m.id = c.manager_id WHERE p.id = $1', [pid]);
  if (!p) return { error: 'Proje bulunamadı.' };
  const ms = Number(f.get('milestone')) || null, cap = String(f.get('caption') || '').trim().slice(0, 300) || null, d = String(f.get('taken_at') || '');
  const sc = f.get('show_client') === 'on', sm = f.get('show_manager') === 'on';
  const files = f.getAll('files').filter((x) => x && typeof x !== 'string' && (x as File).size) as File[];
  if (!files.length) return { error: 'Görsel seçin.' };
  let n = 0; const errs: string[] = [];
  for (const file of files) {
    try { const fid = await saveFile(file, { clientId: p.client_id, uploadedBy: a.id, images: true });
      if (fid) { await q('INSERT INTO project_media (project_id, milestone_id, file_id, caption, taken_at, show_client, show_manager) VALUES ($1,$2,$3,$4,$5,$6,$7)', [pid, ms, fid, cap, /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null, sc, sm]); n++; } }
    catch (e: any) { errs.push(e.message); }
  }
  if (n) {
    await log(a, `${n} aşama görseli yükledi: ${p.name}`);
    const body = (to: string) => `Sayın ${to},\n\n“${p.name}” projesinden ${n} yeni aşama görseli paylaşıldı${cap ? `: ${cap}` : ''}.\n\n`;
    if (sc) await sendMail(p.cemail, `Projenizden yeni görseller: ${p.name}`, body(p.cname) + `${siteUrl()}/panel/proje/${pid}\n\nNOVAPROJE`);
    if (sm) await sendMail(p.memail, `Danışanınızın projesinden yeni görseller: ${p.cname}`, body(p.mname) + `${siteUrl()}/portfoy/danisanlar\n\nNOVAPROJE`);
  }
  re(pid);
  return errs.length ? { error: errs.join(' '), ok: n ? `${n} görsel yüklendi.` : undefined } : { ok: `${n} görsel yüklendi${sc || sm ? ' ve paylaşıldı' : ''}.` };
}
export async function setMedia(f: FormData) {
  await requireAdmin(); const id = Number(f.get('id')), act = String(f.get('act'));
  const m = await one('SELECT project_id, file_id FROM project_media WHERE id = $1', [id]); if (!m) return;
  if (act === 'client') await q('UPDATE project_media SET show_client = NOT show_client WHERE id = $1', [id]);
  if (act === 'manager') await q('UPDATE project_media SET show_manager = NOT show_manager WHERE id = $1', [id]);
  if (act === 'delete') { await q('DELETE FROM project_media WHERE id = $1', [id]); await q('DELETE FROM files WHERE id = $1', [m.file_id]); }
  re(m.project_id);
}
