import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createHash, randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { one, q } from './db';

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number, o: object) => Promise<Buffer>;
export const COOKIE = 'np_session';
const DAYS = 7;
export type User = { id: number; username: string; name: string; email: string | null; role: 'admin' | 'client' | 'manager' | 'contractor'; must_change_password: boolean };

export async function hashPassword(pw: string) {
  const salt = randomBytes(16); const h = await scrypt(pw, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$${salt.toString('hex')}$${h.toString('hex')}`;
}
export async function verifyPassword(pw: string, stored: string) {
  const [alg, s, h] = (stored || '').split('$'); if (alg !== 'scrypt' || !s || !h) return false;
  const exp = Buffer.from(h, 'hex'), got = await scrypt(pw, Buffer.from(s, 'hex'), exp.length, { N: 16384, r: 8, p: 1 });
  return got.length === exp.length && timingSafeEqual(got, exp);
}
export function generatePassword(len = 12) {
  const a = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from(randomBytes(len), (b) => a[b % a.length]).join('');
}
const sha = (s: string) => createHash('sha256').update(s).digest('hex');

export async function createSession(userId: number) {
  const token = randomBytes(32).toString('base64url'), expires = new Date(Date.now() + DAYS * 864e5);
  await q('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1,$2,$3)', [sha(token), userId, expires]);
  await q('UPDATE users SET last_login_at = now() WHERE id = $1', [userId]);
  await q('DELETE FROM sessions WHERE expires_at < now()');
  cookies().set(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', expires });
}
export async function destroySession() {
  const t = cookies().get(COOKIE)?.value; if (t) await q('DELETE FROM sessions WHERE token_hash = $1', [sha(t)]);
  cookies().delete(COOKIE);
}
export async function getUser(): Promise<User | null> {
  const t = cookies().get(COOKIE)?.value; if (!t) return null;
  return one<User>(`SELECT u.id, u.username, u.name, u.email, u.role, u.must_change_password FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = $1 AND s.expires_at > now() AND u.active`, [sha(t)]);
}
export const homeOf = (r: string) => (r === 'admin' ? '/yonetim' : r === 'manager' ? '/portfoy' : r === 'contractor' ? '/taseron' : '/panel');
export const loginOf = (r?: string) => (r === 'admin' ? '/giris?tur=yonetici' : r === 'manager' ? '/giris?tur=portfoy' : r === 'contractor' ? '/giris?tur=taseron' : '/giris');
export async function requireClient() { const u = await getUser(); if (!u) redirect('/giris'); if (u.role !== 'client') redirect(homeOf(u.role)); return u; }
export async function requireAdmin() { const u = await getUser(); if (!u) redirect('/giris?tur=yonetici'); if (u.role !== 'admin') redirect(homeOf(u.role)); return u; }
export async function requireContractor() { const u = await getUser(); if (!u) redirect('/giris?tur=taseron'); if (u.role !== 'contractor') redirect(homeOf(u.role)); return u; }
export async function requireManager() { const u = await getUser(); if (!u) redirect('/giris?tur=portfoy'); if (u.role !== 'manager') redirect(homeOf(u.role)); return u; }
export const clientIp = () => headers().get('x-forwarded-for')?.split(',')[0]?.trim() || 'yerel';

const tries = new Map<string, { n: number; until: number }>();
export function throttled(key: string) { const a = tries.get(key); return a && a.until > Date.now() && a.n >= 5 ? Math.ceil((a.until - Date.now()) / 60000) : 0; }
export function failed(key: string) { const a = tries.get(key); if (!a || a.until < Date.now()) tries.set(key, { n: 1, until: Date.now() + 15 * 60000 }); else a.n++; }
export function succeeded(key: string) { tries.delete(key); }
