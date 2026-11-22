import { NextResponse } from 'next/server';
import { one } from '@/lib/db';
import { adminMail, sendMail, siteUrl } from '@/lib/mail';

const hits = new Map<string, number[]>();
const str = (v: unknown, max = 2000) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'x', now = Date.now(), list = (hits.get(ip) || []).filter((t) => now - t < 600000);
  list.push(now); hits.set(ip, list); if (list.length > 5) return NextResponse.json({ error: 'Çok sayıda talep gönderildi. On dakika sonra tekrar deneyin.' }, { status: 429 });
  let b: any; try { b = await req.json(); } catch { return NextResponse.json({ error: 'Form okunamadı.' }, { status: 400 }); }
  if (str(b.website)) return NextResponse.json({ ok: true });
  const d = { name: str(b.name, 120), email: str(b.email, 160), type: str(b.type, 80), parcel: str(b.parcel, 160), cap: str(b.cap, 160), msg: str(b.msg, 4000) };
  if (d.name.length < 3 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email) || d.msg.length < 20 || b.ok !== 'on') return NextResponse.json({ error: 'Formdaki alanları kontrol edin.' }, { status: 422 });
  const r = await one('INSERT INTO quotes (name, email, facility, parcel, capacity, message) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id', [d.name, d.email, d.type || null, d.parcel || null, d.cap || null, d.msg]);
  await sendMail(adminMail(), `Yeni teklif talebi: ${d.name}`, `${d.name} <${d.email}>\nTesis: ${d.type}\nParsel: ${d.parcel}\nKapasite: ${d.cap}\n\n${d.msg}\n\n${siteUrl()}/yonetim/teklifler`);
  await sendMail(d.email, 'NOVAPROJE — Teklif talebiniz alındı', `Sayın ${d.name},\n\nTeklif talebiniz bize ulaştı. Proje bilgilerinizi inceleyip iki iş günü içinde size dönüş yapacağız.\n\nNOVAPROJE Tarımsal Mühendislik`);
  return NextResponse.json({ ok: true, id: r?.id });
}
