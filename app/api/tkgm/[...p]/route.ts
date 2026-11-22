import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { TkgmError, byNumber, byPoint, ilceler, iller, mahalleler } from '@/lib/tkgm';
import { log } from '@/lib/log';

export const dynamic = 'force-dynamic';
const hits = new Map<number, number[]>();
const num = (s: string) => (/^\d{1,9}$/.test(s || '') ? Number(s) : NaN);
export async function GET(_: Request, { params }: { params: { p: string[] } }) {
  const u = await getUser();
  if (!u || !['admin', 'manager'].includes(u.role)) return NextResponse.json({ error: 'Bu araç yalnızca yönetici ve portföy yöneticilerine açıktır.' }, { status: 403 });
  const now = Date.now(), l = (hits.get(u.id) || []).filter((t) => now - t < 60000); l.push(now); hits.set(u.id, l);
  if (l.length > 60) return NextResponse.json({ error: 'Çok sık sorgu yapıldı; bir dakika bekleyin.' }, { status: 429 });
  const [kind, a, b, c] = params.p || [];
  try {
    if (kind === 'iller') return NextResponse.json(await iller());
    if (kind === 'ilceler' && !isNaN(num(a))) return NextResponse.json(await ilceler(num(a)));
    if (kind === 'mahalleler' && !isNaN(num(a))) return NextResponse.json(await mahalleler(num(a)));
    if (kind === 'parsel' && !isNaN(num(a)) && /^\d{1,7}$/.test(b || '') && /^\d{1,7}$/.test(c || '')) {
      const r = await byNumber(num(a), b, c); await log(u, `Parsel sorguladı: ${r.info.ozet || `${b}/${c}`} (${r.info.ilce}/${r.info.il})`); return NextResponse.json(r);
    }
    if (kind === 'nokta') {
      const lat = Number(a), lng = Number(b);
      if (!(lat > 35 && lat < 43 && lng > 25 && lng < 45.5)) return NextResponse.json({ error: 'Seçilen nokta Türkiye sınırları dışında.' }, { status: 400 });
      const r = await byPoint(lat, lng); await log(u, `Haritadan parsel sorguladı: ${r.info.ozet} (${r.info.ilce}/${r.info.il})`); return NextResponse.json(r);
    }
    return NextResponse.json({ error: 'Geçersiz sorgu.' }, { status: 400 });
  } catch (e: any) {
    const tk = e instanceof TkgmError;
    return NextResponse.json({ error: tk ? e.message : 'Sorgu sırasında bir hata oluştu.' }, { status: tk ? e.status : 500 });
  }
}
