
'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireManager } from '@/lib/auth';
import { one, q } from '@/lib/db';
import { TYPES } from '@/lib/format';
import { saveFile } from '@/lib/files';
import { log } from '@/lib/log';
import { adminMail, sendMail, siteUrl } from '@/lib/mail';

const s = (f: FormData, k: string, max = 500) => String(f.get(k) ?? '').trim().slice(0, max);
const filesOf = (f: FormData) => f.getAll('files').filter((x) => x && typeof x !== 'string' && (x as File).size) as File[];

export type LeadState = { error?: string; ok?: string };
export async function createLead(_: LeadState, f: FormData): Promise<LeadState> {
  const m = await requireManager();
  const d = { name: s(f, 'name', 120), email: s(f, 'email', 160), phone: s(f, 'phone', 40), company: s(f, 'company', 160), location: s(f, 'location', 200), facility: s(f, 'facility', 80), parcel: s(f, 'parcel', 160), capacity: s(f, 'capacity', 160), budget: s(f, 'budget', 80), notes: s(f, 'notes', 3000) };
  if (d.name.length < 3) return { error: 'Danışan adayının adını yazın.' };
  if (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) return { error: 'E-posta adresi geçerli değil.' };
  if (!d.email && !d.phone) return { error: 'E-posta veya telefondan en az birini yazın.' };
  if (!TYPES.includes(d.facility)) return { error: 'Tesis tipini seçin.' };
  const l = await one(`INSERT INTO leads (manager_id, name, email, phone, company, location, facility, parcel, capacity, budget, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
    [m.id, d.name, d.email || null, d.phone || null, d.company || null, d.location || null, d.facility, d.parcel || null, d.capacity || null, d.budget || null, d.notes || null]);
  const errs: string[] = [];
  for (const file of filesOf(f)) { try { const fid = await saveFile(file, { uploadedBy: m.id }); if (fid) await q('INSERT INTO lead_files (lead_id, file_id) VALUES ($1,$2)', [l.id, fid]); } catch (e: any) { errs.push(e.message); } }
  await q('INSERT INTO lead_events (lead_id, who, what) VALUES ($1,$2,$3)', [l.id, m.name, 'Ön kayıt gönderildi']);
  await sendMail(adminMail(), `Yeni ön kayıt: ${d.name}`, `${m.name} yeni bir danışan ön kaydı gönderdi: ${d.name} (${d.facility}).\nİnceleme: ${siteUrl()}/yonetim/on-kayitlar/${l.id}`);
  await log(m, `Ön kayıt gönderdi: ${d.name}`); revalidatePath('/portfoy', 'layout'); revalidatePath('/yonetim', 'layout');
  if (errs.length) return { error: 'Kayıt gönderildi ancak bazı dosyalar eklenemedi: ' + errs.join(' ') };
  redirect(`/portfoy/on-kayit/${l.id}?yeni=1`);
}
export async function addLeadInfo(_: LeadState, f: FormData): Promise<LeadState> {
  const m = await requireManager(); const id = Number(f.get('id')), note = s(f, 'note', 2000);
  const l = await one('SELECT * FROM leads WHERE id = $1 AND manager_id = $2', [id, m.id]); if (!l) return { error: 'Kayıt bulunamadı.' };
  if (['onaylandi', 'reddedildi'].includes(l.status)) return { error: 'Bu kayıt kapandı.' };
  const files = filesOf(f); if (!note && !files.length) return { error: 'Not yazın veya dosya ekleyin.' };
  const errs: string[] = []; let k = 0;
  for (const file of files) { try { const fid = await saveFile(file, { uploadedBy: m.id }); if (fid) { await q('INSERT INTO lead_files (lead_id, file_id) VALUES ($1,$2)', [id, fid]); k++; } } catch (e: any) { errs.push(e.message); } }
  await q('INSERT INTO lead_events (lead_id, who, what) VALUES ($1,$2,$3)', [id, m.name, [note, k ? `${k} belge eklendi` : ''].filter(Boolean).join(' · ')]);
  if (l.status === 'eksik') await q(`UPDATE leads SET status='inceleniyor', updated_at=now() WHERE id=$1`, [id]);
  await sendMail(adminMail(), `Ön kayda ek bilgi: ${l.name}`, `${m.name}: ${note}\n${k ? k + ' belge eklendi.\n' : ''}${siteUrl()}/yonetim/on-kayitlar/${id}`);
  await log(m, `Ön kayda bilgi ekledi: ${l.name}`); revalidatePath(`/portfoy/on-kayit/${id}`); revalidatePath('/yonetim', 'layout');
  return errs.length ? { error: errs.join(' ') } : { ok: 'Gönderildi.' };
}
/** A document added for one of the manager's clients (a new, already-uploaded request the admin reviews). */
export async function addClientDoc(_: LeadState, f: FormData): Promise<LeadState> {
  const m = await requireManager(); const cid = Number(f.get('client')), title = s(f, 'title', 200);
  const c = await one(`SELECT id, name FROM users WHERE id = $1 AND manager_id = $2 AND role = 'client'`, [cid, m.id]); if (!c) return { error: 'Danışan seçin.' };
  const p = await one('SELECT id FROM projects WHERE client_id = $1 ORDER BY created_at LIMIT 1', [cid]); if (!p) return { error: 'Bu danışanın henüz projesi yok; yönetici proje açtıktan sonra belge eklenebilir.' };
  if (title.length < 2) return { error: 'Belgenin adını yazın (örneğin Tapu kaydı).' };
  const files = filesOf(f); if (!files.length) return { error: 'Dosya seçin.' };
  const fids: string[] = [];
  try { for (const file of files) { const id = await saveFile(file, { clientId: cid, uploadedBy: m.id }); if (id) fids.push(id); } } catch (e: any) { return { error: e.message }; }
  const r = await one(`INSERT INTO doc_requests (project_id, client_id, title, note, required, status) VALUES ($1,$2,$3,$4,FALSE,'yuklendi') RETURNING id`, [p.id, cid, title, `Portföy yöneticisi ${m.name} tarafından danışan adına eklendi.`]);
  for (const id of fids) await q('INSERT INTO doc_files (request_id, file_id) VALUES ($1,$2)', [r.id, id]);
  await sendMail(adminMail(), `Danışan adına belge: ${c.name}`, `${m.name}, ${c.name} adına “${title}” belgesini ekledi. İnceleme: ${siteUrl()}/yonetim/belgeler`);
  await log(m, `Danışan adına belge ekledi: ${c.name} · ${title}`); revalidatePath('/portfoy', 'layout'); revalidatePath('/yonetim', 'layout');
  return { ok: `“${title}” ${c.name} adına eklendi; NOVAPROJE inceleyecek.` };
}
