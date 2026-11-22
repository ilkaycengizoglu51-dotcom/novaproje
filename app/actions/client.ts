'use server';
import { revalidatePath } from 'next/cache';
import { one, q, tx } from '@/lib/db';
import { clientIp, getUser } from '@/lib/auth';
import { fingerprint } from '@/lib/contract';
import { saveFile } from '@/lib/files';
import { log } from '@/lib/log';
import { adminMail, sendMail, siteUrl } from '@/lib/mail';
import { autoreplySettings } from '@/lib/data';
import { TOPICS } from '@/lib/format';

/* ---------- contracts ---------- */
export type SignState = { error?: string; ok?: boolean };
export async function signContract(_: SignState, f: FormData): Promise<SignState> {
  const u = await getUser(); if (!u) return { error: 'Oturumunuz kapanmış. Yeniden giriş yapın.' };
  const id = Number(f.get('id')), name = String(f.get('name') || '').trim(), img = String(f.get('signature') || '');
  const c = await one('SELECT * FROM contracts WHERE id = $1', [id]); if (!c) return { error: 'Sözleşme bulunamadı.' };
  const asAdmin = u.role === 'admin';
  if (!asAdmin && (c.client_id !== u.id || c.status !== 'gonderildi')) return { error: 'Bu sözleşme şu anda imzalanamaz.' };
  if (asAdmin && c.status !== 'imzalandi') return { error: 'Karşı imza için önce danışanın imzalaması gerekir.' };
  if (name.length < 3) return { error: 'Adınızı ve soyadınızı yazın.' };
  if (!/^data:image\/png;base64,[A-Za-z0-9+/=]{200,}$/.test(img) || img.length > 600000) return { error: 'İmza alanına imzanızı atın.' };
  if (!asAdmin && f.get('read') !== 'on') return { error: 'Sözleşmeyi sonuna kadar okuyup “okudum” kutusunu işaretleyin.' };
  if (!asAdmin && f.get('agree') !== 'on') return { error: 'Elektronik onay beyanını işaretleyin.' };
  const hash = fingerprint(c.title, c.body, c.version), ip = clientIp(), at = new Date().toISOString();
  const sig = { name, img, at, hash, ip };
  if (!asAdmin) {
    await q(`UPDATE contracts SET client_sign = $2, status = 'imzalandi' WHERE id = $1`, [id, JSON.stringify(sig)]);
    await q('INSERT INTO contract_audit (contract_id, who, what, ip) VALUES ($1,$2,$3,$4)', [id, name, `Elektronik olarak imzaladı · parmak izi ${hash.slice(0, 16)}…`, ip]);
    await sendMail(adminMail(), `İmzalandı: ${c.title}`, `${u.name} “${c.title}” sözleşmesini imzaladı. Karşı imza için: ${siteUrl()}/yonetim/sozlesmeler/${id}`);
  } else {
    await q(`UPDATE contracts SET admin_sign = $2, status = 'tamamlandi' WHERE id = $1`, [id, JSON.stringify(sig)]);
    await q('INSERT INTO contract_audit (contract_id, who, what, ip) VALUES ($1,$2,$3,$4)', [id, name, 'NOVAPROJE adına imzaladı · sözleşme tamamlandı', ip]);
    const cl = await one('SELECT name, email, role FROM users WHERE id = $1', [c.client_id]);
    await sendMail(cl?.email, `Sözleşmeniz tamamlandı: ${c.title}`, `Sayın ${cl?.name},\n\n“${c.title}” iki taraf imzasıyla tamamlandı. Panelden görüntüleyebilirsiniz: ${siteUrl()}/${cl?.role === 'contractor' ? 'taseron' : 'panel'}/sozlesmeler/${id}\n\nNOVAPROJE`);
  }
  await log(u, `Sözleşmeyi imzaladı: ${c.title}`);
  revalidatePath('/panel', 'layout'); revalidatePath('/yonetim', 'layout'); revalidatePath('/taseron', 'layout');
  return { ok: true };
}
export async function requestRevision(f: FormData) {
  const u = await getUser(); if (!u || (u.role !== 'client' && u.role !== 'contractor')) return;
  const id = Number(f.get('id')), note = String(f.get('note') || '').trim().slice(0, 2000);
  const c = await one('SELECT * FROM contracts WHERE id = $1', [id]); if (!c || c.client_id !== u.id || c.status !== 'gonderildi' || note.length < 5) return;
  await q(`UPDATE contracts SET status = 'revizyon', revise_note = $2 WHERE id = $1`, [id, note]);
  await q('INSERT INTO contract_audit (contract_id, who, what, ip) VALUES ($1,$2,$3,$4)', [id, u.name, 'Değişiklik talep etti: ' + note, clientIp()]);
  await sendMail(adminMail(), `Revizyon talebi: ${c.title}`, `${u.name}: ${note}\n${siteUrl()}/yonetim/sozlesmeler/${id}`);
  await log(u, `Sözleşme için değişiklik talep etti: ${c.title}`); revalidatePath('/panel', 'layout'); revalidatePath('/taseron', 'layout');
}

