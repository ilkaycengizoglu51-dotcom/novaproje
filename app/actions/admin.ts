'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { generatePassword, hashPassword, requireAdmin } from '@/lib/auth';
import { one, q, tx } from '@/lib/db';
import { CONTRACTOR_DOCS, DOC_PRESETS, PARTNER_CATS, STATUS, TRADES, TYPES, WST, parseMoney } from '@/lib/format';
import { contractTemplate, contractorTemplate } from '@/lib/contract';
import { RES_TYPES, saveFile } from '@/lib/files';
import { log } from '@/lib/log';
import { sendMail, siteUrl } from '@/lib/mail';
import { autoreplySettings, installments } from '@/lib/data';

const s = (f: FormData, k: string, max = 500) => String(f.get(k) ?? '').trim().slice(0, max);
const n = (f: FormData, k: string) => Number(f.get(k));
const d = (f: FormData, k: string) => { const v = s(f, k, 10); return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null; };
const re = (...paths: string[]) => { paths.forEach((p) => revalidatePath(p)); revalidatePath('/yonetim', 'layout'); revalidatePath('/panel', 'layout'); };
const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);

/* ---------- clients ---------- */
export type ClientState = { error?: string; creds?: { username: string; password: string; name: string; email: string; exp: string; reset?: boolean; role?: string } };
export async function createClient(_: ClientState, f: FormData): Promise<ClientState> {
  const a = await requireAdmin();
  const name = s(f, 'name', 120), username = s(f, 'username', 40).toLocaleLowerCase('tr'), email = s(f, 'email', 160), phone = s(f, 'phone', 40) || null, password = s(f, 'password', 100);
  const days = [3, 7, 14, 30].includes(n(f, 'days')) ? n(f, 'days') : 7, role = f.get('role') === 'manager' ? 'manager' : f.get('role') === 'contractor' ? 'contractor' : 'client', company = s(f, 'company', 160) || null;
  if (name.length < 3) return { error: 'Adı soyadı yazın.' };
  if (!emailOk(email)) return { error: 'Geçerli bir e-posta adresi yazın; bildirimler bu adrese gider.' };
  if (!/^[a-z0-9._-]{3,40}$/.test(username)) return { error: 'Kullanıcı adı 3–40 karakter olmalı; yalnızca küçük harf (Türkçe karakter olmadan), rakam, nokta, tire ve alt çizgi kullanın.' };
  if (password.length < 10) return { error: 'Geçici şifre en az 10 karakter olmalı.' };
  if (await one('SELECT 1 FROM users WHERE username = $1', [username])) return { error: `"${username}" kullanıcı adı zaten kullanılıyor.` };
  if (await one('SELECT 1 FROM users WHERE lower(email) = lower($1)', [email])) return { error: 'Bu e-posta adresiyle açılmış bir hesap zaten var.' };
  const exp = new Date(Date.now() + days * 864e5);
  const u = await one(`INSERT INTO users (username, password_hash, name, email, phone, role, must_change_password, temp_password_expires_at, company) VALUES ($1,$2,$3,$4,$5,$7,TRUE,$6,$8) RETURNING id`, [username, await hashPassword(password), name, email, phone, exp, role, company]);
  const st = await autoreplySettings();
  if (st.welcome && role === 'client') await q(`INSERT INTO messages (client_id, sender, author, auto, body) VALUES ($1,'admin','NOVAPROJE Asistan',TRUE,$2)`, [u.id, `Hoş geldiniz ${name.split(' ')[0]}. Projenizle ilgili tüm sorularınızı buradan bize iletebilirsiniz. Sözleşmelerinizi, istenen belgeleri ve ödeme planınızı panelin sol menüsünden takip edebilirsiniz.`]);
  await log(a, `${role === 'manager' ? 'Portföy yöneticisi' : role === 'contractor' ? 'Taşeron' : 'Danışan'} hesabı açtı: ${name}`); re('/yonetim/danisanlar'); re('/yonetim/portfoy'); re('/yonetim/taseronlar');
  return { creds: { username, password, name, email, exp: exp.toISOString().slice(0, 10), role } };
}
export async function resetClientPassword(_: ClientState, f: FormData): Promise<ClientState> {
  const a = await requireAdmin(); const id = n(f, 'id');
  const u = await one(`SELECT username, name, email, role FROM users WHERE id = $1 AND role IN ('client','manager','contractor')`, [id]); if (!u) return { error: 'Hesap bulunamadı.' };
  const pw = generatePassword(), exp = new Date(Date.now() + 7 * 864e5);
  await q('UPDATE users SET password_hash = $1, must_change_password = TRUE, temp_password_expires_at = $2 WHERE id = $3', [await hashPassword(pw), exp, id]);
  await q('DELETE FROM sessions WHERE user_id = $1', [id]); await log(a, `Şifre sıfırladı: ${u.name}`);
  return { creds: { username: u.username, password: pw, name: u.name, email: u.email, exp: exp.toISOString().slice(0, 10), reset: true, role: u.role } };
}
export async function updateClient(f: FormData) {
  const a = await requireAdmin(); const id = n(f, 'id'), name = s(f, 'name', 120), email = s(f, 'email', 160);
  if (name.length < 3 || !emailOk(email)) return;
  const sal = f.get('salutation'); await q(`UPDATE users SET name = $2, email = $3, phone = $4${f.has('salutation') ? ', salutation = $5' : ''} WHERE id = $1 AND role IN ('client','manager','contractor')`, [id, name, email, s(f, 'phone', 40) || null, ...(f.has('salutation') ? [sal === 'Bey' || sal === 'Hanım' ? sal : null] : [])]);
  await log(a, `Danışan bilgilerini güncelledi: ${name}`); re('/yonetim/danisanlar');
}
export async function toggleClient(f: FormData) {
  const a = await requireAdmin(); const id = n(f, 'id');
  const u = await one(`UPDATE users SET active = NOT active WHERE id = $1 AND role IN ('client','manager','contractor') RETURNING name, active`, [id]);
  if (u && !u.active) await q('DELETE FROM sessions WHERE user_id = $1', [id]);
  if (u) await log(a, `${u.active ? 'Hesabı açtı' : 'Hesabı kapattı'}: ${u.name}`); re('/yonetim/danisanlar'); re('/yonetim/taseronlar');
}

