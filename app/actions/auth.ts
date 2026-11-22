'use server';
import { redirect } from 'next/navigation';
import { one, q } from '@/lib/db';
import { clientIp, createSession, destroySession, failed, getUser, hashPassword, homeOf, loginOf, succeeded, throttled, verifyPassword } from '@/lib/auth';
import { log } from '@/lib/log';

export type LoginState = { error?: string; ok?: { to: string; name: string; role: string } };
export async function login(_: LoginState, f: FormData): Promise<LoginState> {
  const username = String(f.get('username') || '').trim().toLocaleLowerCase('tr'), password = String(f.get('password') || ''), want = ['admin', 'manager', 'contractor'].includes(String(f.get('kind'))) ? String(f.get('kind')) : 'client';
  if (!username || !password) return { error: 'Kullanıcı adı ve şifrenizi yazın.' };
  const key = clientIp() + ':' + username, wait = throttled(key);
  if (wait) return { error: `Çok sayıda hatalı deneme yapıldı. ${wait} dakika sonra tekrar deneyin.` };
  const u = await one(`SELECT id, name, role, active, password_hash, must_change_password, temp_password_expires_at FROM users WHERE username = $1`, [username]);
  if (!u || !(await verifyPassword(password, u.password_hash))) { failed(key); return { error: 'Kullanıcı adı veya şifre hatalı.' }; }
  if (!u.active) return { error: 'Hesabınız şu anda kapalı. NOVAPROJE ile iletişime geçin.' };
  if (u.must_change_password && u.temp_password_expires_at && new Date(u.temp_password_expires_at) < new Date()) return { error: 'Geçici şifrenizin süresi dolmuş. Yeni şifre için info@novaproje.com adresine yazın.' };
  const LBL: Record<string, string> = { admin: 'Yönetici', client: 'Danışan', manager: 'Portföy yöneticisi', contractor: 'Taşeron' };
  if (u.role !== want) return { error: `Bu hesap için “${LBL[u.role]}” sekmesini kullanın.` };
  succeeded(key); await createSession(u.id); await log({ id: u.id, name: u.name }, 'Giriş yaptı');
  return { ok: { to: homeOf(u.role), name: u.name, role: u.role } };
}
export async function logout() { const u = await getUser(); if (u) await log(u, 'Çıkış yaptı'); await destroySession(); redirect(loginOf(u?.role)); }

export type PwState = { error?: string; ok?: boolean };
export async function changePassword(_: PwState, f: FormData): Promise<PwState> {
  const u = await getUser(); if (!u) redirect('/giris');
  const cur = String(f.get('current') || ''), nx = String(f.get('next') || ''), ag = String(f.get('again') || '');
  if (nx.length < 10) return { error: 'Yeni şifre en az 10 karakter olmalı.' };
  if (!/[a-zA-ZçğıöşüÇĞİÖŞÜ]/.test(nx) || !/\d/.test(nx)) return { error: 'Yeni şifrede en az bir harf ve bir rakam bulunmalı.' };
  if (nx !== ag) return { error: 'Yeni şifre ile tekrarı aynı değil.' };
  if (nx === cur) return { error: 'Yeni şifre mevcut şifreden farklı olmalı.' };
  const r = await one('SELECT password_hash FROM users WHERE id = $1', [u.id]);
  if (!r || !(await verifyPassword(cur, r.password_hash))) return { error: 'Mevcut şifreniz hatalı.' };
  await q('UPDATE users SET password_hash = $1, must_change_password = FALSE, temp_password_expires_at = NULL WHERE id = $2', [await hashPassword(nx), u.id]);
  await log(u, 'Şifresini değiştirdi'); return { ok: true };
}