/* ---------- documents ---------- */
export type UpState = { error?: string; ok?: string; t?: number };
export async function uploadDocs(_: UpState, f: FormData): Promise<UpState> {
  const u = await getUser(); if (!u) return { error: 'Oturumunuz kapanmış.' };
  const rid = Number(f.get('request')), r = await one('SELECT * FROM doc_requests WHERE id = $1', [rid]);
  const mine = r && (u.role === 'admin' || r.client_id === u.id || (u.role === 'manager' && (await one('SELECT 1 FROM users WHERE id = $1 AND manager_id = $2', [r.client_id, u.id]))));
  if (!r || !mine || r.status === 'onaylandi') return { error: 'Bu belgeye yükleme yapılamaz.' };
  const files = f.getAll('files').filter((x) => x && typeof x !== 'string' && (x as File).size) as File[];
  if (!files.length) return { error: 'Dosya seçin.' };
  const errs: string[] = []; let n = 0;
  for (const file of files) { try { const fid = await saveFile(file, { clientId: r.client_id, uploadedBy: u.id }); if (fid) { await q('INSERT INTO doc_files (request_id, file_id) VALUES ($1,$2)', [rid, fid]); n++; } } catch (e: any) { errs.push(e.message); } }
  if (n) { await q(`UPDATE doc_requests SET status = 'yuklendi', reason = NULL WHERE id = $1`, [rid]); await log(u, `${n} belge yükledi: ${r.title}${u.role === 'manager' ? ' (danışan adına)' : ''}`); await sendMail(adminMail(), `Belge yüklendi: ${r.title}`, `${u.name} “${r.title}” için ${n} dosya yükledi. İnceleme: ${siteUrl()}/yonetim/belgeler`); }
  revalidatePath('/panel/belgeler'); revalidatePath('/yonetim/belgeler'); revalidatePath('/portfoy', 'layout'); revalidatePath('/taseron', 'layout');
  return errs.length ? { error: errs.join(' '), ok: n ? `${n} dosya yüklendi.` : undefined, t: Date.now() } : { ok: `${n} dosya yüklendi. NOVAPROJE inceledikten sonra onaylanacak.`, t: Date.now() };
}
export async function removeDocFile(f: FormData) {
  const u = await getUser(); if (!u) return; const rid = Number(f.get('request')), fid = String(f.get('file'));
  const r = await one('SELECT * FROM doc_requests WHERE id = $1', [rid]); if (!r || r.client_id !== u.id || r.status === 'onaylandi') return;
  await q('DELETE FROM files WHERE id = $1 AND id IN (SELECT file_id FROM doc_files WHERE request_id = $2)', [fid, rid]);
  const left = await one('SELECT count(*)::int AS n FROM doc_files WHERE request_id = $1', [rid]); if (!left?.n) await q(`UPDATE doc_requests SET status = 'bekliyor' WHERE id = $1`, [rid]);
  await log(u, `Belgeden dosya kaldırdı: ${r.title}`); revalidatePath('/panel/belgeler'); revalidatePath('/taseron', 'layout');
}