/* ---------- projects ---------- */
function pf(f: FormData) {
  const status = s(f, 'status', 20), type = s(f, 'type', 60);
  return { name: s(f, 'name', 160), client: n(f, 'client'), type: TYPES.includes(type) ? type : 'Diğer', location: s(f, 'location', 200) || null, description: s(f, 'description', 3000) || null,
    status: status in STATUS ? status : 'planlama', progress: Math.max(0, Math.min(100, Math.round(n(f, 'progress') || 0))), start: d(f, 'start'), target: d(f, 'target') };
}
export async function createProject(f: FormData) {
  const a = await requireAdmin(); const p = pf(f); if (!p.name || !p.client) return;
  const r = await one(`INSERT INTO projects (client_id, name, type, location, description, status, progress, start_date, target_date) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
    [p.client, p.name, p.type, p.location, p.description, p.status, p.progress, p.start, p.target]);
  await log(a, `Proje oluşturdu: ${p.name}`); re('/yonetim/projeler'); redirect(`/yonetim/projeler/${r.id}`);
}
export async function updateProject(f: FormData) {
  const a = await requireAdmin(); const id = n(f, 'id'), p = pf(f); if (!p.name) return;
  await q(`UPDATE projects SET client_id = COALESCE($2, client_id), name=$3, type=$4, location=$5, description=$6, status=$7, progress=$8, start_date=$9, target_date=$10, updated_at=now() WHERE id=$1`,
    [id, p.client || null, p.name, p.type, p.location, p.description, p.status, p.progress, p.start, p.target]);
  await log(a, `Projeyi güncelledi: ${p.name}`); re(`/yonetim/projeler/${id}`);
}
export async function deleteProject(f: FormData) { const a = await requireAdmin(); const r = await one('DELETE FROM projects WHERE id = $1 RETURNING name', [n(f, 'id')]); if (r) await log(a, `Proje sildi: ${r.name}`); re('/yonetim/projeler'); redirect('/yonetim/projeler'); }
export async function addMilestone(f: FormData) { const a = await requireAdmin(); const pid = n(f, 'project'), t = s(f, 'title', 200); if (!t) return;
  await q(`INSERT INTO milestones (project_id, title, due_date, sort) VALUES ($1,$2,$3, COALESCE((SELECT max(sort)+1 FROM milestones WHERE project_id=$1),0))`, [pid, t, d(f, 'due')]); await log(a, `Aşama ekledi: ${t}`); re(`/yonetim/projeler/${pid}`); }
export async function setMilestone(f: FormData) { await requireAdmin(); const st = s(f, 'status', 10); if (!['bekliyor', 'devam', 'tamam'].includes(st)) return;
  const r = await one(`UPDATE milestones SET status=$2, completed_at = CASE WHEN $2='tamam' THEN COALESCE(completed_at, CURRENT_DATE) ELSE NULL END WHERE id=$1 RETURNING project_id`, [n(f, 'id'), st]); if (r) re(`/yonetim/projeler/${r.project_id}`); }
export async function deleteMilestone(f: FormData) { await requireAdmin(); const r = await one('DELETE FROM milestones WHERE id=$1 RETURNING project_id', [n(f, 'id')]); if (r) re(`/yonetim/projeler/${r.project_id}`); }
export async function addUpdate(f: FormData) { const a = await requireAdmin(); const pid = n(f, 'project'), t = s(f, 'title', 200), b = s(f, 'body', 4000); if (!t || !b) return;
  await q('INSERT INTO updates (project_id, title, body) VALUES ($1,$2,$3)', [pid, t, b]);
  const p = await one('SELECT p.name, u.name AS cname, u.email FROM projects p JOIN users u ON u.id=p.client_id WHERE p.id=$1', [pid]);
  await sendMail(p?.email, `Projenizden yeni haber: ${t}`, `Sayın ${p?.cname},\n\n“${p?.name}” projenizle ilgili yeni bir güncelleme paylaşıldı:\n\n${t}\n${b}\n\n${siteUrl()}/panel\n\nNOVAPROJE`);
  await log(a, `Güncelleme paylaştı: ${p?.name}`); re(`/yonetim/projeler/${pid}`); }
export async function deleteUpdate(f: FormData) { await requireAdmin(); const r = await one('DELETE FROM updates WHERE id=$1 RETURNING project_id', [n(f, 'id')]); if (r) re(`/yonetim/projeler/${r.project_id}`); }

/* ---------- installments ---------- */
export type PlanState = { error?: string; ok?: string };
export async function addInstallment(_: PlanState, f: FormData): Promise<PlanState> {
  const a = await requireAdmin(); const pid = n(f, 'project'), amt = parseMoney(s(f, 'amount', 40)), due = d(f, 'due');
  if (!due) return { error: 'Vade tarihini seçin.' }; if (!(amt > 0)) return { error: 'Tutarı geçerli bir sayı olarak yazın, örneğin 250.000 veya 250000,50.' };
  await q(`INSERT INTO installments (project_id, no, due_date, amount_kurus, note) VALUES ($1, COALESCE((SELECT max(no)+1 FROM installments WHERE project_id=$1),1), $2, $3, $4)`, [pid, due, amt, s(f, 'note', 200) || null]);
  await log(a, 'Taksit ekledi'); re(`/yonetim/projeler/${pid}`); return { ok: 'Taksit eklendi.' };
}
export async function generatePlan(_: PlanState, f: FormData): Promise<PlanState> {
  const a = await requireAdmin(); const pid = n(f, 'project'), total = parseMoney(s(f, 'total', 40)), count = Math.round(n(f, 'count')), first = d(f, 'first'), every = Math.max(1, Math.min(12, Math.round(n(f, 'every') || 1)));
  if (!(total > 0)) return { error: 'Toplam tutarı geçerli bir sayı olarak yazın.' }; if (!(count >= 1 && count <= 120)) return { error: 'Taksit sayısı 1 ile 120 arasında olmalı.' }; if (!first) return { error: 'İlk vade tarihini seçin.' };
  const open = await one('SELECT count(*)::int AS c FROM installments WHERE project_id=$1 AND paid_at IS NULL', [pid]);
  if (open?.c && f.get('replace') !== 'on') return { error: 'Bu projede ödenmemiş taksitler var. Değiştirmek için “Ödenmemiş mevcut taksitleri sil” kutusunu işaretleyin.' };
  await tx(async (c) => {
    if (f.get('replace') === 'on') await c.query('DELETE FROM installments WHERE project_id=$1 AND paid_at IS NULL', [pid]);
    const start = Number((await c.query('SELECT COALESCE(max(no),0) AS m FROM installments WHERE project_id=$1', [pid])).rows[0].m), base = Math.floor(total / count), [y, m, dd] = first.split('-').map(Number);
    for (let i = 0; i < count; i++) { const dt = new Date(Date.UTC(y, m - 1 + i * every, 1)); const last = new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth() + 1, 0)).getUTCDate(); dt.setUTCDate(Math.min(dd, last));
      await c.query('INSERT INTO installments (project_id, no, due_date, amount_kurus) VALUES ($1,$2,$3,$4)', [pid, start + i + 1, dt.toISOString().slice(0, 10), i === count - 1 ? total - base * (count - 1) : base]); }
  });
  await log(a, `${count} taksitlik plan oluşturdu`); re(`/yonetim/projeler/${pid}`); return { ok: `${count} taksitlik plan oluşturuldu.` };
}
export async function togglePaid(f: FormData) { const a = await requireAdmin(); const r = await one(`UPDATE installments SET paid_at = CASE WHEN paid_at IS NULL THEN CURRENT_DATE ELSE NULL END WHERE id=$1 RETURNING project_id, no, paid_at`, [n(f, 'id')]);
  if (r) { await log(a, `${r.paid_at ? 'Ödeme işledi' : 'Ödemeyi geri aldı'}: ${r.no}. taksit`); re(`/yonetim/projeler/${r.project_id}`, '/yonetim/tahsilat'); } }
export async function deleteInstallment(f: FormData) { await requireAdmin(); const r = await one('DELETE FROM installments WHERE id=$1 RETURNING project_id', [n(f, 'id')]); if (r) re(`/yonetim/projeler/${r.project_id}`); }

/* ---------- contracts ---------- */
export async function createContract(f: FormData) {
  const a = await requireAdmin(); const pid = n(f, 'project');
  const p = await one(`SELECT id, client_id, name, type, location, to_char(start_date,'YYYY-MM-DD') AS start_date, to_char(target_date,'YYYY-MM-DD') AS target_date FROM projects WHERE id=$1`, [pid]); if (!p) return;
  const c = await one('SELECT name FROM users WHERE id=$1', [p.client_id]), inst = await installments(pid);
  const r = await one(`INSERT INTO contracts (project_id, client_id, title, body) VALUES ($1,$2,$3,$4) RETURNING id`, [pid, p.client_id, s(f, 'title', 160) || 'Proje hizmet sözleşmesi', contractTemplate(p, c, inst)]);
  await q('INSERT INTO contract_audit (contract_id, who, what) VALUES ($1,$2,$3)', [r.id, a.name, 'Taslak oluşturuldu']); await log(a, `Sözleşme taslağı oluşturdu: ${p.name}`);
  redirect(`/yonetim/sozlesmeler/${r.id}`);
}
export type CState = { error?: string; ok?: string };
export async function saveContract(_: CState, f: FormData): Promise<CState> {
  const a = await requireAdmin(); const id = n(f, 'id'), go = s(f, 'go', 10);
  const c = await one('SELECT * FROM contracts WHERE id=$1', [id]); if (!c || !['taslak', 'revizyon'].includes(c.status)) return { error: 'Bu sözleşme artık düzenlenemez.' };
  const body = s(f, 'body', 60000), title = s(f, 'title', 160) || c.title; if (body.length < 50) return { error: 'Sözleşme metni çok kısa.' };
  let att = c.attachment_id; const file = f.get('attach') as File | null;
  try { if (file && typeof file !== 'string' && file.size) att = await saveFile(file, { clientId: c.client_id, uploadedBy: a.id }); } catch (e: any) { return { error: e.message }; }
  const version = c.status === 'revizyon' ? c.version + 1 : c.version;
  if (go === 'send') {
    await q(`UPDATE contracts SET title=$2, body=$3, attachment_id=$4, version=$5, status='gonderildi', sent_at=now(), viewed_at=NULL, client_sign=NULL WHERE id=$1`, [id, title, body, att, version]);
    const cl = await one('SELECT name, email, role FROM users WHERE id=$1', [c.client_id]), sub = cl?.role === 'contractor';
    await q('INSERT INTO contract_audit (contract_id, who, what) VALUES ($1,$2,$3)', [id, a.name, `${sub ? 'Taşerona' : 'Danışana'} imza için gönderildi (sürüm ${version})`]);
    await sendMail(cl?.email, 'NOVAPROJE — İmzanızı bekleyen sözleşme', `Sayın ${cl?.name},\n\n“${title}” ${sub ? 'taşeron' : 'danışan'} panelinizde imzanızı bekliyor.\n${siteUrl()}/${sub ? 'taseron' : 'panel'}/sozlesmeler/${id}\n\nNOVAPROJE Tarımsal Mühendislik`);
    await log(a, `Sözleşmeyi imzaya gönderdi: ${title}`); re(`/yonetim/sozlesmeler/${id}`); revalidatePath('/taseron', 'layout'); return { ok: `Sözleşme ${sub ? 'taşeronun' : 'danışanın'} paneline gönderildi ve e-posta ile bildirildi.` };
  }
  await q('UPDATE contracts SET title=$2, body=$3, attachment_id=$4, version=$5 WHERE id=$1', [id, title, body, att, version]);
  await q('INSERT INTO contract_audit (contract_id, who, what) VALUES ($1,$2,$3)', [id, a.name, 'Taslak güncellendi']); re(`/yonetim/sozlesmeler/${id}`); return { ok: 'Taslak kaydedildi.' };
}
export async function cancelContract(f: FormData) { const a = await requireAdmin(); const id = n(f, 'id'); await q(`UPDATE contracts SET status='iptal' WHERE id=$1 AND status <> 'tamamlandi'`, [id]);
  await q('INSERT INTO contract_audit (contract_id, who, what) VALUES ($1,$2,$3)', [id, a.name, 'Sözleşme iptal edildi']); await log(a, 'Sözleşme iptal etti'); re(`/yonetim/sozlesmeler/${id}`); }
export async function duplicateContract(f: FormData) { const a = await requireAdmin(); const c = await one('SELECT * FROM contracts WHERE id=$1', [n(f, 'id')]); if (!c) return;
  const r = await one(`INSERT INTO contracts (project_id, client_id, title, body, version, attachment_id) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`, [c.project_id, c.client_id, c.title, c.body, c.version + 1, c.attachment_id]);
  await q('INSERT INTO contract_audit (contract_id, who, what) VALUES ($1,$2,$3)', [r.id, a.name, `Sürüm ${c.version} kopyalanarak oluşturuldu`]); redirect(`/yonetim/sozlesmeler/${r.id}`); }

/* ---------- document requests ---------- */
export type DocState = { error?: string; ok?: string };
export async function requestDocs(_: DocState, f: FormData): Promise<DocState> {
  const a = await requireAdmin(); const pid = n(f, 'project');
  const p = await one('SELECT p.id, p.client_id, p.name, u.name AS cname, u.email FROM projects p JOIN users u ON u.id=p.client_id WHERE p.id=$1', [pid]); if (!p) return { error: 'Proje seçin.' };
  const titles = [...f.getAll('pre').map(String).filter((t) => DOC_PRESETS.includes(t)), ...s(f, 'custom', 2000).split('\n').map((x) => x.trim()).filter(Boolean)];
  if (!titles.length) return { error: 'En az bir belge seçin veya yazın.' };
  for (const t of titles) await q('INSERT INTO doc_requests (project_id, client_id, title, note, due_date, required) VALUES ($1,$2,$3,$4,$5,$6)', [pid, p.client_id, t.slice(0, 200), s(f, 'note', 500) || null, d(f, 'due'), f.get('required') === 'on']);
  await sendMail(p.email, 'NOVAPROJE — Yüklemeniz gereken belgeler', `Sayın ${p.cname},\n\nProjeniz için aşağıdaki belgeleri danışan panelinize yüklemenizi rica ederiz:\n\n${titles.map((t) => '• ' + t).join('\n')}\n\n${siteUrl()}/panel/belgeler\n\nNOVAPROJE`);
  await log(a, `${titles.length} belge talep etti: ${p.name}`); re('/yonetim/belgeler'); return { ok: `${titles.length} belge talebi ${p.cname} adlı danışana gönderildi.` };
}
export async function reviewDoc(f: FormData) {
  const a = await requireAdmin(); const id = n(f, 'id'), act = s(f, 'act', 10);
  const r = await one('SELECT r.*, u.name AS cname, u.email, u.role AS crole FROM doc_requests r JOIN users u ON u.id=r.client_id WHERE r.id=$1', [id]); if (!r) return;
  if (act === 'ok') { await q(`UPDATE doc_requests SET status='onaylandi', reason=NULL WHERE id=$1`, [id]); await log(a, `Belgeyi onayladı: ${r.title}`); }
  if (act === 'no') { const why = s(f, 'reason', 400) || 'Belge uygun değil, lütfen yeniden yükleyin.'; await q(`UPDATE doc_requests SET status='reddedildi', reason=$2 WHERE id=$1`, [id, why]);
    await sendMail(r.email, `Belgeniz iade edildi: ${r.title}`, `Sayın ${r.cname},\n\n“${r.title}” belgeniz şu nedenle iade edildi: ${why}\nLütfen panelden yeniden yükleyin: ${siteUrl()}/${r.crole === 'contractor' ? 'taseron' : 'panel'}/belgeler\n\nNOVAPROJE`); await log(a, `Belgeyi iade etti: ${r.title}`); }
  if (act === 'reopen') await q(`UPDATE doc_requests SET status = CASE WHEN EXISTS (SELECT 1 FROM doc_files WHERE request_id=$1) THEN 'yuklendi' ELSE 'bekliyor' END WHERE id=$1`, [id]);
  if (act === 'delete') { await q('DELETE FROM files WHERE id IN (SELECT file_id FROM doc_files WHERE request_id=$1)', [id]); await q('DELETE FROM doc_requests WHERE id=$1', [id]); await log(a, `Belge talebini sildi: ${r.title}`); }
  re('/yonetim/belgeler'); revalidatePath('/taseron', 'layout');
}

/* ---------- partners (references on the website) ---------- */
export type PartState = { error?: string; ok?: string };
export async function savePartner(_: PartState, f: FormData): Promise<PartState> {
  const a = await requireAdmin(); const id = n(f, 'id'), name = s(f, 'name', 120), cat = s(f, 'category', 60); let url = s(f, 'url', 300);
  if (name.length < 2) return { error: 'Firma adını yazın.' }; if (!PARTNER_CATS.includes(cat)) return { error: 'Kategori seçin.' };
  if (url && !/^https?:\/\//i.test(url)) url = 'https://' + url; if (url && !/^https?:\/\/[^\s"<>]+$/i.test(url)) return { error: 'Web sitesi adresi geçerli değil. Örnek: https://firma.com.tr' };
  let logo: string | null = null; const file = f.get('logo') as File | null;
  try { if (file && typeof file !== 'string' && file.size) { if (file.size > 2 * 1024 * 1024) return { error: 'Logo 2 MB’tan küçük olmalı.' }; logo = await saveFile(file, { uploadedBy: a.id, isPublic: true, images: true }); } } catch (e: any) { return { error: e.message }; }
  if (id) { await q(`UPDATE partners SET name=$2, category=$3, city=$4, url=$5, description=$6, logo_id = CASE WHEN $8 THEN NULL ELSE COALESCE($7, logo_id) END WHERE id=$1`, [id, name, cat, s(f, 'city', 80) || null, url || null, s(f, 'description', 400) || null, logo, f.get('dellogo') === 'on']); await log(a, `Referansı güncelledi: ${name}`); }
  else { await q(`INSERT INTO partners (name, category, city, url, description, logo_id, sort) VALUES ($1,$2,$3,$4,$5,$6, COALESCE((SELECT max(sort)+1 FROM partners),0))`, [name, cat, s(f, 'city', 80) || null, url || null, s(f, 'description', 400) || null, logo]); await log(a, `Referans ekledi: ${name}`); }
  re('/yonetim/referanslar'); return { ok: id ? 'Firma güncellendi.' : 'Firma eklendi ve sitede yayında.' };
}
export async function partnerAction(f: FormData) {
  await requireAdmin(); const id = n(f, 'id'), act = s(f, 'act', 10);
  if (act === 'vis') await q('UPDATE partners SET visible = NOT visible WHERE id=$1', [id]);
  if (act === 'del') await q('DELETE FROM partners WHERE id=$1', [id]);
  if (act === 'up') { const cur = await one('SELECT sort FROM partners WHERE id=$1', [id]); const prev = cur && await one('SELECT id, sort FROM partners WHERE sort < $1 ORDER BY sort DESC LIMIT 1', [cur.sort]); if (prev) { await q('UPDATE partners SET sort=$2 WHERE id=$1', [id, prev.sort]); await q('UPDATE partners SET sort=$2 WHERE id=$1', [prev.id, cur.sort]); } }
  re('/yonetim/referanslar');
}

/* ---------- quotes, settings ---------- */
export async function setQuote(f: FormData) { await requireAdmin(); const st = s(f, 'status', 20); if (['yeni', 'incelendi', 'teklif-verildi', 'kapandi'].includes(st)) await q('UPDATE quotes SET status=$2 WHERE id=$1', [n(f, 'id'), st]); re('/yonetim/teklifler'); }
export type SetState = { ok?: string };
export async function saveAutoreply(_: SetState, f: FormData): Promise<SetState> {
  const a = await requireAdmin(); const v = { enabled: f.get('enabled') === 'on', welcome: f.get('welcome') === 'on', inHours: s(f, 'inHours', 1000), offHours: s(f, 'offHours', 1000) };
  await q(`INSERT INTO settings (key, value) VALUES ('autoreply',$1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`, [JSON.stringify(v)]);
  await log(a, 'Otomatik yanıt ayarlarını güncelledi'); return { ok: 'Otomatik yanıt ayarları kaydedildi.' };
}

/* ---------- pre-registrations from portfolio managers ---------- */
const slug = (s: string) => s.toLocaleLowerCase('tr').replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/i̇/g, 'i').replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u').replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean);
export type LeadState = { error?: string; ok?: string; creds?: ClientState['creds'] };
export async function reviewLead(_: LeadState, f: FormData): Promise<LeadState> {
  const a = await requireAdmin(); const id = n(f, 'id'), act = s(f, 'act', 20), note = s(f, 'note', 2000);
  const l = await one('SELECT l.*, m.name AS mname, m.email AS memail FROM leads l JOIN users m ON m.id = l.manager_id WHERE l.id = $1', [id]); if (!l) return { error: 'Kayıt bulunamadı.' };
  const ev = (what: string) => q('INSERT INTO lead_events (lead_id, who, what) VALUES ($1,$2,$3)', [id, a.name, what]);
  const mail = (subj: string, body: string) => sendMail(l.memail, subj, `Sayın ${l.mname},\n\n${body}\n\n${siteUrl()}/portfoy/on-kayit/${id}\n\nNOVAPROJE`);
  if (act === 'review') { await q(`UPDATE leads SET status='inceleniyor', updated_at=now() WHERE id=$1`, [id]); await ev('İncelemeye alındı'); await mail(`Ön kayıt incelemede: ${l.name}`, `“${l.name}” ön kaydı incelemeye alındı.`); }
  else if (act === 'missing') { if (note.length < 5) return { error: 'Eksik bilgiyi açıklayın.' }; await q(`UPDATE leads SET status='eksik', admin_note=$2, updated_at=now() WHERE id=$1`, [id, note]); await ev('Eksik bilgi istendi: ' + note); await mail(`Ön kayıt için eksik bilgi: ${l.name}`, `“${l.name}” ön kaydı için şu bilgi/belge isteniyor:\n${note}`); }
  else if (act === 'reject') { await q(`UPDATE leads SET status='reddedildi', admin_note=$2, updated_at=now() WHERE id=$1`, [id, note || null]); await ev('Reddedildi' + (note ? ': ' + note : '')); await mail(`Ön kayıt sonucu: ${l.name}`, `“${l.name}” ön kaydı onaylanmadı.${note ? '\nNeden: ' + note : ''}`); }
  else if (act === 'approve') {
    if (l.status === 'onaylandi') return { error: 'Bu kayıt zaten onaylandı.' };
    const email = s(f, 'email', 160) || l.email || ''; if (!emailOk(email)) return { error: 'Danışan hesabı için geçerli bir e-posta adresi gerekli.' };
    if (await one('SELECT 1 FROM users WHERE lower(email) = lower($1)', [email])) return { error: 'Bu e-posta ile açılmış bir hesap zaten var.' };
    const p = slug(l.name); let base = (p.length > 1 ? p[0] + '.' + p[p.length - 1] : p[0] || 'danisan').slice(0, 32); if (base.length < 3) base += '.np'; let un = base, i = 2; while (await one('SELECT 1 FROM users WHERE username=$1', [un])) un = base + i++;
    const pw = generatePassword(), exp = new Date(Date.now() + 7 * 864e5);
    const c = await one(`INSERT INTO users (username, password_hash, name, email, phone, role, must_change_password, temp_password_expires_at, manager_id) VALUES ($1,$2,$3,$4,$5,'client',TRUE,$6,$7) RETURNING id`, [un, await hashPassword(pw), l.name, email, l.phone, exp, l.manager_id]);
    if (f.get('project') === 'on') await q(`INSERT INTO projects (client_id, name, type, location, description) VALUES ($1,$2,$3,$4,$5)`, [c.id, `${l.facility || 'Proje'} — ${l.name}`.slice(0, 160), TYPES.includes(l.facility) ? l.facility : 'Diğer', [l.location, l.parcel].filter(Boolean).join(' · ') || null, [l.capacity && 'Kapasite: ' + l.capacity, l.notes].filter(Boolean).join('\n') || null]);
    await q('UPDATE files SET client_id = $2 WHERE id IN (SELECT file_id FROM lead_files WHERE lead_id = $1)', [id, c.id]);
    await q(`UPDATE leads SET status='onaylandi', client_id=$2, admin_note=$3, updated_at=now() WHERE id=$1`, [id, c.id, note || null]);
    const st = await autoreplySettings(); if (st.welcome) await q(`INSERT INTO messages (client_id, sender, author, auto, body) VALUES ($1,'admin','NOVAPROJE Asistan',TRUE,$2)`, [c.id, `Hoş geldiniz ${l.name.split(' ')[0]}. Projenizle ilgili tüm sorularınızı buradan bize iletebilirsiniz.`]);
    await ev('Onaylandı · danışan hesabı açıldı'); await mail(`Ön kayıt onaylandı: ${l.name}`, `“${l.name}” ön kaydı onaylandı ve danışan hesabı açıldı. Danışanın belgelerini artık “Danışanlarım” bölümünden yükleyebilirsiniz.`);
    await log(a, `Ön kaydı onayladı, danışan hesabı açtı: ${l.name}`); re('/yonetim/on-kayitlar', `/yonetim/on-kayitlar/${id}`);
    return { ok: 'Onaylandı. Danışan hesabı açıldı.', creds: { username: un, password: pw, name: l.name, email, exp: exp.toISOString().slice(0, 10), role: 'client' } };
  } else return { error: 'Geçersiz işlem.' };
  await log(a, `Ön kayıt güncelledi: ${l.name}`); re('/yonetim/on-kayitlar', `/yonetim/on-kayitlar/${id}`); revalidatePath('/portfoy', 'layout');
  return { ok: 'Kaydedildi; portföy yöneticisine bildirildi.' };
}

/* ---------- resources for portfolio managers (presentations, videos) ---------- */
export type ResState = { error?: string; ok?: string };
export async function saveResource(_: ResState, f: FormData): Promise<ResState> {
  const a = await requireAdmin(); const title = s(f, 'title', 160), kind = ['sunum', 'video', 'diger'].includes(s(f, 'kind', 10)) ? s(f, 'kind', 10) : 'diger';
  if (title.length < 2) return { error: 'Başlık yazın.' };
  const file = f.get('file') as File | null; let fid: string | null = null;
  try { if (file && typeof file !== 'string' && file.size) fid = await saveFile(file, { uploadedBy: a.id, types: RES_TYPES, max: 12 * 1024 * 1024 }); } catch (e: any) { return { error: e.message }; }
  let url = s(f, 'url', 400); if (url && !/^(https?:\/\/|\/)[^\s"<>]+$/i.test(url)) return { error: 'Bağlantı geçerli değil.' };
  if (!fid && !url) return { error: 'Dosya seçin veya bağlantı girin.' };
  await q(`INSERT INTO resources (kind, title, description, file_id, url, sort) VALUES ($1,$2,$3,$4,$5, COALESCE((SELECT max(sort)+1 FROM resources),0))`, [kind, title, s(f, 'description', 400) || null, fid, fid ? null : url]);
  await log(a, `Kaynak ekledi: ${title}`); re('/yonetim/kaynaklar'); revalidatePath('/portfoy', 'layout'); return { ok: 'Eklendi; portföy yöneticileri artık görebilir.' };
}
export async function deleteResource(f: FormData) { const a = await requireAdmin(); const r = await one('DELETE FROM resources WHERE id=$1 RETURNING title, file_id', [n(f, 'id')]); if (r?.file_id) await q('DELETE FROM files WHERE id=$1', [r.file_id]); if (r) await log(a, `Kaynak sildi: ${r.title}`); re('/yonetim/kaynaklar'); }

export async function setProgress(f: FormData) { const a = await requireAdmin(); const id = n(f, 'id'), v = Math.max(0, Math.min(100, Math.round(n(f, 'progress'))));
  await q('UPDATE projects SET progress = $2, updated_at = now() WHERE id = $1', [id, v]); await log(a, `İlerlemeyi %${v} yaptı`); re(`/yonetim/projeler/${id}`); }

/* ---------- taşeron iş paketleri ---------- */
export type WState = { error?: string; ok?: string };
export async function savePackage(_: WState, f: FormData): Promise<WState> {
  const a = await requireAdmin(); const id = n(f, 'id') || 0, pid = n(f, 'project'), cid = n(f, 'contractor');
  const trade = s(f, 'trade', 80), title = s(f, 'title', 160), scope = s(f, 'scope', 4000) || null, start = d(f, 'start'), due = d(f, 'due');
  if (!TRADES.includes(trade)) return { error: 'İş kolunu seçin.' };
  if (title.length < 3) return { error: 'İşin adını yazın (ör. “Ahır elektrik tesisatı”).' };
  if (start && due && due < start) return { error: 'Bitiş tarihi başlangıçtan önce olamaz.' };
  const p = await one('SELECT id, name FROM projects WHERE id=$1', [pid]); if (!p) return { error: 'Proje seçin.' };
  const c = await one(`SELECT id, name, email, active FROM users WHERE id=$1 AND role='contractor'`, [cid]); if (!c) return { error: 'Taşeron seçin.' };
  if (id) {
    const r = await one(`UPDATE work_packages SET project_id=$2, contractor_id=$3, trade=$4, title=$5, scope=$6, start_date=$7, due_date=$8, updated_at=now() WHERE id=$1 RETURNING id`, [id, pid, cid, trade, title, scope, start, due]);
    if (!r) return { error: 'İş bulunamadı.' };
    await log(a, `Taşeron işini güncelledi: ${title}`);
  } else {
    await q(`INSERT INTO work_packages (project_id, contractor_id, trade, title, scope, start_date, due_date) VALUES ($1,$2,$3,$4,$5,$6,$7)`, [pid, cid, trade, title, scope, start, due]);
    await sendMail(c.email, `NOVAPROJE — Size yeni bir iş atandı: ${title}`, `Sayın ${c.name},\n\n“${p.name}” projesinde “${title}” (${trade}) işi size atandı. Ayrıntıları taşeron panelinizden görebilirsiniz:\n${siteUrl()}/taseron\n\nNOVAPROJE Tarımsal Mühendislik`);
    await log(a, `Taşerona iş atadı: ${c.name} · ${title}`);
  }
  re('/yonetim/taseronlar', `/yonetim/projeler/${pid}`); revalidatePath('/taseron', 'layout');
  return { ok: id ? 'İş güncellendi.' : `İş ${c.name} adlı taşerona atandı ve e-postayla bildirildi.` };
}
export async function setPackage(f: FormData) {
  const a = await requireAdmin(); const id = n(f, 'id'), act = s(f, 'act', 20);
  const w = await one('SELECT * FROM work_packages WHERE id=$1', [id]); if (!w) return;
  if (act === 'delete') {
    await q(`UPDATE contracts SET status='iptal' WHERE package_id=$1 AND status NOT IN ('tamamlandi','iptal')`, [id]);
    await q('DELETE FROM files WHERE id IN (SELECT df.file_id FROM doc_files df JOIN doc_requests r ON r.id = df.request_id WHERE r.package_id=$1)', [id]);
    await q('DELETE FROM doc_requests WHERE package_id=$1', [id]);
    await q('DELETE FROM work_packages WHERE id=$1', [id]); await log(a, `Taşeron işini sildi: ${w.title}`);
  } else if (Object.prototype.hasOwnProperty.call(WST, act)) { await q('UPDATE work_packages SET status=$2, updated_at=now() WHERE id=$1', [id, act]); await log(a, `Taşeron işinin durumunu değiştirdi: ${w.title} → ${WST[act]}`); }
  re('/yonetim/taseronlar', `/yonetim/projeler/${w.project_id}`); revalidatePath('/taseron', 'layout');
}
export async function packageContract(f: FormData) {
  const a = await requireAdmin(); const id = n(f, 'id');
  const w = await one(`SELECT w.*, to_char(w.start_date,'YYYY-MM-DD') AS start_date, to_char(w.due_date,'YYYY-MM-DD') AS due_date FROM work_packages w WHERE w.id=$1`, [id]); if (!w) return;
  const p = await one('SELECT id, name, type, location FROM projects WHERE id=$1', [w.project_id]), c = await one('SELECT name, company FROM users WHERE id=$1', [w.contractor_id]);
  const r = await one(`INSERT INTO contracts (project_id, client_id, package_id, title, body) VALUES ($1,$2,$3,$4,$5) RETURNING id`, [w.project_id, w.contractor_id, w.id, `Taşeron iş sözleşmesi — ${w.title}`.slice(0, 160), contractorTemplate(w, p, c)]);
  await q('INSERT INTO contract_audit (contract_id, who, what) VALUES ($1,$2,$3)', [r.id, a.name, 'Taşeron sözleşmesi taslağı oluşturuldu']); await log(a, `Taşeron sözleşmesi taslağı oluşturdu: ${w.title}`);
  redirect(`/yonetim/sozlesmeler/${r.id}`);
}
export async function requestPackageDocs(_: WState, f: FormData): Promise<WState> {
  const a = await requireAdmin(); const id = n(f, 'id');
  const w = await one(`SELECT w.*, u.name AS cname, u.email, p.name AS pname FROM work_packages w JOIN users u ON u.id = w.contractor_id JOIN projects p ON p.id = w.project_id WHERE w.id=$1`, [id]); if (!w) return { error: 'İş bulunamadı.' };
  const titles = [...f.getAll('pre').map(String).filter((t) => CONTRACTOR_DOCS.includes(t)), ...s(f, 'custom', 2000).split('\n').map((x) => x.trim()).filter(Boolean)];
  if (!titles.length) return { error: 'En az bir belge seçin veya yazın.' };
  for (const t of titles) await q('INSERT INTO doc_requests (project_id, client_id, package_id, title, note, due_date, required) VALUES ($1,$2,$3,$4,$5,$6,TRUE)', [w.project_id, w.contractor_id, w.id, t.slice(0, 200), s(f, 'note', 500) || null, d(f, 'due')]);
  await sendMail(w.email, 'NOVAPROJE — Yüklemeniz gereken belgeler', `Sayın ${w.cname},\n\n“${w.pname}” projesindeki “${w.title}” işi için aşağıdaki belgeleri taşeron panelinize yüklemenizi rica ederiz:\n\n${titles.map((t) => '• ' + t).join('\n')}\n\n${siteUrl()}/taseron/belgeler\n\nNOVAPROJE`);
  await log(a, `${titles.length} belge talep etti (taşeron): ${w.title}`); re('/yonetim/taseronlar', '/yonetim/belgeler'); revalidatePath('/taseron', 'layout');
  return { ok: `${titles.length} belge talebi ${w.cname} adlı taşerona gönderildi.` };
}