/* ---------- messages ---------- */
const workHours = () => { const n = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Istanbul' })); const d = n.getDay(), h = n.getHours(); return d >= 1 && d <= 5 && h >= 9 && h < 18; };
const TIP: Record<string, string> = { 'Ödeme': 'Ödeme dekontunuzu bu yazışmaya ekleyebilirsiniz.', 'Belgeler': 'Belgelerinizi “Belgelerim” bölümünden doğrudan da yükleyebilirsiniz.', 'Sözleşme': 'Sözleşmenizi “Sözleşmeler” bölümünden inceleyip imzalayabilirsiniz.', 'Proje süreci': 'Güncel iş programını ana sayfanızda görebilirsiniz.' };
export type MsgOut = { error?: string; msg?: any; auto?: any };
export async function sendMessage(f: FormData): Promise<MsgOut> {
  const u = await getUser(); if (!u) return { error: 'Oturumunuz kapanmış.' };
  const cid = u.role === 'admin' ? Number(f.get('client')) : u.id, body = String(f.get('text') || '').trim().slice(0, 4000);
  const topic = TOPICS.includes(String(f.get('topic'))) ? String(f.get('topic')) : 'Genel';
  const files = f.getAll('files').filter((x) => x && typeof x !== 'string' && (x as File).size) as File[];
  if (!body && !files.length) return { error: 'Mesajınızı yazın.' };
  const client = await one(`SELECT id, name, email FROM users WHERE id = $1 AND role = 'client'`, [cid]); if (!client) return { error: 'Danışan bulunamadı.' };
  const sender = u.role === 'admin' ? 'admin' : 'client';
  const fids: string[] = [];
  try { for (const file of files) { const id = await saveFile(file, { clientId: cid, uploadedBy: u.id }); if (id) fids.push(id); } } catch (e: any) { return { error: e.message }; }
  const msg = await one(`INSERT INTO messages (client_id, sender, author, topic, body) VALUES ($1,$2,$3,$4,$5) RETURNING *`, [cid, sender, sender === 'admin' ? 'NOVAPROJE Proje Ekibi' : u.name, topic, body || '(dosya)']);
  for (const id of fids) await q('INSERT INTO message_files (message_id, file_id) VALUES ($1,$2)', [msg.id, id]);
  msg.files = fids.length ? await q('SELECT id, name, size FROM files WHERE id = ANY($1::uuid[])', [fids]) : [];
  let auto = null;
  if (sender === 'client') {
    await sendMail(adminMail(), `Yeni mesaj: ${client.name}`, `${client.name} (${topic}):\n\n${body}\n\nYanıtla: ${siteUrl()}/yonetim/mesajlar/${cid}`);
    const st = await autoreplySettings();
    const lastAuto = await one(`SELECT created_at FROM messages WHERE client_id = $1 AND sender = 'admin' AND auto ORDER BY created_at DESC LIMIT 1`, [cid]);
    const lastHuman = await one(`SELECT created_at FROM messages WHERE client_id = $1 AND sender = 'admin' AND NOT auto ORDER BY created_at DESC LIMIT 1`, [cid]);
    const recentAuto = lastAuto && Date.now() - new Date(lastAuto.created_at).getTime() < 4 * 3600e3 && (!lastHuman || new Date(lastHuman.created_at) < new Date(lastAuto.created_at));
    if (st.enabled && !recentAuto) {
      let text = String(workHours() ? st.inHours : st.offHours).replace(/\{ad\}/g, client.name.split(' ')[0]); if (TIP[topic]) text += '\n\n' + TIP[topic];
      auto = await one(`INSERT INTO messages (client_id, sender, author, auto, topic, body, created_at) VALUES ($1,'admin','NOVAPROJE Asistan',TRUE,'Genel',$2, now() + interval '2 seconds') RETURNING *`, [cid, text]);
      auto.files = [];
    }
  } else {
    await sendMail(client.email, 'NOVAPROJE’den yeni mesajınız var', `Sayın ${client.name},\n\nProje ekibimiz size yeni bir mesaj gönderdi:\n\n${body}\n\nPanelden yanıtlayabilirsiniz: ${siteUrl()}/panel/mesajlar\n\nNOVAPROJE`);
  }
  await log(u, sender === 'admin' ? `Mesaj gönderdi: ${client.name}` : 'NOVAPROJE’ye mesaj gönderdi');
  return { msg, auto };
}
export async function markRead(cid: number) {
  const u = await getUser(); if (!u) return; const id = u.role === 'admin' ? cid : u.id;
  await q(`UPDATE messages SET read_at = now() WHERE client_id = $1 AND sender <> $2 AND read_at IS NULL AND created_at <= now()`, [id, u.role === 'admin' ? 'admin' : 'client']);
}
